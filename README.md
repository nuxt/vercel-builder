![vercel-builder](https://user-images.githubusercontent.com/904724/61308402-7a752d00-a7f0-11e9-9502-23731ccd00fd.png)

# Nuxt Vercel Builder

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![packagephobia][packagephobia-src]][packagephobia-href]
[![Github actions status][github-ci-src]][github-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

`@nuxtjs/vercel-builder` is the ideal way to ship a fast, production-ready [Nuxt application](https://nuxtjs.org) that scales automatically on Vercel when using SSR rendering.

### How it works

This Vercel builder takes a Nuxt application defined by a `nuxt.config.{js|ts}` entrypoint and deploys it as a serverless function in a Vercel environment.

It features built-in caching of `node_modules` and the yarn global cache (even with dependency changes!) and multi-stage build for fast and small deployments.

### When to use it

**This package is only made for SSR applications.**

If you wan't to deploy a statically generated Nuxt application instead, check [this guide from Vercel](https://vercel.com/guides/deploying-nuxtjs-with-vercel) for more information.

## Setup

### Requirements

- A [Nuxt](https://nuxtjs.org) application
- A [Vercel](https://vercel.com) account

### Installation

Add `@nuxtjs/vercel-builder` dependency to your project:

```bash
yarn add @nuxtjs/vercel-builder
# OR
npm install @nuxtjs/vercel-builder
```

**NOTE:** Vercel will use the same package manager than the one used in the project. Using `yarn` is HIGHLY recommended due to its [autoclean](https://yarnpkg.com/lang/en/docs/cli/autoclean) functionality , which can decrease lambda size.

### Configure

Then, create a `vercel.json` file at the root of your project:

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

## Configuration

### `serverFiles`

- Type: `Array`

If you need to include files in the server lambda that are not built by webpack or within `static/`, such as a local module or serverMiddleware, you may specify them with this option. Each item can be a glob pattern.

**Example**

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

### `internalServer`

- Type: `Boolean`
- Default: `false`

If you have defined `serverMiddleware` in your `nuxt.config`, this builder will automatically enable an internal server within the lambda so you can access your own endpoints via `http://localhost:3000`. (This does not affect how you call your endpoints from client-side.)

If you need to enable or disable the internal server manually (for example, if you are adding server middleware via a module), just set `internalServer` within the builder options.

### `generateStaticRoutes`

- Type: `Boolean`
- Default: `false`

To pre-render routes during the build using `nuxt generate` set this to true. Routes that are not generated will fallback to the server lambda. You will need to [specify the routes to be generated](https://nuxtjs.org/api/configuration-generate/#routes) in your `nuxt.config`.

**Example**

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

If you need to pass TypeScript compiler options to override your `tsconfig.json`, you can pass them here. See [the TypeScript documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for valid options.

**Example**

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

You can also include a `tsconfig.vercel.json` file alongside your `tsconfig.json` file. The `compilerOptions` from those files, along with any `tscOptions` passed through vercel.json, will be merged and the resulting options used to compile your `nuxt.config.ts`, local modules and serverMiddleware.

### `memory`

- Type: `Number`

Pass this option if you need to customize the default memory limit of the serverless function that renders your pages.

### `maxDuration`

- Type: `Number`

Pass this option if you need to customize the max duration of the serverless function that renders your pages.

### Environment variables

Because of Nuxt [approach to environment variables](https://nuxtjs.org/api/configuration-env#process-env-), environment variables present at build time will be compiled into the lambda. They may also be required at runtime, depending on how you are consuming them.

**Environment variables are baked in at build time. This means that if you update the variables in the Vercel dashboard, you will need to trigger a deployment again for the changes to take effect.**

You may, therefore, need to include them in your `vercel.json` in both the `env` and `build.env` keys (see [Vercel documentation](https://vercel.com/docs/configuration#project/env)). For example:

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

## Usage with Typescript

`vercel-builder` supports TypeScript runtime compilation, though it does so in a slightly different way from `@nuxt/typescript-runtime`. It adds in a pre-compilation step as part of building the lambda for files not compiled by Webpack, such as `nuxt.config.ts`, local modules and serverMiddleware.

References to original TS files in strings outside of `modules` or `serverMiddleware` may therefore cause unexpected errors.

Don't forget to update your Nuxt config filename in your `vercel.json` file.

## Technical details

### Monorepos

Just enable the "Include source files outside of the Root Directory in the Build Step" option in the **Root Directory** section within the project settings.

![Vercel monorepo config](/images/monorepo-config.png)

### Private npm modules

To install private npm modules, define `NPM_AUTH_TOKEN` or `NPM_TOKEN` as a [build environment variable](https://vercel.com/docs/configuration#project/build-env) in `vercel.json`.

Alternatively, you can inline your entire `.npmrc` file in a `NPM_RC` environment variable.

### Node version

The Node version used is the latest 14.x release. Alternatively, you can specify Node 12 or 10 in your `package.json` - see [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version).

### `vercel-build` script support

This builder will run a given [custom build step](https://vercel.com/docs/runtimes#advanced-usage/advanced-node-js-usage/custom-build-step-for-node-js) if you have added a `vercel-build` key under `scripts` in `package.json`.

## Serverless functions

Inspired by [this article](https://roe.dev/blog/serverless-functions-nuxt-zeit-now) from [Daniel Roe](https://twitter.com/danielcroe).

You'll need to setup a serverMiddleware in an `api` folder and to register it in your vercel config file.

### The serverMiddleware

Add `express` and `bodyParser` to your project dependencies:

```bash
yarn add express bodyParser
# OR
npm install express bodyParser
```

Create an `api` folder at the root of your projet, and then create a file in it, let say `hello.js`.

```js
const express = require("express");
const bodyParser = require("bodyParser);

const app = express();
app.use(bodyParser.json());

// It is important that the full path is specified here
app.post('/api/hello', function (req, res) {
  let { info } = req.body;
  console.log(info);
  res.status(200).json({ info }).end();
});

module.exports = app;
```

## Setup the Vercel config

In your `vercel.json`, add the following:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/hello",
      "dest": "/api/hello.js"
    }
  ],
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder",
      "config": {
        "serverFiles": ["api/**"]
      }
    }
  ]
}
```

## Add it to the Nuxt config

```js
export default {
  serverMiddleware: ["~/api/hello.js"],
};
```

And that's it! You can now go to `http://locahost:3000/api/hello` and see the result!
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
