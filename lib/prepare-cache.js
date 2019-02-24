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
  const cache = {}
  for (const dir of ['.now_cache', 'node_modules_dev', 'node_modules_prod']) {
    const src = path.join(rootDir, dir)
    const dst = path.join(cacheDir, dir)
    if (!await fs.exists(src)) {
      consola.warn(src, 'not exists. skipping!')
      continue
    }
    await fs.rename(src, dst)
    const files = await glob(path.join(dir, '**'), cacheDir)
    consola.info(`${Object.keys(files).length} files collected from ${dir}`)
    Object.assign(cache, files)
  }
  endStep()

  return cache
}

module.exports = prepareCache
