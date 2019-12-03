import { resolve } from 'path'
import thing from './another'

module.exports = {
  env: {
    thing
  },
  rootDir: resolve(__dirname, '../..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  buildModules: ['@nuxt/typescript-build'],
  modules: ['~/modules/module.ts'],
  typescript: {
    typeCheck: {
      tsconfig: resolve(__dirname, './tsconfig.json')
    }
  }
}
