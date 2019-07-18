const path = require('path')
const runBuildLambda = require('./utils/run-build-lambda')

const FOUR_MINUTES = 240000

it('Should build the standard example', async () => {
  const { buildResult } = await runBuildLambda(
    path.join(__dirname, 'fixture')
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
