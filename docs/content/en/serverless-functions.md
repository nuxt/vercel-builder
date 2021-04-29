---
title: Serverless functions
category: "Guide"
position: 6
---

Inspired by [this article](https://roe.dev/blog/serverless-functions-nuxt-zeit-now) from [Daniel Roe](https://twitter.com/danielcroe).

You'll need to setup a serverMiddleware in an `api` folder and to register it in your vercel config file.

## The serverMiddleware

Add `express` and `bodyParser` to your project dependencies:

<d-code-group>
  <d-code-block label="Yarn" active>

```bash
yarn add express bodyParser
```

  </d-code-block>
  <d-code-block label="NPM">

```bash
npm install express bodyParser
```

  </d-code-block>
</d-code-group>

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
