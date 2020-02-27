const { resolve } = require('path')

module.exports = {
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  generate: {
    routes: [
      '/',
      '/dynamic/1',
      '/dynamic/2'
    ]
  }
}
