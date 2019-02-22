const path = require('path')
const runBuildLambda = require('./utils/run-build-lambda')

const FOUR_MINUTES = 240000

it('Should build the standard example', async () => {
  const { buildResult } = await runBuildLambda(
    path.join(__dirname, 'fixture')
  )
  // console.log(buildResult)
  expect(buildResult['/']).toBeDefined()

  const filePaths = Object.keys(buildResult)
  expect(filePaths).toMatchSnapshot()
}, FOUR_MINUTES)
