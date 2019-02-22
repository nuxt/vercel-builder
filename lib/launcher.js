process.env.NODE_ENV = 'production'

const { Server } = require('http')
const { Bridge } = require('./now__bridge.js')

const server = new Server((req, res) => {
  res.end('CWD:', process.cwd())
})

const bridge = new Bridge(server)
bridge.listen()

exports.launcher = bridge.launcher
