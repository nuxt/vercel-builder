# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.16.5](https://github.com/nuxt/now-builder/compare/v0.16.4...v0.16.5) (2019-10-11)


### Bug Fixes

* prepare cache against workCache ([#136](https://github.com/nuxt/now-builder/issues/136)) ([8dfac11](https://github.com/nuxt/now-builder/commit/8dfac11)), closes [#133](https://github.com/nuxt/now-builder/issues/133)
* remove boilerplate routes from example ([#140](https://github.com/nuxt/now-builder/issues/140)) ([d0a50cb](https://github.com/nuxt/now-builder/commit/d0a50cb))
* revert to using cachePath ([#135](https://github.com/nuxt/now-builder/issues/135)) ([da7409e](https://github.com/nuxt/now-builder/commit/da7409e)), closes [#133](https://github.com/nuxt/now-builder/issues/133)
* test for presence of nuxt.config.ts before compile ([a218681](https://github.com/nuxt/now-builder/commit/a218681))

### [0.16.4](https://github.com/nuxt/now-builder/compare/v0.16.3...v0.16.4) (2019-09-11)


### Bug Fixes

* force production NODE_ENV ([7333afa](https://github.com/nuxt/now-builder/commit/7333afa))
* set NODE_ENV to production before building nuxt ([9bbaeac](https://github.com/nuxt/now-builder/commit/9bbaeac)), closes [#126](https://github.com/nuxt/now-builder/issues/126)
* set NODE_ENV to production before building nuxt ([#127](https://github.com/nuxt/now-builder/issues/127)) ([db76f1c](https://github.com/nuxt/now-builder/commit/db76f1c))

### [0.16.3](https://github.com/nuxt/now-builder/compare/v0.16.2...v0.16.3) (2019-09-10)


### Bug Fixes

* consume default export of nuxt config file ([#124](https://github.com/nuxt/now-builder/issues/124)) ([22dff63](https://github.com/nuxt/now-builder/commit/22dff63)), closes [#43](https://github.com/nuxt/now-builder/issues/43)

### [0.16.2](https://github.com/nuxt/now-builder/compare/v0.16.1...v0.16.2) (2019-09-10)


### Bug Fixes

* use new object property from Now ([#122](https://github.com/nuxt/now-builder/issues/122)) ([d01e992](https://github.com/nuxt/now-builder/commit/d01e992)), closes [#111](https://github.com/nuxt/now-builder/issues/111)

### [0.16.1](https://github.com/nuxt/now-builder/compare/v0.16.0...v0.16.1) (2019-08-30)


### Bug Fixes

* fix typescript dependency test ([#118](https://github.com/nuxt/now-builder/issues/118)) ([5d41eee](https://github.com/nuxt/now-builder/commit/5d41eee))



## [0.16.0](https://github.com/nuxt/now-builder/compare/v0.15.3...v0.16.0) (2019-08-30)


### Bug Fixes

* allow installing node 10 dependencies ([#109](https://github.com/nuxt/now-builder/issues/109)) ([20962de](https://github.com/nuxt/now-builder/commit/20962de))
* test for presence of dependencies before accessing ([#116](https://github.com/nuxt/now-builder/issues/116)) ([4fc181d](https://github.com/nuxt/now-builder/commit/4fc181d))


### Features

* add required options for typescript projects ([#110](https://github.com/nuxt/now-builder/issues/110)) ([100e6f4](https://github.com/nuxt/now-builder/commit/100e6f4))
* expose static files as routes ([#106](https://github.com/nuxt/now-builder/issues/106)) ([d66931d](https://github.com/nuxt/now-builder/commit/d66931d))



### [0.15.3](https://github.com/nuxt/now-builder/compare/v0.15.2...v0.15.3) (2019-08-22)


### Features

* add support for yarn workspaces ([#103](https://github.com/nuxt/now-builder/issues/103)) ([a4a7e94](https://github.com/nuxt/now-builder/commit/a4a7e94))

### [0.14.6](https://github.com/nuxt/now-builder/compare/v0.14.5...v0.14.6) (2019-06-29)


### Bug Fixes

* downgrade execa to 1.x ([55b01bb](https://github.com/nuxt/now-builder/commit/55b01bb))



### [0.14.5](https://github.com/nuxt/now-builder/compare/v0.14.4...v0.14.5) (2019-06-29)


### Bug Fixes

* pin @now/node-bridge dependency to 1.2.1 ([#67](https://github.com/nuxt/now-builder/issues/67)) ([72090c6](https://github.com/nuxt/now-builder/commit/72090c6))
* pin all non dev dependencies ([f386391](https://github.com/nuxt/now-builder/commit/f386391))
* use preferLocal: true for execa ([00318b4](https://github.com/nuxt/now-builder/commit/00318b4))



## [0.14.4](https://github.com/nuxt/now-builder/compare/v0.14.3...v0.14.4) (2019-05-27)



## [0.14.3](https://github.com/nuxt/now-builder/compare/v0.14.2...v0.14.3) (2019-04-30)



## [0.14.2](https://github.com/nuxt/now-builder/compare/v0.14.1...v0.14.2) (2019-04-30)


### Bug Fixes

* add package.json to serverFiles ([#21](https://github.com/nuxt/now-builder/issues/21)) ([3b4e3d9](https://github.com/nuxt/now-builder/commit/3b4e3d9))
* allow using nuxt 2.4.0 ([#29](https://github.com/nuxt/now-builder/issues/29)) ([2e096c2](https://github.com/nuxt/now-builder/commit/2e096c2))



## [0.14.1](https://github.com/nuxt/now-builder/compare/v0.14.0...v0.14.1) (2019-04-03)


### Bug Fixes

* read nuxt.config after yarn install. fixes [#26](https://github.com/nuxt/now-builder/issues/26) ([a5a1068](https://github.com/nuxt/now-builder/commit/a5a1068))



# [0.14.0](https://github.com/nuxt/now-builder/compare/v0.13.1...v0.14.0) (2019-04-02)


### Bug Fixes

* resolve buildDir relative to rootDir ([4d56202](https://github.com/nuxt/now-builder/commit/4d56202))


### Features

* wait for nuxt to be ready before render ([#21](https://github.com/nuxt/now-builder/issues/21), [#24](https://github.com/nuxt/now-builder/issues/24)) ([75151ca](https://github.com/nuxt/now-builder/commit/75151ca))



## [0.13.1](https://github.com/nuxt/now-builder/compare/v0.13.0...v0.13.1) (2019-03-23)


### Bug Fixes

* use --no-lock. fixes [#19](https://github.com/nuxt/now-builder/issues/19). ([52b8a89](https://github.com/nuxt/now-builder/commit/52b8a89))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [0.13.0](https://github.com/nuxt/now-builder/compare/v0.12.3...v0.13.0) (2019-02-24)


### Features

* working cache! ([b942a5d](https://github.com/nuxt/now-builder/commit/b942a5d))
