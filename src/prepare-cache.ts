import path from 'path'
import { PrepareCacheOptions, glob, FileRef } from '@vercel/build-utils'

import fs from 'fs-extra'
import consola from 'consola'
import { startStep, endStep } from './utils'

async function prepareCache ({ workPath, entrypoint }: PrepareCacheOptions): Promise<Record<string, FileRef>> {
  const entryDir = path.dirname(entrypoint)

  startStep('Collect cache')
  const cache: Record<string, FileRef> = {}
  for (const dir of ['.now_cache', 'node_modules_dev', 'node_modules_prod']) {
    const activeDirectory = path.join(workPath, entryDir, dir)
    if (!fs.existsSync(activeDirectory)) {
      consola.warn(activeDirectory, 'not exists. skipping!')
      continue
    }
    const files = await glob(path.join(entryDir, dir, '**'), workPath)
    consola.info(`${Object.keys(files).length} files collected from ${dir}`)
    Object.assign(cache, files)
  }
  endStep()

  return cache
}

export default prepareCache
