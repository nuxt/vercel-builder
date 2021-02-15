import type { RequestListener } from 'http'

const startTime = process.hrtime()

let nuxtConfig

// Load Config
try {
  const load = require('jiti')()
  const config = load('__NUXT_CONFIG__').default
  nuxtConfig = config.default || config
} catch {
  const esm = require('esm')(module, {
    cjs: {
      dedefault: true
    }
  })
  nuxtConfig = esm('__NUXT_CONFIG__')
}

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
}).catch((error: string | Error) => {
  // eslint-disable-next-line no-console
  console.error('λ Error while initializing nuxt:', error)
  process.exit(1)
})

// Create bridge and start listening
const { Server } = require('http') as typeof import('http') // eslint-disable-line import/order
const { Bridge } = require('./vercel__bridge.js') as typeof import('@vercel/node-bridge/bridge')

const requestListener: RequestListener = async (req, res) => {
  if (!isReady) {
    await readyPromise
  }
  nuxt.server.app(req, res)
}

// This is used by Vercel
const server = new Server(requestListener)
const bridge = new Bridge(server)
bridge.listen()

// eslint-disable-next-line
if (/* __ENABLE_INTERNAL_SERVER__ */true) {
  // Allow internal calls from Nuxt to endpoints registered as serverMiddleware
  const internalServer = new Server(requestListener)
  internalServer.listen(3000, '127.0.0.1')
}

export const launcher: typeof bridge.launcher = bridge.launcher
