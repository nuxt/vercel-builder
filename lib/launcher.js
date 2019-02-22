const startTime = process.hrtime()

// Load Config
const esm = require('esm')(module, {
  cjs: {
    dedefault: true
  }
})
const nuxtConfig = esm('__NUXT_CONFIG__')

// Create nuxt
const { Nuxt } = require('@nuxt/core__NUXT_SUFFIX__')
const nuxt = new Nuxt({
  _start: true,
  ...nuxtConfig
})

// Create brdige and start listening
const { Server } = require('http') // eslint-disable-line import/order
const { Bridge } = require('./now__bridge.js')
const bridge = new Bridge(new Server((req, res) => {
  nuxt.server.app(req, res)
}))
bridge.listen()

nuxt.ready().then(() => {
  const hrTime = process.hrtime(startTime)
  const hrTimeMs = ((hrTime[0] * 1e9) + hrTime[1]) / 1e6
  console.log(`λ Cold start took: ${hrTimeMs}ms`)
}).catch((error) => {
  console.error('Error while initializing nuxt!', error)
  process.exit(1)
})
