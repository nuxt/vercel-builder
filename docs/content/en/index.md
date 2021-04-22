---
title: Introduction
description: "Easily deploy your SSR Nuxt application on Vercel"
category: Getting started
position: 1
---

`@nuxtjs/vercel-builder` is the ideal way to ship a fast, production-ready [Nuxt application](https://nuxtjs.org) that scales automatically on Vercel when using SSR rendering.

## How it works

This Vercel builder takes a Nuxt application defined by a `nuxt.config` entrypoint and deploys it as a serverless function in a Vercel environment.

It features built-in caching of `node_modules` and the yarn global cache (even with dependency changes!) and multi-stage build for fast and small deployments.

## When to use it

<d-alert type="warning">
This package is only made for SSR applications.
</d-alert>

If you wan't to deploy a statically generated Nuxt application instead, check [this guide from Vercel](https://vercel.com/guides/deploying-nuxtjs-with-vercel) for more information.
