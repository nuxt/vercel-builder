import path from 'path'
import { PrepareCacheOptions, glob, FileRef } from '@now/build-utils'

import fs from 'fs-extra'
import consola from 'consola'
import { startStep, endStep } from './utils'

// Amend below line once https://github.com/zeit/now/issues/2992 is resolved
async function prepareCache ({ prepareCachePath, workPath, entrypoint }: PrepareCacheOptions & { prepareCachePath: string }): Promise<Record<string, FileRef>> {
  const entryDir = path.dirname(entrypoint)
  const rootDir = path.join(workPath, entryDir)
  const cacheDir = path.join(prepareCachePath, entryDir)

  consola.log('Cache dir:', cacheDir)

  startStep('Clean cache')
  await fs.remove(cacheDir)
  await fs.mkdirp(cacheDir)
  endStep()

  startStep('Collect cache')
  const cache: Record<string, FileRef> = {}
  for (const dir of ['.now_cache', 'node_modules_dev', 'node_modules_prod']) {
    const src = path.join(rootDir, dir)
    const dst = path.join(cacheDir, dir)
    if (!fs.existsSync(src)) {
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

export default prepareCache
