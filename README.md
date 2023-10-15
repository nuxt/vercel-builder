![vercel-builder](https://user-images.githubusercontent.com/904724/61308402-7a752d00-a7f0-11e9-9502-23731ccd00fd.png)

# Nuxt Vercel Builder

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![packagephobia][packagephobia-src]][packagephobia-href]
[![Github actions status][github-ci-src]][github-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

> ⚠️ This is a _legacy builder_ and only works for Nuxt 2. We'd strongly recommend using [Nuxt Bridge](https://github.com/nuxt/bridge) or [Nuxt 3](https://nuxt.com/docs/getting-started/introduction), which use the latest Vercel features instead.

---

`@nuxtjs/vercel-builder` allows you ship a fast, production-ready [Nuxt 2 application](https://nuxtjs.org) that scales automatically on Vercel when using SSR rendering.

### When to use it

**This package is only made for Nuxt 2 SSR applications - and you probably do not need to use it.**

👉 If you want to deploy a statically generated Nuxt 2 application instead, Vercel is a zero configuration provider. Check [this guide from Vercel](https://vercel.com/guides/deploying-nuxtjs-with-vercel) for more information.

👉 If you want to deploy a Nuxt Bridge or Nuxt 3 app, Vercel deployment will work with zero configuration. Check [this guide](https://nitro.unjs.io/deploy/providers/vercel) for more information.

⚠️ We would advise you migrate your app to Nuxt 3, which features a much superior integration with Vercel using their latest Build API.

### How it works

This Vercel builder takes a Nuxt application defined by a `nuxt.config.js` (or `.ts`) entrypoint and deploys it as a serverless function in a Vercel environment.

It features built-in caching of `node_modules` and the global yarn cache (even when dependencies change) and a multi-stage build for fast and small deployments.

## Setup

All you need is a [Nuxt](https://nuxtjs.org) application and a [Vercel](https://vercel.com) account.

Then, simply create a `vercel.json` file at the root of your project:

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

**NOTE:** When installing your dependencies, Vercel will use the same package manager that is used in the project. Using `yarn` is **highly** recommended due to its [autoclean](https://yarnpkg.com/lang/en/docs/cli/autoclean) functionality, which can decrease lambda size.

## Examples

See [Basic example](./examples/basic) for a more complete deployable example, including an example of how to set up `vercel dev` support.

See [Deploying two Nuxt apps side-by-side](./examples/side-by-side/README.md) for details on deploying two Nuxt apps in one monorepo.

## Configuration

### `serverFiles`

- Type: `Array`

If you need to include files in the server lambda that are not built by webpack (or within `static/`), such as a local module or serverMiddleware, you may specify them with this option. Each item can be a glob pattern.

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

#### `env`

If you are [accessing environment variables via `env`](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-env#process-env-) within your Nuxt build, then they will be **baked in at build time**. This means that if you update the variables in the Vercel dashboard, you will need to trigger a deployment again for the changes to take effect. You must include these variables in `build.env` in your `vercel.json` (see below).

#### `runtimeConfig`

If you are using Nuxt 2.13+, it is recommended to use the [new runtimeConfig options](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-runtime-config) instead.

#### Exposing variables

There are two environments where you may need to expose environment variables within `vercel.json`. They are `env` (for _runtime_ variables) and `build.env` (for _build-time_ variables, which may not be required for `runtimeConfig`). See [Vercel documentation](https://vercel.com/docs/cli#project-configuration/env). For example:

```json
{
  "env": {
    "MY_VARIABLE": true
  },
  "build": {
    "env": {
      "MY_VARIABLE": true
    }
  }
}
```

Finally, note that if you want to access Vercel's [system environment variables](https://vercel.com/docs/environment-variables#system-environment-variables), you may want ensure that system environment variables are automatically exposed.

## Usage with Typescript

`vercel-builder` supports TypeScript runtime compilation. It adds in a pre-compilation step as part of building the lambda for files not compiled by Webpack, such as `nuxt.config.ts`, local modules and serverMiddleware.

References to original TS files in strings outside of `modules` or `serverMiddleware` may therefore cause unexpected errors.

Don't forget to update your Nuxt config filename in your `vercel.json` file.

## Technical details

### Monorepos

Just enable the "Include source files outside of the Root Directory in the Build Step" option in the **Root Directory** section within the project settings.

![Vercel monorepo config](/docs/monorepo-config.png)

### Private npm modules

To install private npm modules, define `NPM_AUTH_TOKEN` or `NPM_TOKEN` as a [build environment variable](https://vercel.com/docs/configuration#project/build-env) in `vercel.json`.

Alternatively, you can inline your entire `.npmrc` file in a `NPM_RC` environment variable.

### Node.js version

The newest available Node.js version is automatically selected. If your packages depend on a particular major release Node.js version, you can specify the version in your `package.json` - see [Vercel documentation](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js#node.js-version).

### `vercel-build` script support

This builder will run a given [custom build step](https://vercel.com/docs/runtimes#advanced-usage/advanced-node-js-usage/custom-build-step-for-node-js) if you have added a `vercel-build` key under `scripts` in `package.json`.

## Deploying additional serverless functions

You can also deploy additional serverless functions _alongside_ your Nuxt application.

### serverMiddleware

Create an `api` folder at the root of your project, and then create a file in it, for example `hello.js`:

```js
import express from 'express'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())

// It is important that the full path is specified here
app.post('/api/hello', function(req, res) {
  const { info } = req.body
  console.log(info)
  res
    .status(200)
    .json({ info })
    .end()
})

export default app
```

### Setup the Vercel config

In your `vercel.json`, add your additional endpoints:

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

### Add it to the Nuxt config

If you want to interact with this API whilst developing your Nuxt app, you can add it to your `serverMiddleware` conditionally.

```js
export default {
  serverMiddleware:
    process.env.NODE_ENV === 'production' ? [] : ['~/api/hello.js'],
}
```

And that's it! You can now go to `http://locahost:3000/api/hello` and see the result! In production the endpoint will be handled with Vercel, but locally Nuxt will manage it for you.

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
