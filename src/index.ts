import { build } from './build'
import config from './config'
import prepareCache from './prepare-cache'

// Docs: https://zeit.co/docs/v2/deployments/builders/developer-guide/
module.exports = {
  version: 2,
  build,
  config,
  prepareCache
}
