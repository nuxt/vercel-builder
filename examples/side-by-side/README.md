# Deploying two Nuxt apps side-by-side

The nuxt/now-builder works out of the box for a single nuxt app. In a case where you're trying to deploy two nuxt apps side-by-side, you'll need to add some extra configuration options.

The goal of this, is to run multiple nuxt apps in one now deployment, and allow them to use shared components.

To see this working altogether, check out [a deployable example of two side-by-side apps](./side-by-side-example).

## Setting up this example.

Lets walk through the setup of this side-by-side app. In our case, main app, and separate admin app.

1. now.json should exist at root level.
2. Each app should be in its own folder, at root level.
3. Each individual app should have their own package.json, facilitating their own nuxt build (each app can have different dependancies)
4. If you're using shared components, they should be available in the root folder.

Your project structure should roughly look like so:

```
now.json

-- app/
---- app files...
---- nuxt.config.json

-- admin/
---- app files...
---- nuxt.config.json

-- shared/
---- shared mixins, components, etc
```

### Additional nuxt.config.js setup

In order to customize where each of these apps is built in our nuxt/now-builder, we need to update our nuxt.config.json

The goal here is to change our single app from building to `_nuxt` into two apps, building into `_nuxt/app` and `_nuxt/admin` respectively.

For this to work, we need to update:

- **srcDir** for the app, to match our now builder
- **buildDir** to point to our new build folder
- **lambdaName** there is no need to set this for the main app, but secondary app needs to have a unique lambda name.
- **build.publicPath** this needs to match the route found in our now.json
- **build.extend** to include support for our shared components

#### Updating `app/nuxt.config.json`

This will build our main app to `_nuxt/app`, and serve it at `/` in our now.json routes.

```js
{
  "srcDir": __dirname,
  "buildDir": "_nuxt/app",
  "lambdaName": "index", // main app should be index, not needed here
  "build": {
    // publicPath matches our now.json routes
    "publicPath": "_nuxt/app",
    extend(config) {
      // Add '~/shared' as an alias.
      config.resolve.alias.shared = resolve(__dirname, "../shared");
      config.resolve.alias["~shared"] = resolve(__dirname, "../shared");
    }
  }
}
```

#### Updating `admin/nuxt.config.json`

This is our secondary app, meant to run side-by-side with our main app. This will build to `_nuxt/admin` and serve it at `/admin` in our now.json routes.

```js
{
  "srcDir": __dirname,
  "buildDir": "_nuxt/admin",
  "lambdaName": "admin", // if we don't name our secondary app, builds two index lambdas
  "router": {
    // gotta match our url routing at the app level
    "base": "/admin/"
  },
  "build": {
    // publicPath matches our now.json routes
    "publicPath": "_nuxt/admin",
    extend(config) {
      // Add '~/shared' as an alias.
      config.resolve.alias.shared = resolve(__dirname, "../shared");
      config.resolve.alias["~shared"] = resolve(__dirname, "../shared");
    }
  }
}
```

### Setting up `now.json` for the deploy

The goal here, is two set up two sets of nuxt catch all routes, and forward them to their respective apps.

We have **two builds**, one for each of our apps. These should point to the nuxt.config.js files you prepped above.

Our routes will include:

- Catch all for `/admin/_nuxt/admin/` build file lookups. This will point it to the root `_nuxt/admin` files we built.
- Catch all for `/_nuxt/` routes for main app
- admin main route, for hitting the app directly.
- catch all for admin sub routes, for hitting app pages
- generic catch all, for remaining routes, to feed to our core app.

```json
{
  "version": 2,
  "builds": [
    { "src": "app/nuxt.config.js", "use": "@nuxt/now-builder" },
    { "src": "admin/nuxt.config.js", "use": "@nuxt/now-builder" }
  ],
  "routes": [
    {
      "src": "/admin/_nuxt/(.*)",
      "dest": "/_nuxt/$1",
      "headers": {
        "Cache-Control": "max-age=31557600"
      }
    },
    {
      "src": "/_nuxt/.+",
      "headers": {
        "Cache-Control": "max-age=31557600"
      }
    },
    {
      "src": "^/admin",
      "dest": "/admin"
    },
    {
      "src": "^/admin/(.*)",
      "dest": "/admin"
    },
    {
      "src": "^/(.*)",
      "dest": "/"
    }
  ]
}
```

## Deploy the app.

With this set up, you should be able to `now` and see your two apps live.
