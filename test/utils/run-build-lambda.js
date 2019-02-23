const path = require('path')
const glob = require('@now/build-utils/fs/glob')
const fs = require('fs-extra')

function runAnalyze(wrapper, context) {
  if (wrapper.analyze) {
    return wrapper.analyze(context)
  }

  return 'this-is-a-fake-analyze-result-from-default-analyze'
}

async function runBuildLambda(inputPath) {
  const inputFiles = await glob('**', inputPath)

  const nowJsonRef = inputFiles['now.json']

  const nowJson = require(nowJsonRef.fsPath)

  const build = nowJson.builds[0]

  const entrypoint = build.src.replace(/^\//, '') // Strip leftmost slash

  inputFiles[entrypoint].digest = 'this-is-a-fake-digest-for-non-default-analyze'

  const wrapper = require(build.use)

  const analyzeResult = runAnalyze(wrapper, {
    files: inputFiles,
    entrypoint,
    config: build.config
  })

  const workPath = path.join(__dirname, '../../.tmp', path.basename(inputPath))
  await fs.remove(workPath)
  await fs.mkdirs(workPath)

  const buildResult = await wrapper.build({
    files: inputFiles,
    entrypoint,
    workPath,
    config: build.config
  })

  const cacheResult = await wrapper.prepareCache({
    cachePath: path.join(workPath, '.cache'),
    workPath,
    entrypoint
  })

  return {
    analyzeResult,
    buildResult,
    cacheResult
  }
}

module.exports = runBuildLambda
