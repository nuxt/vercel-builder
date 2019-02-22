const path = require('path')
const execa = require('execa')
const glob = require('@now/build-utils/fs/glob')

function getNuxtFromPkg(pkg) {
  for (const section of ['dependencies', 'devDependencies']) {
    for (const distro of ['nuxt', 'nuxt-start']) {
      for (const suffix of ['-edge', '']) {
        const name = distro + suffix
        if (pkg[section][name]) {
          return {
            version: pkg[section][name],
            devDependency: section === 'devDependencies',
            start: distro === 'nuxt-start',
            edge: suffix === '-edge'
          }
        }
      }
    }
  }
}

async function exec(cmd, args, { env, ...opts } = {}) {
  args = args.filter(Boolean)

  console.log('Running', cmd, ...args)

  await execa(cmd, args, {
    stdout: process.stdout,
    stderr: process.stderr,
    env: {
      MINIMAL: 1,
      NODE_OPTIONS: '--max_old_space_size=3000',
      ...env
    },
    ...opts
  })
}

function filterFiles(files, filterFn) {
  const newFiles = {}
  for (const fileName in files) {
    if (filterFn(files)) {
      newFiles[fileName] = files[fileName]
    }
  }
  return newFiles
}

function renameFiles(files, renameFn) {
  const newFiles = {}
  for (const fileName in files) {
    newFiles[renameFn(fileName)] = files[fileName]
  }
  return newFiles
}

async function globAndRename(pattern, opts, renameFn) {
  const files = await glob(pattern, opts)
  return renameFiles(files, renameFn)
}

function globAndPrefix(pattern, opts, prefix) {
  return globAndRename(pattern, opts, name => path.join(prefix, name))
}

module.exports = {
  exec,
  getNuxtFromPkg,
  filterFiles,
  renameFiles,
  globAndRename,
  globAndPrefix
}
