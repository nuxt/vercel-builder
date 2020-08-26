![vercel-builder](https://user-images.githubusercontent.com/904724/61308402-7a752d00-a7f0-11e9-9502-23731ccd00fd.png)

# Nuxt.js Vercel Builder

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![packagephobia][packagephobia-src]][packagephobia-href]
[![Github actions status][github-ci-src]][github-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

This Vercel builder takes a [Nuxt.js application](https://nuxtjs.org) defined by a `nuxt.config` entrypoint and deploys it as a serverless function in a Vercel environment.

It features built-in caching of `node_modules` and the yarn global cache (even with dependency changes!) and multi-stage build for fast and small deployments.

## When to use it

If you are using Vercel and need SSR rendering, `@nuxtjs/vercel-builder` is the ideal way to ship a fast, production-ready [Nuxt.js application](https://nuxtjs.org) that scales automatically.

If you do not need SSR rendering, consider deploying a statically generated Nuxt.js application instead. See [this guide from Vercel](https://vercel.com/guides/deploying-nuxtjs-with-vercel) for more information.

You can also find more information on [the Nuxt.js website](https://nuxtjs.org).

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
    title: "My Nuxt.js Application!"
  }
};
```

Then define the build in `now.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "nuxt.config.js",
      "use": "@nuxtjs/vercel-builder"
    }
  ]
}
```

Upon deployment, you will get a URL like this: `https://nuxtjs-8fnzfb1ci.vercel.app`

See [Basic example](./examples/basic) for a more complete deployable example, including an example of how to set up `vercel dev` support.

See [Deploying two Nuxt apps side-by-side](./examples/side-by-side/README.md) for details on deploying two Nuxt apps in one monorepo.

## Using with TypeScript

`vercel-builder` supports TypeScript runtime compilation, though it does so in a slightly different way from `@nuxt/typescript-runtime`. It adds in a pre-compilation step as part of building the lambda for files not compiled by Webpack, such as `nuxt.config.ts`, local modules and serverMiddleware.

References to original TS files in strings outside of `modules` or `serverMiddleware` may therefore cause unexpected errors.

## Configuration

### `serverFiles`

- Type: `Array`

If you need to include files in the server lambda that are not built by webpack or within `static/`, such as a local module or serverMiddleware, you may specify them with this option. Each item can be a glob pattern.

Example:

```json
{
  "builds": [
    {
      "src": "nuxt.config.js",
      "use": "@nuxtjs/vercel-builder",
      "config": {
        "serverFiles": ["server-middleware/**"]
      }
    }
  ]
}
```

### `generateStaticRoutes`

- Type: `Boolean`
- Default: `false`

To pre-render routes during the build using `nuxt generate` set this to true. Routes that are not generated will fallback to the server lambda. You will need to [specify the routes to be generated](https://nuxtjs.org/api/configuration-generate/#routes) in your `nuxt.config`.

Example:

```json
{
  "builds": [
    {
      "src": "nuxt.config.js",
      "use": "@nuxtjs/vercel-builder",
      "config": {
        "generateStaticRoutes": true
      }
    }
  ]
}
```

### `tscOptions`

- Type: `Object`

If you need to pass TypeScript compiler options to override your `tsconfig.json`, you can pass them here. See [the TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for valid options. Example:

```json
{
  "src": "nuxt.config.ts",
  "use": "@nuxtjs/vercel-builder",
  "config": {
    "tscOptions": {
      "sourceMap": false
    }
  }
}
```

You can also include a `tsconfig.now.json` file alongside your `tsconfig.json` file. The `compilerOptions` from those files, along with any `tscOptions` passed through now.json, will be merged and the resulting options used to compile your `nuxt.config.ts`, local modules and serverMiddleware.

## Technical details

### Dependency installation

Package dependencies are installed with either `npm` (if a `package-lock.json` is present) or `yarn`.

**NOTE:** Using `yarn` is HIGHLY recommended due to its [autoclean](https://yarnpkg.com/lang/en/docs/cli/autoclean) functionality , which can decrease lambda size.

### Private npm modules

To install private npm modules, define `NPM_TOKEN` as a [build environment](https://vercel.com/docs/configuration#project/build-env) in `now.json`.

### Node version

The Node version used is the latest 12.x release. Alternatively, you can specify Node 10 in your `package.json` - see [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version).

### `now-build` script support

This builder will run a given [custom build step](https://vercel.com/docs/runtimes?query=now-build#advanced-usage/advanced-node-js-usage/custom-build-step-for-node-js) if you have added a `now-build` key under `scripts` in `package.json`.

## Troubleshooting

### Environment variables

Because of Nuxt.js' [approach to environment variables](https://nuxtjs.org/api/configuration-env#process-env-), environment variables present at build time will be compiled into the lambda. They may also be required at runtime, depending on how you are consuming them.

You may, therefore, need to include them in your `now.json` in both the `env` and `build.env` keys (see [Vercel documentation](https://vercel.com/docs/configuration#project/env)). For example:

```json
  "env": {
    "MY_VARIABLE": true
  },
  "build": {
    "env": {
      "MY_VARIABLE": true
    }
  }
```

If you are using Nuxt 2.13+, it is recommended to use the [new runtimeConfig options](https://nuxtjs.org/guide/runtime-config/) which can decrease this duplication by only requiring that you set the variable once:

```json
  "env": {
    "MY_VARIABLE": true
  }
```

# License

[MIT License](./LICENSE)

Documentation and builder inspired by [Next.js](https://nextjs.org) by [Vercel](https://vercel.com)

Copyright (c) Nuxt Community

<!-- Badges -->

[npm-version-src]: https://flat.badgen.net/npm/dt/@nuxtjs/vercel-builder
[npm-version-href]: https://npmjs.com/package/@nuxtjs/vercel-builder
[npm-downloads-src]: https://flat.badgen.net/npm/v/@nuxtjs/vercel-builder
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/vercel-builder
[github-ci-src]: https://flat.badgen.net//github/checks/nuxt/vercel-builder
[github-ci-href]: https://github.com/nuxt/vercel-builder/actions
[codecov-src]: https://flat.badgen.net/codecov/c/github/nuxt/vercel-builder
[codecov-href]: https://codecov.io/gh/nuxt/vercel-builder
[david-dm-src]: https://flat.badgen.net/david/dep/nuxt/vercel-builder
[david-dm-href]: https://david-dm.org/nuxt/vercel-builder
[standard-js-src]: https://flat.badgen.net/badge/code%20style/standard/f2a
[standard-js-href]: https://standardjs.com
[packagephobia-src]: https://flat.badgen.net/packagephobia/install/@nuxtjs/vercel-builder
[packagephobia-href]: https://packagephobia.now.sh/result?p=@nuxtjs/vercel-builder
