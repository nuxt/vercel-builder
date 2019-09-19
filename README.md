![now-builder](https://user-images.githubusercontent.com/904724/61308402-7a752d00-a7f0-11e9-9502-23731ccd00fd.png)

# Now Builder for Nuxt.js

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![packagephobia][packagephobia-src]][packagephobia-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

This Now builder takes a [Nuxt.js application](https://nuxtjs.org), defined by a `nuxt.config.js` entrypoint and deploys it to Now v2 serverless environment.

It features built-in caching of `node_modules` and the yarn global cache (even with dependency changes!) and multi-stage build for fast and small deployments.

## When to use it

If you are using the Now platform, `@nuxtjs/now-builder` is the ideal way to ship a fast, production-ready [Nuxt.js application](https://nuxtjs.org) that scales automatically.

For more information on why you should use Nuxt.js for your project, see [the Nuxt.js website](https://nuxtjs.org).

## How to use it

The first step is to set up a Nuxt.js project.

To get started, make sure you have installed the Nuxt.js dependencies with the following command:

```bash
yarn add nuxt
```

Then, in your project directory, create a `pages` directory with some example pages, for example; the home index page, `pages/index.vue`:

```html
<template>
  <div>
    Works!
  </div>
</template>
```

Create a simple `nuxt.config.js` file:

```js
export default {
  head: {
    title: 'My Nuxt.js Application!',
  },
}
```

Then define the build in `now.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "nuxt.config.js",
      "use": "@nuxtjs/now-builder",
      "config": {}
    }
  ]
}
```

Upon deployment, you will get a URL like this: https://nuxtjs-8fnzfb1ci.now.sh

See [Basic Example](./examples/basic) for a more complete deployable example.

See [Deploying two Nuxt apps side-by-side](./examples/side-by-side/README.md) for details on deploying two nuxt apps in one Now Monorepo.

## Configuration

### `serverFiles`

- Type: `Array`

If you need to include files in the server lambda that are not built by webpack or within `static/`, such as a local module or serverMiddleware, you may specify them with this option. Each item can be a glob pattern.

Example:

```json
{
  "src": "nuxt.config.js",
  "use": "@nuxtjs/now-builder",
  "config": {
    "serverFiles": ["server-middleware/**"]
  }
}
```

## Technical details

### Dependency installation

Package dependencies are installed with either `npm` (if a `package-lock.json` is present) or `yarn`.

**NOTE:** Using `yarn` is HIGHLY recommended due to its [autoclean](https://yarnpkg.com/lang/en/docs/cli/autoclean) functionality , which can decrease lambda size.

### Private npm modules

To install private npm modules, define `NPM_TOKEN` as a [build environment](https://zeit.co/docs/v2/deployments/configuration#build.env) in `now.json`.

### Node.js version

The Node.js version used is the latest **8.x release** or (if your `package.json` specifies Node 10 in `engines`, the latest **10.x release**).

# License

[MIT License](./LICENSE)

Documentation and builder inspired by [Next.js](https://nextjs.org) by [Zeit.co](https://zeit.co)

Copyright (c) Nuxt Community

<!-- Badges -->

[npm-version-src]: https://flat.badgen.net/npm/dt/@nuxtjs/now-builder
[npm-version-href]: https://npmjs.com/package/@nuxtjs/now-builder
[npm-downloads-src]: https://flat.badgen.net/npm/v/@nuxtjs/now-builder
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/now-builder
[circle-ci-src]: https://flat.badgen.net/circleci/github/nuxt/now-builder
[circle-ci-href]: https://circleci.com/gh/nuxt/now-builder
[codecov-src]: https://flat.badgen.net/codecov/c/github/nuxt/now-builder
[codecov-href]: https://codecov.io/gh/nuxt/now-builder
[david-dm-src]: https://flat.badgen.net/david/dep/nuxt/now-builder
[david-dm-href]: https://david-dm.org/nuxt/now-builder
[standard-js-src]: https://flat.badgen.net/badge/code%20style/standard/f2a
[standard-js-href]: https://standardjs.com
[packagephobia-src]: https://flat.badgen.net/packagephobia/install/@nuxtjs/now-builder
[packagephobia-href]: https://packagephobia.now.sh/result?p=@nuxtjs/now-builder
