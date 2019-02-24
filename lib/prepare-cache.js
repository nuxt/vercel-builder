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

  startStep('Clean cache')
  await fs.remove(cacheDir)
  await fs.mkdirp(cacheDir)
  endStep()

  startStep('Collect cache')
  const yarnCache = await moveAndCache('.yarn-cache', rootDir, cacheDir)
  endStep()

  return {
    ...yarnCache
  }
}

async function moveAndCache(dir, rootDir, cacheDir) {
  await fs.rename(path.join(rootDir, dir), path.join(cacheDir, dir))

  const result = await glob(path.join(dir, '**'), cacheDir)
  const count = Object.keys(result).length
  consola.info(`${count} cache items found in: ${dir}`)

  return result
}

module.exports = prepareCache
