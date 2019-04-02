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

// Start nuxt initialization process
let isReady = false
const readyPromise = nuxt.ready().then(() => {
  isReady = true
  const hrTime = process.hrtime(startTime)
  const hrTimeMs = ((hrTime[0] * 1e9) + hrTime[1]) / 1e6
  // eslint-disable-next-line no-console
  console.log(`λ Cold start took: ${hrTimeMs}ms`)
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error('λ Error while initializing nuxt:', error)
  process.exit(1)
})

// Create brdige and start listening
const { Server } = require('http') // eslint-disable-line import/order
const { Bridge } = require('./now__bridge.js')

const bridge = new Bridge(new Server(async (req, res) => {
  if (!isReady) {
    await readyPromise
  }
  nuxt.server.app(req, res)
}))

bridge.server.listen({
  host: '127.0.0.1',
  port: nuxt.options.server.port
})

exports.launcher = bridge.launcher
