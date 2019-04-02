const { resolve } = require('path')

module.exports = {
  mode: 'universal',

  // We want our admin build to be in a different src than our app build
  srcDir: __dirname,
  buildDir: '_nuxt/app',
  lambdaName: 'index', // main app should be index

  build: {
    publicPath: '_nuxt/app',

    extend(config) {
      // Support ~shared alias
      config.resolve.alias.shared = resolve(__dirname, '../shared')
      config.resolve.alias['~shared'] = resolve(__dirname, '../shared')
    }
  }
}
