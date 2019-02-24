const path = require('path')
const fs = require('fs-extra')
const consola = require('consola')
const { glob, startStep, endStep } = require('./utils')

async function prepareCache({ cachePath, workPath, entrypoint }) {
  const entryDir = path.dirname(entrypoint)
  const rootDir = path.join(workPath, entryDir)
  const cacheDir = path.join(cachePath, entryDir)

  consola.log('Cache dir:', cacheDir)

  startStep('Clean cache')
  await fs.remove(cacheDir)
  await fs.mkdirp(cacheDir)
  endStep()

  startStep('Collect cache')
  await fs.rename(path.join(rootDir, '.now_nuxt_cache'), path.join(cacheDir, '.now_nuxt_cache'))
  const cache = await glob('**', cacheDir)
  consola.info(`${Object.keys(cache).length} cache items collected!`)
  endStep()

  return cache
}

module.exports = prepareCache
