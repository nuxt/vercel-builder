const path = require('path')
const fs = require('fs-extra')

const { createLambda } = require('@now/build-utils/lambda')
const download = require('@now/build-utils/fs/download')
const glob = require('@now/build-utils/fs/glob')
const FileFsRef = require('@now/build-utils/file-fs-ref')
const FileBlob = require('@now/build-utils/file-blob')

const { exec, globAndPrefix } = require('./utils')

async function build({ files, entrypoint, workPath, config: { standalone = false } = {} }) {
  // Create a real filesystem
  await download(files, workPath)

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

  // Change cwd to rootDir
  process.chdir(rootDir)
  console.log('Working directory:', process.cwd())

  // Defaults
  // TODO: Read from nuxt.config
  const publicPath = '_nuxt/' // should NOT have lading slash
  // const routerBase = '/'
  const buildDir = '.nuxt'
  const staticDir = 'static'

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

  // Get nuxt dependency info
  const nuxtVersion = pkg.devDependencies && (pkg.devDependencies.nuxt || pkg.devDependencies['nuxt-edge'])
  if (!nuxtVersion) {
    throw new Error('Either `nuxt` or `nuxt-edge` should be specified in devDependencies inside `package.json`')
  }
  console.log('Nuxt Version:', nuxtVersion)

  // Write .npmrc
  if (process.env.NPM_AUTH_TOKEN) {
    console.log('Found NPM_AUTH_TOKEN in environment, creating .npmrc')
    await fs.writeFile('.npmrc', `//registry.npmjs.org/:_authToken=${process.env.NPM_AUTH_TOKEN}`)
  }

  // Install all dependencies
  console.log('Installing dev dependencies...')
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--frozen-lockfile',
      '--non-interactive',
      '--production=false'
    ])
  } else {
    await exec('npm', [
      'install'
    ])
  }

  // Execute nuxt build
  if (await fs.exists('.nuxt')) {
    console.warn('WARNING: .nuxt already exists')
  }

  await exec('nuxt', [
    'build',
    standalone && '--standalone',
    `--config-file "${nuxtConfigName}"`
  ])

  // Cleanup node_modules and only keep production dependencies
  console.log('Cleaning up node_modules')
  await fs.remove('node_modules')

  console.log('Installing production dependencies...')
  if (isYarn) {
    await exec('yarn', [
      'install',
      '--prefer-offline',
      '--frozen-lockfile',
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

  // Static files
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
  const launcherSrc = await fs.readFile(launcherPath, 'utf8')

  const launcherFiles = {
    'now__launcher.js': new FileBlob({ data: launcherSrc }),
    'now__bridge.js': new FileFsRef({
      fsPath: require('@now/node-bridge')
    }),
    ...serverDistFiles,
    ...nodeModules
  }

  lambdas['/'] = await createLambda({
    handler: 'now__launcher.launcher',
    runtime: 'nodejs8.10',
    files: launcherFiles,
    environment: {}
  })

  return {
    ...lambdas,
    ...staticFiles,
    ...clientDistFiles
  }
}

module.exports = build
