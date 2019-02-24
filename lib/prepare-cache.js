const path = require('path')
const fs = require('fs-extra')
const consola = require('consola')
const { glob, startStep, endStep } = require('./utils')

async function prepareCache({ cachePath, workPath, entrypoint }) {
  const entryDir = path.dirname(entrypoint)
  const cacheDir = path.join(cachePath, entryDir)

  consola.log('Cache dir:', cacheDir)

  startStep('Clean cache')
  await fs.remove(cacheDir)
  await fs.mkdirp(cacheDir)
  endStep()

  startStep('Collect cache')
  if (await fs.exists('/tmp/cache')) {
    await fs.rename('/tmp/cache', path.join(cacheDir, '.now_nuxt_cache'))
  }
  const cache = await glob('**', cacheDir)
  consola.info(`${Object.keys(cache).length} cache items collected!`)
  endStep()

  return cache
}

module.exports = prepareCache
