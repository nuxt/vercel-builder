import path from 'path'
import { SpawnOptions } from 'child_process'

import { glob, Files, PackageJson } from '@vercel/build-utils'
import consola from 'consola'
import jiti from 'jiti'
import execa, { ExecaReturnValue } from 'execa'
import fs from 'fs-extra'

import type { NuxtConfig as NuxtConfiguration } from '@nuxt/types'
import type { IOptions } from 'glob'

type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? Mutable<U>[] : Mutable<T[P]>
}

export type MutablePackageJson = Mutable<PackageJson>

export function exec (cmd: string, args: string[], { env, ...opts }: SpawnOptions = {}): Promise<ExecaReturnValue> {
  args = args.filter(Boolean)

  consola.log('Running', cmd, ...args)

  return execa('npx', [cmd, ...args], {
    stdout: process.stdout,
    stderr: process.stderr,
    preferLocal: false,
    env: {
      MINIMAL: '1',
      NODE_OPTIONS: '--max_old_space_size=3000',
      ...env
    },
    ...opts,
    stdio: Array.isArray(opts.stdio) ? opts.stdio.filter(Boolean) as Array<SpawnOptions['stdio'] extends Array<infer R> ? Array<NonNullable<R>> : never> : opts.stdio
  })
}

/**
 * Read in a JSON file with support for UTF-16 fallback.
 */

export async function readJSON <T = unknown> (filename: string): Promise<T> {
  try {
    return await fs.readJSON(filename)
  } catch {
    return await fs.readJSON(filename, { encoding: 'utf16le' })
  }
}

/**
 * Validate if the entrypoint is allowed to be used
 */
export function validateEntrypoint (entrypoint: string): void {
  const filename = path.basename(entrypoint)

  if (['package.json', 'nuxt.config.js', 'nuxt.config.ts'].includes(filename) === false) {
    throw new Error(
      'Specified "src" for "@nuxtjs/vercel-builder" has to be "package.json", "nuxt.config.js" or "nuxt.config.ts"'
    )
  }
}

// function filterFiles(files, filterFn) {
//   const newFiles = {}
//   for (const fileName in files) {
//     if (filterFn(files)) {
//       newFiles[fileName] = files[fileName]
//     }
//   }
//   return newFiles
// }

export function renameFiles (files: Files, renameFn: (fileName: string) => string): Files {
  const newFiles: Files = {}
  for (const fileName in files) {
    newFiles[renameFn(fileName)] = files[fileName]
  }
  return newFiles
}

export async function globAndRename (pattern: string, opts: IOptions | string, renameFn: (fileName: string) => string): Promise<Files> {
  const files = await glob(pattern, opts)
  return renameFiles(files, renameFn)
}

export function globAndPrefix (pattern: string, opts: IOptions | string, prefix: string): Promise<Files> {
  return globAndRename(pattern, opts, name => path.join(prefix, name))
}

interface NuxtVersion {
  name: string;
  version: string;
  semver: string;
  suffix: string;
  section: string;
}

export function findNuxtDep (pkg: MutablePackageJson): void | NuxtVersion {
  for (const section of ['dependencies', 'devDependencies'] as const) {
    const deps = pkg[section]
    if (deps) {
      for (const suffix of ['-edge', '']) {
        const name = 'nuxt' + suffix
        const version = deps[name]
        if (version) {
          const semver = version.replace(/^[\^~><=]{1,2}/, '')
          return {
            name,
            version,
            semver,
            suffix,
            section
          }
        }
      }
    }
  }
}

export function preparePkgForProd (pkg: MutablePackageJson): NuxtVersion {
  // Ensure fields exist
  if (!pkg.dependencies) {
    pkg.dependencies = {}
  }
  if (!pkg.devDependencies) {
    pkg.devDependencies = {}
  }

  // Find nuxt dependency
  const nuxtDependency = findNuxtDep(pkg)
  if (!nuxtDependency) {
    throw new Error('No nuxt dependency found in package.json')
  }

  // Remove nuxt form dependencies
  for (const distro of ['nuxt', 'nuxt-start']) {
    for (const suffix of ['-edge', '']) {
      delete pkg.dependencies[distro + suffix]
    }
  }

  // Delete all devDependencies
  delete pkg.devDependencies

  // Add @nuxt/core to dependencies
  pkg.dependencies['@nuxt/core' + nuxtDependency.suffix] = nuxtDependency.version

  // Return nuxtDependency
  return nuxtDependency
}

let _step: string | undefined
let _stepStartTime: [number, number] | undefined

const dash = ' ----------------- '

export function hrToMs (hr: [number, number]): number {
  const hrTime = process.hrtime(hr)
  return ((hrTime[0] * 1e9) + hrTime[1]) / 1e6
}

export function endStep (): void {
  if (!_step) {
    return
  }
  if (_step && _stepStartTime) {
    consola.info(`${_step} took: ${hrToMs(_stepStartTime)} ms`)
  }
  _step = undefined
  _stepStartTime = undefined
}

export function startStep (step: string): void {
  endStep()
  consola.log(dash + step + dash)
  _step = step
  _stepStartTime = process.hrtime()
}

export function getNuxtConfig (rootDir: string, nuxtConfigName: string): NuxtConfiguration {
  const load = jiti()
  const nuxtConfigFile = load(path.resolve(rootDir, nuxtConfigName))
  return nuxtConfigFile.default || nuxtConfigFile
}

export function getNuxtConfigName (rootDir: string): string {
  for (const filename of ['nuxt.config.ts', 'nuxt.config.js']) {
    if (fs.existsSync(path.resolve(rootDir, filename))) {
      return filename
    }
  }
  throw new Error(`Can not read nuxt.config from ${rootDir}`)
}

export async function prepareNodeModules (entrypointPath: string, namespaceDir: string): Promise<void> {
  const modulesPath = path.join(entrypointPath, 'node_modules')

  try {
    const namespacedPath = path.join(entrypointPath, namespaceDir)
    if (fs.existsSync(namespacedPath)) {
      consola.log(`Using cached ${namespaceDir}`)
    }
    try {
      if (fs.existsSync(modulesPath)) {
        await fs.unlink(modulesPath)
      }
      await fs.mkdirp(namespaceDir)
    } catch {
      if (fs.existsSync(namespacedPath)) {
        fs.rmdirSync(modulesPath, { recursive: true })
      } else {
        fs.moveSync(modulesPath, namespacedPath)
      }
      await fs.mkdirp(namespaceDir)
    }
    await fs.symlink(namespaceDir, modulesPath)
  } catch (e) {
    consola.log(`Error linking/unlinking ${namespaceDir}.`, e)
  }
}

export async function backupNodeModules (entrypointPath: string, namespaceDir: string): Promise<void> {
  const modulesPath = path.join(entrypointPath, 'node_modules')

  try {
    const namespacedPath = path.join(entrypointPath, namespaceDir)
    const stats = await fs.stat(modulesPath)
    if (!stats.isSymbolicLink()) {
      await fs.rm(namespacedPath, { force: true, recursive: true })
      await fs.move(modulesPath, namespacedPath)
    }
  } catch (e) {
    consola.log(`Error backing up node_modules to ${namespaceDir}.`, e)
  }
}
