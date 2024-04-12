import { defineSirocConfig } from 'siroc'

export default defineSirocConfig({
  rollup: {
    external: ['@vercel/build-utils']
  }
})
