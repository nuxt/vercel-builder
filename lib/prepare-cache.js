const path = require('path')
const fs = require('fs-extra')
const consola = require('consola')
const { glob, startStep, endStep } = require('./utils')

async function prepareCache({ cachePath, workPath, entrypoint }) {
  consola.log('Preparing cache ...')

  const entryDir = path.dirname(entrypoint)
  const rootDir = path.join(workPath, entryDir)
  const cacheDir = path.join(cachePath, entryDir)

  consola.log('Cache dir:', cacheDir)

  consola.log('Clearing old cache ...')
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
  startStep('Cache ' + dir)
  await fs.rename(path.join(rootDir, dir), path.join(cacheDir, dir))
  const result = glob(path.join(dir, '**'), cacheDir)
  endStep()
  return result
}

module.exports = prepareCache
