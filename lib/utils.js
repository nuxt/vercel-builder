const path = require('path')
const execa = require('execa')
const glob = require('@now/build-utils/fs/glob')

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

// function filterFiles(files, filterFn) {
//   const newFiles = {}
//   for (const fileName in files) {
//     if (filterFn(files)) {
//       newFiles[fileName] = files[fileName]
//     }
//   }
//   return newFiles
// }

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

function findNuxtDep(pkg) {
  for (const section of ['dependencies', 'devDependencies']) {
    for (const suffix of ['-edge', '']) {
      const name = 'nuxt' + suffix
      const version = pkg[section][name]
      if (version) {
        return {
          name,
          version,
          suffix,
          section
        }
      }
    }
  }
}

function preparePkgForProd(pkg) {
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
  for (const suffix of ['-edge', '']) {
    delete pkg.dependencies['nuxt' + suffix]
  }

  // Delete all devDependencies
  delete pkg.devDependencies

  // Add @nuxt/core to dependencies
  pkg.dependencies['@nuxt/core' + nuxtDependency.suffix] = nuxtDependency.version

  // Return nuxtDependency
  return nuxtDependency
}

module.exports = {
  exec,
  // filterFiles,
  renameFiles,
  glob,
  globAndRename,
  globAndPrefix,
  preparePkgForProd
}
