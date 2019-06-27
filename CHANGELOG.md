#### 0.1.0 (2019-06-27)

##### Chores

*  add test coverage reports ([51136a59](https://github.com/lykmapipo/redis-common/commit/51136a59a9ee396dba5d64f7b787c01f4ea651f2))
*  fix mocha test exit ([b7ed22cc](https://github.com/lykmapipo/redis-common/commit/b7ed22cc11cd8c3bac6cb0de3f7d3bc1e9e981c0))
* **deps:**  force latest version & audit fix ([382541eb](https://github.com/lykmapipo/redis-common/commit/382541ebe4541a1c732ebe3665f0e500a99f57bf))
* **setup:**
  *  add common dependencies ([5d8de4d0](https://github.com/lykmapipo/redis-common/commit/5d8de4d0f5f257cf5a02ebec59a5c4b1d2287e76))
  *  initialize ([3251afa1](https://github.com/lykmapipo/redis-common/commit/3251afa1c24c983612a255f65cd499998fc2eab0))

##### Documentation Changes

*  update usage docs ([7700ed52](https://github.com/lykmapipo/redis-common/commit/7700ed521b0c5770acd5e8ac7489082821f09652))
*  update usage docs ([465422f5](https://github.com/lykmapipo/redis-common/commit/465422f5537fa950832e463b6dd82e1d8e4a2a5c))
*  make as WIP ([18af2a55](https://github.com/lykmapipo/redis-common/commit/18af2a55391d25a9a46f36ef7b242d45ea3d004f))

##### New Features

*  add key count helper ([27e83b3e](https://github.com/lykmapipo/redis-common/commit/27e83b3ee68a9f571db5dd67ac572da7ecb31e13))
*  add info to obtain server info ([53f6eefd](https://github.com/lykmapipo/redis-common/commit/53f6eefd605ad4770398968d5182fc8371fd47c7))
*  implement generic get ([c841e603](https://github.com/lykmapipo/redis-common/commit/c841e60374eccdddca1a385248bfae2a4ee5de66))
*  implement generic set command ([fce6cb4c](https://github.com/lykmapipo/redis-common/commit/fce6cb4c47d55ac711a7eaeb70e032182e8080f1))
*  implement clear helper ([3dc37fa8](https://github.com/lykmapipo/redis-common/commit/3dc37fa81f02014307efb49b7af3bbb6959dbaa4))
*  implement keys to obtain redis keys by given pattern ([39ccfcac](https://github.com/lykmapipo/redis-common/commit/39ccfcac68786cee6f2d2318fe5c5ce1efc50f53))
*  implement createMulti to create redis multi command ([94486859](https://github.com/lykmapipo/redis-common/commit/944868597d961905a683d35caebadb9938d45ac2))
*  implement key helper to generate storage key ([742e3eab](https://github.com/lykmapipo/redis-common/commit/742e3eab1f6355a1015be71e894ab9f96ab29d12))
*  implement quit for all available clients ([09bc7520](https://github.com/lykmapipo/redis-common/commit/09bc7520a1c415cf1486fe404cda9cfc1bb97f4f))
*  implement createClients ([968cd6cb](https://github.com/lykmapipo/redis-common/commit/968cd6cbb43b565b5f95837da71edae7d26c9df1))
*  implement createPubSub to create redis pubsub clients ([669f7483](https://github.com/lykmapipo/redis-common/commit/669f748382eb259f46ddca8353f5c4cd46982894))
*  implement createPubSub clients ([0fcaf86d](https://github.com/lykmapipo/redis-common/commit/0fcaf86d99220acf5cef7e45cbcbc58c93ffc3f5))
*  ensure single client per process ([24bda14f](https://github.com/lykmapipo/redis-common/commit/24bda14f556b8c80ae8a2612101bd91e4125a14a))
*  implement createClient ([b2887aa1](https://github.com/lykmapipo/redis-common/commit/b2887aa1e79dc3f3163d988feed54a3b3650d86f))
*  implement wittDefaults to provide default options ([ec472019](https://github.com/lykmapipo/redis-common/commit/ec4720198e2c3b9af24c64a138b953e08bf3713a))

##### Bug Fixes

*  ensure prefix on keys querying ([d3eaefcd](https://github.com/lykmapipo/redis-common/commit/d3eaefcd01b9325e2f97b414ded773e9ba4f0448))

##### Refactors

*  use string template on LUA script create ([c0ead4c1](https://github.com/lykmapipo/redis-common/commit/c0ead4c168e45deddce124c306480cde90140860))
*  unsubscribe and remove listeners from all clients on quit ([3e7f06d8](https://github.com/lykmapipo/redis-common/commit/3e7f06d82965918840284dacab62a4fa4930e1c6))
*  split pattern with separator before fetch keys ([9e69af8d](https://github.com/lykmapipo/redis-common/commit/9e69af8d7b374a0a49451f25387b297d74f0401a))
*  allow key pattern on fetching keys ([e1b24234](https://github.com/lykmapipo/redis-common/commit/e1b242347b342bee7ce903a04045d41749639d49))
*  rename id to uuid ([3f56e422](https://github.com/lykmapipo/redis-common/commit/3f56e42265c1856078db563c9a8f4484b60bccdb))

##### Code Style Changes

*  add clear lua script todo ([f0ea7523](https://github.com/lykmapipo/redis-common/commit/f0ea752383432c47561d079ab5d01f90643477c1))
*  add clear lua script todo ([73bdb602](https://github.com/lykmapipo/redis-common/commit/73bdb602edf9d30177cb92520d5b79d2950e9882))
*  improve set jsdocs ([3c9e94de](https://github.com/lykmapipo/redis-common/commit/3c9e94dea17ff1188ba5204352abf807d36c8383))
*  improve jsdocs ([39f54b73](https://github.com/lykmapipo/redis-common/commit/39f54b73c67dca077deb258b8be57a7fc1f119a7))

##### Tests

*  ensure no publisher and subscriber client recreation ([3afc809a](https://github.com/lykmapipo/redis-common/commit/3afc809a70abdc824b6a9e7a7e89c661c5f0723e))
*  createClient with given options ([8436f6b1](https://github.com/lykmapipo/redis-common/commit/8436f6b1ddd6395e6b00a053e86032166c453b04))
