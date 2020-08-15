# redis-common

[![Build Status](https://travis-ci.org/lykmapipo/redis-common.svg?branch=master)](https://travis-ci.org/lykmapipo/redis-common)
[![Dependencies Status](https://david-dm.org/lykmapipo/redis-common.svg)](https://david-dm.org/lykmapipo/redis-common)
[![Coverage Status](https://coveralls.io/repos/github/lykmapipo/redis-common/badge.svg?branch=master)](https://coveralls.io/github/lykmapipo/redis-common?branch=master)
[![GitHub License](https://img.shields.io/github/license/lykmapipo/redis-common)](https://github.com/lykmapipo/redis-common/blob/develop/LICENSE)

[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![npm version](https://img.shields.io/npm/v/@lykmapipo/redis-common)](https://www.npmjs.com/package/@lykmapipo/redis-common)

Re-usable helpers for redis

## Requirements

- [NodeJS v14.5+](https://nodejs.org)
- [Npm v6.14+](https://www.npmjs.com/)
- [Redis v5+](https://redis.io/)

## Installation

```sh
npm install --save @lykmapipo/redis-common
```

## Usage

```js
import {
  set,
  get,
  publish,
  subscribe,
  lock,
  quit,
} from '@lykmapipo/redis-common';

set('users:count', 1, (error, value, key) => { ... });

get('users:count', (error, value) => { ... });

subscribe('redis:clicks', (channel, message) => { ... });

publish('redis:clicks', 1);

lock('users', (error, unlock) => { ... });

quit();
```

## Environment

```js
REDIS_URL=redis://127.0.0.1:6379
REDIS_KEY_PREFIX=r
REDIS_KEY_SEPARATOR=:
REDIS_EVENT_PREFIX=events
REDIS_LOCK_PREFIX=locks
REDIS_LOCK_TTL=1000
```

## Test

- Clone this repository

- Install all dependencies

```sh
npm install
```

- Then run test

```sh
npm test
```

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence

The MIT License (MIT)

Copyright (c) lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
