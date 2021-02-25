const path = require('path')
const fs = require('fs')
const rc9 = require('rc9')
const runBuildLambda = require('./utils/run-build-lambda')

const FOUR_MINUTES = 240000

it('Should build the standard example', async () => {
  process.env.VERCEL_ANALYTICS_ID = 'test'
  const { buildResult, workPath } = await runBuildLambda(
    path.join(__dirname, 'fixture')
  )
  delete process.env.VERCEL_ANALYTICS_ID

  const { output, routes } = buildResult

  // Lambda
  expect(output.index).toBeDefined()
  expect(routes).toBeDefined()

  // Build files
  const buildFiles = [
    'test.txt',
    '_nuxt/LICENSES',
    'now-build'
  ]
  for (const file of buildFiles) {
    expect(output[file]).toBeDefined()
  }

  const nuxtrc = rc9.read({ name: '.nuxtrc', dir: path.resolve(workPath, 'www') })
  expect(nuxtrc.buildModules).toMatchObject([/@nuxtjs\/web-vitals/])
  expect(fs.existsSync(path.resolve(workPath, 'www/.nuxt/vitals.client.js')))
}, FOUR_MINUTES)

it('Should build a Typescript example', async () => {
  const { buildResult } = await runBuildLambda(
    path.join(__dirname, 'fixture-ts')
  )

  const { output, routes } = buildResult
  // Lambda
  expect(output.index).toBeDefined()
  expect(routes).toBeDefined()

  // Build files
  const buildFiles = [
    'test.txt',
    '_nuxt/LICENSES'
  ]
  for (const file of buildFiles) {
    expect(output[file]).toBeDefined()
  }
}, FOUR_MINUTES)

it('Should build the standard example with generated files', async () => {
  const { buildResult } = await runBuildLambda(
    path.join(__dirname, 'fixture-generated')
  )

  const { output, routes } = buildResult
  // Lambda
  expect(output.index).toBeDefined()
  expect(routes).toBeDefined()

  // Generated files
  const generatedFiles = [
    'index.html',
    'dynamic/1/index.html',
    'dynamic/2/index.html'
  ]

  for (const file of generatedFiles) {
    expect(output[file]).toBeDefined()
  }
}, FOUR_MINUTES)
