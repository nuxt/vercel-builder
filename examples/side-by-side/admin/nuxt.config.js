const { resolve } = require('path')

module.exports = {
  mode: 'universal',

  // We want our admin build to be in a different src than our app build
  srcDir: __dirname,
  buildDir: '_nuxt/admin',
  lambdaName: 'admin',
  router: {
    base: '/admin/'
  },

  build: {
    // I have set this up to be specifically at root...
    publicPath: '_nuxt/admin',

    // add support for ~/shared
    extend(config) {
      // Add '~/shared' as an alias.
      config.resolve.alias.shared = resolve(__dirname, '../shared')
      config.resolve.alias['~shared'] = resolve(__dirname, '../shared')
    }
  }
}
