---
title: Technicals details
category: "Guide"
position: 5
---

## Monorepos

Just enable the "Include source files outside of the Root Directory in the Build Step" option in the **Root Directory** section within the project settings.

![Vercel monorepo config](/images/monorepo-config.png)

## Private npm modules

To install private npm modules, define `NPM_AUTH_TOKEN` or `NPM_TOKEN` as a [build environment variable](https://vercel.com/docs/configuration#project/build-env) in `vercel.json`.

Alternatively, you can inline your entire `.npmrc` file in a `NPM_RC` environment variable.

## Node version

The Node version used is the latest 14.x release. Alternatively, you can specify Node 12 or 10 in your `package.json` - see [Vercel documentation](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version).

## `vercel-build` script support

This builder will run a given [custom build step](https://vercel.com/docs/runtimes#advanced-usage/advanced-node-js-usage/custom-build-step-for-node-js) if you have added a `vercel-build` key under `scripts` in `package.json`.
