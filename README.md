# Now Builder for Nuxt.js

The Now Nuxt.js Builder takes a [Nuxt.js application](https://nuxtjs.org), defined by a `nuxt.config.js` entrypoint and deploys it to Now2 serverless environment.

It features built-in caching of `node_modules` and all multi-stage build for fast and small-sized deployments.

## When to use it

If you are using Now platform, `@nuxtjs/now-builder` is the ideal way to ship a fast, production-ready [Nuxt.js application](https://nuxtjs.org) that scales automatically.

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
    title: 'My Nuxt.js Application!'
  }
}
```

Then define builds and routes in `now.json` configuration file:

```json
{
  "version": 2,
  "builds": [
    { "src": "nuxt.config.js", "use": "@nuxtjs/now-builder" }
  ],
  "routes": [
    { "src": "/_nuxt/.+", "headers": { "cache-control": "s-maxage=31536000" } },
    { "src": "/(.*).(.*)" },
    { "src": "/(.*)", "dest": "/"}
  ]
}
```

Upon deployment, you will get a URL like this: https://nuxtjs-8fnzfb1ci.now.sh

See [example](./example) for a more complete deployable example.

## Technical Details

### Dependencies installation

The installation algorithm of dependencies works as follows:

- If a `package-lock.json` is present, `npm install` is used
- Otherwise, `yarn` is used.

**NOTE:** Using `yarn` is HIGHLY recommanded!

### Private npm modules

To install private npm modules, define `NPM_TOKEN` as a [build environment](https://zeit.co/docs/v2/deployments/configuration#build.env) in `now.json`.

### Node.js version

The Node.js version used is the latest in the **8 branch**.

# License

Docs and Builder inspired by [Next.js](https://nextjs.org) by [Zeit.co](https://zeit.co).

MIT - Nuxt.js Team
