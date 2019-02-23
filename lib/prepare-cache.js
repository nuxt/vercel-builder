const path = require('path')
const fs = require('fs-extra')
const glob = require('@now/build-utils/fs/glob.js')

async function prepareCache({ cachePath, workPath, entrypoint }) {
  console.log('Preparing cache ...')

  const entryDir = path.dirname(entrypoint)
  const rootDir = path.join(workPath, entryDir)
  const cacheDir = path.join(cachePath, entryDir)

  console.log('Cache dir:', cacheDir)

  console.log('Clearing old cache ...')
  await fs.remove(cacheDir)
  await fs.mkdirp(cacheDir)

  await fs.rename(path.join(rootDir, 'node_modules_dev'), cacheDir)
  const devModules = await glob(path.join(cacheDir, 'node_modules_dev/{**,!.*,.yarn*}'), cacheDir)

  await fs.rename(path.join(rootDir, 'node_modules_prod'), cacheDir)
  const prodModules = await glob(path.join(cacheDir, 'node_modules_prod/{**,!.*,.yarn*}'), cacheDir)

  return {
    ...devModules,
    ...prodModules
  }
}

module.exports = prepareCache
