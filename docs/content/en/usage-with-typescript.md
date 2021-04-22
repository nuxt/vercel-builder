---
title: Usage with Typescript
description: "Discover how you can use Typescript"
category: "Guide"
position: 4
---

`vercel-builder` supports TypeScript runtime compilation, though it does so in a slightly different way from `@nuxt/typescript-runtime`. It adds in a pre-compilation step as part of building the lambda for files not compiled by Webpack, such as `nuxt.config.ts`, local modules and serverMiddleware.

References to original TS files in strings outside of `modules` or `serverMiddleware` may therefore cause unexpected errors.

Don't forget to update your Nuxt config filename in your `vercel.json` file.