import path from 'path'
import resolveFrom from 'resolve-from'
import fs from 'fs-extra'
import { gte, gt } from 'semver'
import consola from 'consola'
import esm from 'esm'

import { createLambda, download, FileFsRef, FileBlob, glob, getNodeVersion, getSpawnOptions, BuildOptions, Route, Lambda, File, PackageJson } from '@now/build-utils'

import { exec, validateEntrypoint, globAndPrefix, preparePkgForProd, startStep, endStep } from './utils'

interface BuilderOutput {
  watch?: string[];
  output: Record<string, Lambda | File | FileFsRef>;
  routes: Route[];
}

export async function build ({ files, entrypoint, workPath, config = {}, meta = {} }: BuildOptions): Promise<BuilderOutput> {
  // ----------------- Prepare build -----------------
  startStep('Prepare build')

  // Validate entrypoint
  validateEntrypoint(entrypoint)

  // Entry directory
  const entryDir = path.dirname(entrypoint)
  // Compute rootDir
  const rootDir = path.join(workPath, entryDir)

  // Create a real filesystem
  consola.log('Downloading files...')
  await download(files, workPath, meta)

  // Change cwd to rootDir
  process.chdir(rootDir)
  consola.log('Working directory:', process.cwd())

  // Read package.json
  let pkg: PackageJson
  try {
    pkg = await fs.readJson('package.json')
  } catch (e) {
    throw new Error(`Can not read package.json from ${rootDir}`)
  }

  // Node version
  const nodeVersion = await getNodeVersion(rootDir)
  const spawnOpts = getSpawnOptions(meta, nodeVersion)
  if (!spawnOpts.env) {
    spawnOpts.env = {}
  }

  const usesTypescript = pkg.dependencies && (Object.keys(pkg.dependencies).includes('@nuxt/typescript-build') || Object.keys(pkg.dependencies).includes('@nuxt/typescript'))
  if (usesTypescript) {
    spawnOpts.env.NODE_PRESERVE_SYMLINKS = '1'
  }

  if (usesTypescript && (fs.existsSync('tsconfig.json'))) {
    let tsConfig
    try {
      tsConfig = await fs.readJson('tsconfig.json')
    } catch (e) {
      throw new Error(`Can not read tsconfig.json from ${rootDir}`)
    }
    tsConfig.exclude = [ ...tsConfig.exclude, 'node_modules_dev', 'node_modules_prod' ]
    await fs.writeJSON('tsconfig.json', tsConfig)
  }

  // Detect npm (prefer yarn)
  const isYarn = !fs.existsSync('package-lock.json')
  consola.log('Using', isYarn ? 'yarn' : 'npm')

  // Write .npmrc
  if (process.env.NPM_AUTH_TOKEN) {
    consola.log('Found NPM_AUTH_TOKEN in environment, creating .npmrc')
    await fs.writeFile('.npmrc', `//registry.npmjs.org/:_authToken=${process.env.NPM_AUTH_TOKEN}`)
  }

  // Write .yarnclean
  if (isYarn && !fs.existsSync('.yarnclean')) {
    await fs.copyFile(path.join(__dirname, '.yarnclean'), '.yarnclean')
  }

  // Cache dir
  const cacheDir = path.resolve(rootDir, '.now_cache')
  await fs.mkdirp(cacheDir)

  const yarnCacheDir = path.join(cacheDir, 'yarn')
  await fs.mkdirp(yarnCacheDir)

  // ----------------- Install devDependencies -----------------
  startStep('Install devDependencies')

  // Prepare node_modules
  await fs.mkdirp('node_modules_dev')
  if (fs.existsSync('node_modules')) {
    await fs.unlink('node_modules')
  }
  await fs.symlink('node_modules_dev', 'node_modules')

  // Install all dependencies
  spawnOpts.env.NODE_ENV = 'development'
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--frozen-lockfile',
      '--non-interactive',
      '--production=false',
      `--modules-folder=${rootDir}/node_modules`,
      `--cache-folder=${yarnCacheDir}`
    ], spawnOpts)
  } else {
    await exec('npm', [ 'install' ], spawnOpts)
  }

  // ----------------- Nuxt build -----------------
  startStep('Nuxt build')

  // Read nuxt.config.js
  const _esm = esm(module)
  const nuxtConfigName = 'nuxt.config.js'
  let nuxtConfigFile = _esm(path.resolve(rootDir, nuxtConfigName))
  nuxtConfigFile = nuxtConfigFile.default || nuxtConfigFile

  // Read options from nuxt.config.js otherwise set sensible defaults
  const staticDir = (nuxtConfigFile.dir && nuxtConfigFile.dir.static) ? nuxtConfigFile.dir.static : 'static'
  const publicPath = ((nuxtConfigFile.build && nuxtConfigFile.build.publicPath) ? nuxtConfigFile.build.publicPath : '/_nuxt/').replace(/^\//, '')
  const buildDir = nuxtConfigFile.buildDir ? path.relative(rootDir, nuxtConfigFile.buildDir) : '.nuxt'
  const lambdaName = nuxtConfigFile.lambdaName ? nuxtConfigFile.lambdaName : 'index'

  // Execute nuxt build
  if (fs.existsSync(buildDir)) {
    consola.warn(buildDir, 'exists! Please ensure to ignore it with `.nowignore`')
  }

  await exec('nuxt', [
    'build',
    '--standalone',
    '--no-lock', // #19
    `--config-file "${nuxtConfigName}"`
  ], spawnOpts)

  // ----------------- Install dependencies -----------------
  startStep('Install dependencies')

  // Use node_modules_prod
  await fs.mkdirp('node_modules_prod')
  if (fs.existsSync('node_modules')) {
    await fs.unlink('node_modules')
  }
  await fs.symlink('node_modules_prod', 'node_modules')

  // Only keep core dependency
  const nuxtDep = preparePkgForProd(pkg)
  await fs.writeJSON('package.json', pkg)

  spawnOpts.env.NODE_ENV = 'production'
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--pure-lockfile',
      '--non-interactive',
      '--production=true',
      `--modules-folder=${rootDir}/node_modules`,
      `--cache-folder=${yarnCacheDir}`
    ], spawnOpts)
  } else {
    await exec('npm', [ 'install' ], spawnOpts)
  }

  // Validate nuxt version
  const nuxtPkg = require(resolveFrom(rootDir, `@nuxt/core${nuxtDep.suffix}/package.json`))
  if (!gte(nuxtPkg.version, '2.4.0')) {
    throw new Error(`nuxt >= 2.4.0 is required, detected version ${nuxtPkg.version}`)
  }
  if (gt(nuxtPkg.version, '3.0.0')) {
    consola.warn('WARNING: nuxt >= 3.0.0 is not tested against this builder!')
  }

  // Cleanup .npmrc
  if (process.env.NPM_AUTH_TOKEN) {
    await fs.unlink('.npmrc')
  }

  // ----------------- Collect artifacts -----------------
  startStep('Collect artifacts')

  // Static files
  const staticFiles = await glob('**', path.join(rootDir, staticDir))

  // Client dist files
  const clientDistDir = path.join(rootDir, buildDir, 'dist/client')
  const clientDistFiles = await globAndPrefix('**', clientDistDir, publicPath)

  // Server dist files
  const serverDistDir = path.join(rootDir, buildDir, 'dist/server')
  const serverDistFiles = await globAndPrefix('**', serverDistDir, path.join(buildDir, 'dist/server'))

  // node_modules_prod
  const nodeModulesDir = path.join(rootDir, 'node_modules_prod')
  const nodeModules = await globAndPrefix('**', nodeModulesDir, 'node_modules')

  // Lambdas
  const lambdas: Record<string, Lambda> = {}

  const launcherPath = path.join(__dirname, 'launcher.js')
  const launcherSrc = (await fs.readFile(launcherPath, 'utf8'))
    .replace(/__NUXT_SUFFIX__/g, nuxtDep.suffix)
    .replace(/__NUXT_CONFIG__/g, './' + nuxtConfigName)

  const launcherFiles = {
    'now__launcher.js': new FileBlob({ data: launcherSrc }),
    'now__bridge.js': new FileFsRef({ fsPath: require('@now/node-bridge') }),
    [nuxtConfigName]: new FileFsRef({ fsPath: path.resolve(rootDir, nuxtConfigName) }),
    ...serverDistFiles,
    ...nodeModules
  }

  // Extra files to be included in lambda
  const serverFiles = [
    ...(Array.isArray(config.serverFiles) ? config.serverFiles : []),
    'package.json'
  ]

  for (const pattern of serverFiles) {
    const files = await glob(pattern, rootDir)
    Object.assign(launcherFiles, files)
  }

  // lambdaName will be titled index, unless specified in nuxt.config.js
  lambdas[lambdaName] = await createLambda({
    handler: 'now__launcher.launcher',
    runtime: meta.isDev ? 'nodejs' : nodeVersion.runtime,
    files: launcherFiles,
    environment: {
      NODE_ENV: 'production'
    }
  })

  // await download(launcherFiles, rootDir)

  endStep()

  return {
    output: {
      ...lambdas,
      ...clientDistFiles,
      ...staticFiles
    },
    routes: [
      { src: `/${publicPath}.+`, headers: { 'Cache-Control': 'max-age=31557600' } },
      ...Object.keys(staticFiles).map(file => ({ src: `/${file}`, headers: { 'Cache-Control': 'max-age=31557600' } })),
      { src: '/(.*)', dest: '/' }
    ]
  }
}
