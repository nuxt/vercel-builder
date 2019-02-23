const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')

const { createLambda } = require('@now/build-utils/lambda')
const download = require('@now/build-utils/fs/download')
const FileFsRef = require('@now/build-utils/file-fs-ref')
const FileBlob = require('@now/build-utils/file-blob')

const { exec, globAndPrefix, preparePkgForProd, glob } = require('./utils')

async function build({ files, entrypoint, workPath, config = {} }) {
  console.log('Starting build...')

  // Entry directory
  const entryDir = path.dirname(entrypoint)
  console.log('Entry directory:', entryDir)

  // Validate entrypoint
  const nuxtConfigName = path.basename(entrypoint)
  if (!/^nuxt\.config\./.test(nuxtConfigName)) {
    throw new Error('Entrypoint should point to the nuxt.config')
  }

  // Compute rootDir
  const rootDir = path.join(workPath, entryDir)

  // Create a real filesystem
  console.log('Downloading files...')
  await download(files, workPath)

  // Change cwd to rootDir
  process.chdir(rootDir)
  console.log('Working directory:', process.cwd())

  // Read package.json
  let pkg
  try {
    pkg = await fs.readJson('package.json')
  } catch (e) {
    throw new Error('Can not read `package.json` from workDir')
  }

  // Detect npm (prefer yarn)
  const isYarn = !fs.existsSync('package-lock.json')
  console.log('Using', isYarn ? 'yarn' : 'npm')

  // Write .npmrc
  if (process.env.NPM_AUTH_TOKEN) {
    console.log('Found NPM_AUTH_TOKEN in environment, creating .npmrc')
    await fs.writeFile('.npmrc', `//registry.npmjs.org/:_authToken=${process.env.NPM_AUTH_TOKEN}`)
  }

  // Write .yarnclean
  if (isYarn && !await fs.exists('.yarnclean')) {
    await fs.copyFile(path.join(__dirname, '.yarnclean'), '.yarnclean')
  }

  // Check if cache exists
  if (await fs.exists('node_modules_dev')) {
    console.log('Cache detected from previous build...')
  }

  // Prepare node_modules
  await fs.mkdirp('node_modules_dev')
  await fs.mkdirp('node_modules_prod')
  if (await fs.exists('node_modules')) {
    await fs.unlink('node_modules')
  }
  await fs.symlink('node_modules_dev', 'node_modules')

  // Install all dependencies
  console.log('Installing dev dependencies...')
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--frozen-lockfile',
      '--pure-lockfile',
      '--non-interactive',
      '--production=false'
    ], { env: { NODE_ENV: 'development' } })
  } else {
    await exec('npm', [
      'install'
    ], { env: { NODE_ENV: 'development' } })
  }

  // Execute nuxt build
  if (await fs.exists('.nuxt')) {
    console.warn('WARNING: .nuxt already exists')
  }

  await exec('nuxt', [
    'build',
    '--standalone',
    `--config-file "${nuxtConfigName}"`
  ])

  // Use node_modules_prod
  await fs.unlink('node_modules')
  await fs.symlink('node_modules_prod', 'node_modules')

  // Only keep core dependency
  const nuxtDep = preparePkgForProd(pkg)
  await fs.writeJSON('package.json', pkg)

  // Validate nuxt version
  if (!semver.gt(nuxtDep.version, '2.4.0')) {
    throw new Error('nuxt >= 2.4.0 is required!')
  }
  if (semver.gt(nuxtDep.version, '3.0.0')) {
    console.warn('WARNING: nuxt >= 3.0.0 is not tested against this builder!')
  }

  console.log('Installing production dependencies...')
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--frozen-lockfile',
      '--pure-lockfile',
      '--non-interactive',
      '--production=true'
    ], { env: { NODE_ENV: 'production' } })
  } else {
    await exec('npm', [
      'install'
    ], { env: { NODE_ENV: 'production' } })
  }

  // Cleanup .npmrc
  if (process.env.NPM_AUTH_TOKEN) {
    await fs.unlink('.npmrc')
  }

  // TODO: Read from nuxt.config
  const publicPath = '_nuxt/' // should NOT have lading slash
  const buildDir = '.nuxt'
  const staticDir = 'static'

  // Static files
  const staticFilesLambda = await globAndPrefix('**', path.join(rootDir, staticDir), 'static')
  const staticFiles = await glob('**', path.join(rootDir, staticDir))

  // Client dist files
  const clientDistDir = path.join(rootDir, buildDir, 'dist/client')
  const clientDistFiles = await globAndPrefix('**', clientDistDir, publicPath)

  // Sever dist files
  const serverDistDir = path.join(rootDir, buildDir, 'dist/server')
  const serverDistFiles = await globAndPrefix('**', serverDistDir, path.join(buildDir, 'dist/server'))

  // Node_modules
  const nodeModulesDir = path.join(rootDir, 'node_modules')
  const nodeModules = await globAndPrefix('**', nodeModulesDir, 'node_modules')

  // Lambdas
  const lambdas = {}

  const launcherPath = path.join(__dirname, 'launcher.js')
  const launcherSrc = (await fs.readFile(launcherPath, 'utf8'))
    .replace(/__NUXT_SUFFIX__/g, nuxtDep.suffix)
    .replace(/__NUXT_CONFIG__/g, './' + nuxtConfigName)

  const launcherFiles = {
    'now__launcher.js': new FileBlob({ data: launcherSrc }),
    'now__bridge.js': new FileFsRef({ fsPath: require('@now/node-bridge') }),
    [nuxtConfigName]: new FileFsRef({ fsPath: path.resolve(rootDir, nuxtConfigName) }),
    ...staticFilesLambda,
    ...serverDistFiles,
    ...nodeModules
  }

  // Extra files to be included in lambda
  if (config.serverFiles) {
    for (const pattern of config.serverFiles) {
      const files = await glob(pattern, rootDir)
      Object.assign(launcherFiles, files)
    }
  }

  lambdas.index = await createLambda({
    handler: 'now__launcher.launcher',
    runtime: 'nodejs8.10',
    files: launcherFiles,
    environment: {
      NODE_ENV: 'production'
    }
  })

  // await download(launcherFiles, rootDir)

  return {
    ...lambdas,
    ...clientDistFiles,
    ...staticFiles
  }
}

module.exports = build
