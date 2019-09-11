import { SpawnOptions } from 'child_process'
import path from 'path'
import { ExecaReturns } from 'execa'
import fs from 'fs-extra'
import replaceInFile from 'replace-in-file'

import { PackageJson } from '@now/build-utils/dist'

import { getNuxtConfig, getNuxtConfigName, exec } from './utils'

interface CompileTypescriptOptions {
    spawnOpts: SpawnOptions;
    rootDir: string;
}

interface PrepareTypescriptOptions {
    pkg: PackageJson;
    spawnOpts: SpawnOptions;
    rootDir: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function prepareTypescriptEnvironment ({ pkg, spawnOpts, rootDir }: PrepareTypescriptOptions): Promise<void> {
  spawnOpts = { ...spawnOpts, env: { ...spawnOpts.env, NODE_PRESERVE_SYMLINKS: '1' } }

  if ((fs.existsSync('tsconfig.json'))) {
    let tsConfig
    try {
      tsConfig = await fs.readJson('tsconfig.json')
    } catch (e) {
      throw new Error(`Can not read tsconfig.json from ${rootDir}`)
    }
    tsConfig.exclude = [ ...(tsConfig.exclude || []), 'node_modules_dev', 'node_modules_prod' ]
    await fs.writeJSON('tsconfig.json', tsConfig)
  }

  //   Edit dependencies
  if (pkg.dependencies && Object.keys(pkg.dependencies).includes('@nuxt/typescript-runtime')) {
    delete pkg.dependencies['@nuxt/typescript-runtime']
  }
}

export async function compileTypescriptBuildFiles ({ rootDir, spawnOpts }: CompileTypescriptOptions): Promise<ExecaReturns[]> {
  const nuxtConfigName = getNuxtConfigName(rootDir)
  if (nuxtConfigName === 'nuxt.config.ts') {
    await exec('tsc', [nuxtConfigName], spawnOpts)
  }
  const nuxtConfigFile = getNuxtConfig(rootDir, 'nuxt.config.js')
  const { serverMiddleware, modules } = nuxtConfigFile

  const filesToCompile = [
    ...(serverMiddleware || []),
    ...(modules || [])
  ].reduce((filesToCompile, item) => {
    let itemPath = ''
    if (typeof item === 'string') {
      itemPath = item
    } else if (typeof item === 'object' && Array.isArray(item)) {
      itemPath = item[0]
    } else if (typeof item === 'object' && typeof item.handler === 'string') {
      itemPath = item.handler
    }
    if (itemPath) {
      itemPath = itemPath.replace(/^[@~]\//, './').replace(/\.ts$/, '')
      const resolvedPath = path.resolve(rootDir, itemPath)
      if (fs.existsSync(`${resolvedPath}.ts`)) {
        filesToCompile.push(resolvedPath)
        replaceInFile.sync({
          files: path.resolve(rootDir, 'nuxt.config.js'),
          from: new RegExp(`(?<=['"])${itemPath}.ts(?=['"])`, 'g'),
          to: itemPath
        })
      }
    }
    return filesToCompile
  }, [] as string[])
  return Promise.all(
    filesToCompile.map(file => exec('tsc', [file]))
  )
}
