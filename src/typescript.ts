import path from 'path'

import { glob, FileFsRef, PackageJson } from '@vercel/build-utils'
import fs from 'fs-extra'
import replaceInFile from 'replace-in-file'

import { exec, getNuxtConfig, getNuxtConfigName, readJSON } from './utils'

import type { SpawnOptions } from 'child_process'

export interface JsonOptions { [key: string]: number | boolean | string | Array<number | boolean | string> }

interface CompileTypescriptOptions {
    spawnOpts: SpawnOptions;
    rootDir: string;
    tscOptions?: JsonOptions;
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
    let tsConfig: Record<string, any> & { exclude: string[] }
    try {
      tsConfig = await readJSON('tsconfig.json')
    } catch (e) {
      throw new Error(`Can not read tsconfig.json from ${rootDir}`)
    }
    tsConfig.exclude = [...(tsConfig.exclude || []), 'node_modules_dev', 'node_modules_prod']
    await fs.writeJSON('tsconfig.json', tsConfig)
  }

  //   Edit dependencies
  if (pkg.dependencies && Object.keys(pkg.dependencies).includes('@nuxt/typescript-runtime')) {
    delete pkg.dependencies['@nuxt/typescript-runtime']
  }
}

async function readAndMergeOptions (filename: string, rootDir: string, options: JsonOptions): Promise<JsonOptions> {
  let newOptions: JsonOptions = options
  if (fs.existsSync(filename)) {
    let tsConfig: { compilerOptions?: JsonOptions }
    try {
      tsConfig = await readJSON(filename)
    } catch (e) {
      throw new Error(`Can not read ${filename} from ${rootDir}`)
    }
    newOptions = { ...tsConfig.compilerOptions, ...options }
  }
  return newOptions
}

async function getTypescriptCompilerOptions (rootDir: string, options: JsonOptions = {}): Promise<string[]> {
  let compilerOptions: string[] = []

  const sources = [
    'tsconfig.json',
    'tsconfig.vercel.json',
    'tsconfig.now.json'
  ]

  for (const source of sources) {
    options = await readAndMergeOptions(source, rootDir, options)
  }

  compilerOptions = Object.keys(options).reduce((compilerOptions, option) => {
    if (compilerOptions && !['rootDirs', 'paths', 'outDir', 'rootDir', 'noEmit'].includes(option)) {
      compilerOptions.push(`--${option}`, String(options[option]))
    }
    return compilerOptions
  }, [] as string[])
  return [...compilerOptions, '--noEmit', 'false', '--rootDir', rootDir, '--outDir', 'now_compiled']
}

export async function compileTypescriptBuildFiles ({ rootDir, spawnOpts, tscOptions }: CompileTypescriptOptions): Promise<{ [filePath: string]: FileFsRef }> {
  const nuxtConfigName = getNuxtConfigName(rootDir)
  const compilerOptions = await getTypescriptCompilerOptions(rootDir, tscOptions)
  await fs.mkdirp('now_compiled')
  await exec('tsc', [...compilerOptions, nuxtConfigName], spawnOpts)
  const nuxtConfigFile = getNuxtConfig(rootDir, 'now_compiled/nuxt.config.js')
  const { serverMiddleware, modules } = nuxtConfigFile

  const filesToCompile: string[] = [
    ...(serverMiddleware || []),
    ...(modules || [])
  ].reduce((filesToCompile, item) => {
    let itemPath = ''
    if (typeof item === 'string') {
      itemPath = item
    } else if (typeof item === 'object' && Array.isArray(item)) {
      if (typeof item[0] === 'string') {
        itemPath = item[0]
      }
      // We do not need to handle inline modules
    } else if (typeof item === 'object' && typeof item.handler === 'string') {
      itemPath = item.handler
    }
    if (itemPath) {
      const srcDir = nuxtConfigFile.srcDir ? (path.relative(rootDir, nuxtConfigFile.srcDir)).replace('now_compiled', '.') : '.'
      const resolvedPath = path.resolve(rootDir, itemPath.replace(/^[@~]\//, `${srcDir}/`).replace(/\.ts$/, ''))
      if (fs.existsSync(`${resolvedPath}.ts`)) {
        filesToCompile.push(resolvedPath)
        replaceInFile.sync({
          files: path.resolve(rootDir, 'now_compiled/nuxt.config.js'),
          from: new RegExp(`(?<=['"\`])${itemPath}(?=['"\`])`, 'g'),
          to: itemPath.replace(/\.ts$/, '')
        })
      }
    }
    return filesToCompile
  }, [] as string[])
  await Promise.all(
    filesToCompile.map(file => exec('tsc', [...compilerOptions, file]))
  )
  const files = await glob('**', path.join(rootDir, 'now_compiled'))
  Object.keys(files).forEach((filename) => {
    const compiledPath = files[filename].fsPath
    const newPath = compiledPath.replace('/now_compiled/', '/')
    fs.moveSync(compiledPath, newPath, { overwrite: true })
    files[filename].fsPath = newPath
  })
  return files
}
