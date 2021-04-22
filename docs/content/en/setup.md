---
title: Setup
description: "Learn how to setup the package in your Nuxt app"
category: "Getting started"
position: 2
---

## Requirements

- A [Nuxt](https://nuxtjs.org) application
- A [Vercel](https://vercel.com) account

## Installation

Add `@nuxtjs/vercel-builder` dependency to your project:

<d-code-group>
  <d-code-block label="Yarn (recommended)" active>

```bash
yarn add @nuxtjs/vercel-builder
```

  </d-code-block>
  <d-code-block label="NPM">

```bash
npm install @nuxtjs/vercel-builder
```

  </d-code-block>
</d-code-group>

**NOTE:** Vercel will use the same package manager than the one used in the project. Using `yarn` is HIGHLY recommended due to its [autoclean](https://yarnpkg.com/lang/en/docs/cli/autoclean) functionality , which can decrease lambda size.

## Configure

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
