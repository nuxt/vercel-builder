---
title: Configuration
description: "Discover the options"
category: "Guide"
position: 3
---

## `serverFiles`

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

## `internalServer`

- Type: `Boolean`
- Default: `false`

If you have defined `serverMiddleware` in your `nuxt.config`, this builder will automatically enable an internal server within the lambda so you can access your own endpoints via `http://localhost:3000`. (This does not affect how you call your endpoints from client-side.)

If you need to enable or disable the internal server manually (for example, if you are adding server middleware via a module), just set `internalServer` within the builder options.

## `generateStaticRoutes`

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

## `tscOptions`

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

## `memory`

- Type: `Number`

Pass this option if you need to customize the default memory limit of the serverless function that renders your pages.

## `maxDuration`

- Type: `Number`

Pass this option if you need to customize the max duration of the serverless function that renders your pages.

## Environment variables

Because of Nuxt' [approach to environment variables](https://nuxtjs.org/api/configuration-env#process-env-), environment variables present at build time will be compiled into the lambda. They may also be required at runtime, depending on how you are consuming them.

<d-alert type="warning">
Environment variables are baked in at build time. This means that if you update the variables in the Vercel dashboard, you will need to trigger a deployment again for the changes to take effect.
</d-alert>

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
