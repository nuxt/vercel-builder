const build = require('./build')
const config = require('./config')
const prepareCache = require('./prepare-cache')

// Docs: https://zeit.co/docs/v2/deployments/builders/developer-guide/
module.exports = {
  version: 2,
  build,
  config,
  prepareCache
}
