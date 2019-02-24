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
  for (const dir of ['.now_nuxt_cache', '.node_modules_dev', '.node_modules_prod']) {
    await fs.rename(path.join(rootDir, dir), path.join(cacheDir, dir))
  }
  const cache = await glob('**', cacheDir)
  consola.info(`${Object.keys(cache).length} cache items collected!`)
  endStep()

  return cache
}

module.exports = prepareCache
