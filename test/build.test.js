const path = require('path')
const runBuildLambda = require('./utils/run-build-lambda')

const FOUR_MINUTES = 240000

it('Should build the standard example', async () => {
  const { buildResult } = await runBuildLambda(
    path.join(__dirname, 'fixture')
  )

  // Lambda
  expect(buildResult.index).toBeDefined()

  // Build files
  const buildFiles = [
    'test.txt',
    '_nuxt/LICENSES'
  ]
  for (const file of buildFiles) {
    expect(buildResult[file]).toBeDefined()
  }
}, FOUR_MINUTES)
