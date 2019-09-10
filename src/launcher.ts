import { IncomingMessage, ServerResponse } from 'http'
import esmCompiler from 'esm'

const startTime = process.hrtime()

// Load Config
const esm = esmCompiler(module, {
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
}).catch((error: string | Error) => {
  // eslint-disable-next-line no-console
  console.error('λ Error while initializing nuxt:', error)
  process.exit(1)
})

// Create bridge and start listening
const { Server } = require('http') // eslint-disable-line import/order
const { Bridge } = require('./now__bridge.js')

const server = new Server(async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  if (!isReady) {
    await readyPromise
  }
  nuxt.server.app(req, res)
})
const bridge = new Bridge(server)

bridge.listen()

export const launcher = bridge.launcher
