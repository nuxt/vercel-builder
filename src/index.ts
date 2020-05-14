import { build } from './build'
import config from './config'
import prepareCache from './prepare-cache'

// Docs: https://github.com/zeit/now/blob/master/DEVELOPING_A_RUNTIME.md
module.exports = {
  version: 2,
  build,
  config,
  prepareCache
}
