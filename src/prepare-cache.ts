import { PrepareCacheOptions, glob, Files } from '@vercel/build-utils'
import consola from 'consola'

import { startStep, endStep } from './utils'

async function prepareCache ({ workPath }: PrepareCacheOptions): Promise<Files> {
  startStep('Collect cache')

  const cache: Files = {}
  for (const dir of ['.nuxt', '.vercel_cache', 'node_modules_dev', 'node_modules_prod']) {
    const files = await glob(`**/${dir}/**`, workPath)
    consola.info(`${Object.keys(files).length} files collected from ${dir}`)
    Object.assign(cache, files)
  }
  endStep()

  return cache
}

export default prepareCache
