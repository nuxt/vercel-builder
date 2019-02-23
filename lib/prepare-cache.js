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

  const devModules = await moveAndCache('node_modules_dev', rootDir, cacheDir)
  const prodModules = await moveAndCache('node_modules_prod', rootDir, cacheDir)

  return {
    ...devModules,
    ...prodModules
  }
}

async function moveAndCache(dir, rootDir, cacheDir) {
  await fs.rename(path.join(rootDir, dir), path.join(cacheDir, dir))
  return glob(path.join(cacheDir, dir, '**'), cacheDir)
}

module.exports = prepareCache
