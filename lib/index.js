'use strict';

const lodash = require('lodash');
const common = require('@lykmapipo/common');
const env = require('@lykmapipo/env');
const redis = require('redis');
const warlock = require('node-redis-warlock');

// local refs
let client; // command client
let cli; // cli client
let publisher; // publisher client
let subscriber; // subscriber client
let locker; // lock client
let warlocker; // warlock instance

/**
 * @function withDefaults
 * @name withDefaults
 * @description Merge provided options with defaults.
 * @param {Object} [optns] provided options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {String} [optns.db=0] valid redis database number
 * @param {String} [optns.prefix='r'] valid redis key prefix
 * @param {String} [optns.separator=':'] valid redis key separator
 * @param {String} [optns.eventPrefix='events'] valid redis events key prefix
 * @param {Number} [optns.lockTtl=1000] valid redis ttl in milliseconds
 * @return {Object} merged options
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.2.0
 * @static
 * @public
 * @example
 *
 * const optns = { url: process.env.REDIS_URL, prefix: 'r', ... };
 * const options = withDefaults(optns);
 *
 * // => { url: ...}
 *
 */
const withDefaults = (optns) => {
  // defaults
  const defaults = {
    url: env.getString('REDIS_URL', 'redis://127.0.0.1:6379'),
    db: env.getNumber('REDIS_DB', 0),
    prefix: env.getString('REDIS_KEY_PREFIX', 'r'),
    separator: env.getString('REDIS_KEY_SEPARATOR', ':'),
    eventPrefix: env.getString('REDIS_EVENT_PREFIX', 'events'),
    lockPrefix: env.getString('REDIS_LOCK_PREFIX', 'locks'),
    lockTtl: env.getNumber('REDIS_LOCK_TTL', 1000),
  };

  // merge and compact with defaults
  const options = common.compact(common.mergeObjects(defaults, optns));

  // return
  return options;
};

/**
 * @function createRedisClient
 * @name createRedisClient
 * @description Create redis client
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const client = createRedisClient();
 *
 */
const createRedisClient = (optns) => {
  // obtain options
  const { uuid, prefix, ...options } = withDefaults(optns);

  // create new redis client
  // FIX: exclude prefix on creating client to avoid multiple key prefixes
  const redisClient = redis.createClient(options);
  redisClient.uuid = uuid || common.uuidv1();
  redisClient.prefix = prefix;

  // return redis client
  return redisClient;
};

/**
 * @function quitRedisClient
 * @name quitRedisClient
 * @description Quit given redis client
 * @param {Object} redisClient Valid redis client instance
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * quitRedisClient(client);
 *
 */
const quitRedisClient = (redisClient) => {
  // TODO client.end if callback passed

  // quit given client
  if (redisClient) {
    // clear subscriptions and listeners
    redisClient.unsubscribe();
    redisClient.removeAllListeners();

    // quit client
    redisClient.quit();
  }

  // return quited client
  return redisClient;
};

/**
 * @function keyFor
 * @name keyFor
 * @description Generate data storage key
 * @param {...String|String} args valid key parts
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * keyFor('users');
 * // => 'r:users';
 *
 * keyFor('users', 'likes');
 * // => 'r:users:likes'
 *
 */
const keyFor = (...args) => {
  // obtain options
  const { prefix, separator } = withDefaults();

  // collect key parts
  let parts = common.compact([].concat(...args));
  parts = !lodash.isEmpty(parts) ? parts : [common.uuidv1()];

  // prepare key
  const storageKey = common.compact([prefix, ...parts]).join(separator);

  // return storage key
  return storageKey;
};

/**
 * @function eventKey
 * @name eventKey
 * @description Generate event key
 * @param {...String|String} args valid key parts
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * eventKeyFor('users:pay');
 * // => 'r:events:users:pay';
 *
 * eventKeyFor('users', 'pay');
 * // => 'r:events:users:pay'
 *
 */
const eventKeyFor = (...args) => {
  // obtain options
  const { eventPrefix } = withDefaults();

  // collect key parts
  const parts = common.compact([eventPrefix].concat(...args));

  // derive event key
  const eventKey = keyFor(...parts);

  // return lock key
  return eventKey;
};

/**
 * @function lockKeyFor
 * @name lockKeyFor
 * @description Generate lock key
 * @param {...String|String} args valid key parts
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.8.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * lockKeyFor('users:pay');
 * // => 'r:locks:users:pay';
 *
 * lockKeyFor('users', 'pay');
 * // => 'r:locks:users:pay'
 *
 */
const lockKeyFor = (...args) => {
  // obtain options
  const { lockPrefix } = withDefaults();

  // collect key parts
  const parts = common.compact([lockPrefix].concat(...args));

  // derive lock key
  const lockKey = keyFor(...parts);

  // return lock key
  return lockKey;
};

/**
 * @function createClient
 * @name createClient
 * @description Create redis client or return existing one
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const client = createClient();
 *
 * const client = createClient({ recreate: true });
 *
 */
const createClient = (optns) => {
  // obtain options
  const { recreate, ...options } = withDefaults(optns);

  // ref client
  let redisClient = client;

  // obtain or create redis client
  if (recreate || !redisClient) {
    redisClient = createRedisClient(options);
    client = client || redisClient;
  }

  // return redis client
  return redisClient;
};

/**
 * @function createCli
 * @name createCli
 * @description Create redis cli client or return existing one
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const cli = createCli();
 *
 * const cli = createCli({ recreate: true });
 *
 */
const createCli = (optns) => {
  // obtain options
  const { recreate, ...options } = withDefaults(optns);

  // ref cli client
  let redisClient = cli;

  // obtain or create redis cli client
  if (recreate || !redisClient) {
    redisClient = createRedisClient(options);
    cli = cli || redisClient;
  }

  // return redis cli client
  return redisClient;
};

/**
 * @function createLocker
 * @name createLocker
 * @description Create redis lock client
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis lock client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const locker = createLocker();
 *
 * const locker = createLocker({ recreate: true });
 *
 */
const createLocker = (optns) => {
  // obtain options
  const { recreate, ...options } = withDefaults(optns);

  // ref locker
  let redisClient = locker;

  // obtain or create redis lock client
  if (recreate || !redisClient) {
    redisClient = createRedisClient(options);
    locker = locker || redisClient;
  }

  // return locker client
  return redisClient;
};

/**
 * @function createWarlock
 * @name createWarlock
 * @description Create redis warlock instance
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis warlock instance
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const warlocker = createWarlock();
 *
 * const warlocker = createWarlock({ recreate: true });
 *
 */
const createWarlock = (optns) => {
  // obtain options
  const { recreate } = withDefaults(optns);

  // ref warlocker
  let redisWarlocker = warlocker;

  // obtain or create redis warlock instance
  if (recreate || !redisWarlocker) {
    const redisLocker = createLocker(optns);
    redisWarlocker = warlock(redisLocker);
    redisWarlocker.uuid = redisLocker.uuid;
    redisWarlocker.prefix = redisLocker.prefix;

    // override: internal warlock key generator
    redisWarlocker.makeKey = (...key) => lockKeyFor(...key);

    warlocker = warlocker || redisWarlocker;
  }

  // return warlocker client
  return redisWarlocker;
};

/**
 * @function createPublisher
 * @name createPublisher
 * @description Create redis publisher client
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis publisher client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const publisher = createPublisher();
 *
 * const publisher = createPublisher({ recreate: true });
 *
 */
const createPublisher = (optns) => {
  // obtain options
  const { recreate, ...options } = withDefaults(optns);

  // ref publisher
  let redisClient = publisher;

  // obtain or create redis publisher client
  if (recreate || !redisClient) {
    redisClient = createRedisClient(options);
    publisher = publisher || redisClient;
  }

  // return pubisher client
  return redisClient;
};

/**
 * @function createSubscriber
 * @name createSubscriber
 * @description Create redis subscriber client
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis subscriber client
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const subscriber = createSubscriber();
 *
 * const subscriber = createSubscriber({ recreate: true });
 *
 */
const createSubscriber = (optns) => {
  // obtain options
  const { recreate, ...options } = withDefaults(optns);

  // ref subscriber
  let redisClient = subscriber;

  // obtain or create redis subscriber client
  if (recreate || !redisClient) {
    redisClient = createRedisClient(options);
    subscriber = subscriber || redisClient;
  }

  // return subscriber client
  return redisClient;
};

/**
 * @function createPubSub
 * @name createPubSub
 * @description Create redis pubsub clients
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new clients
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis pubsub clients
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const { publisher, subscriber } = createPubSub();
 *
 * const { publisher, subscriber } = createPubSub({ recreate: true });
 *
 */
const createPubSub = (optns) => {
  // ref clients
  const redisPublisher = createPublisher(optns);
  const redisSubscriber = createSubscriber(optns);

  // return pub sub clients
  return { publisher: redisPublisher, subscriber: redisSubscriber };
};

/**
 * @function createClients
 * @name createClients
 * @description Create redis clients
 * @param {Object} optns valid options
 * @param {String} [optns.url='redis://127.0.0.1:6379'] valid redis url
 * @param {Boolean} [optns.recreate=false] whether to create new client
 * @param {String} [optns.prefix='r'] client key prefix
 * @return {Object} redis clients
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const { client, publisher, subscriber } = createClients();
 *
 * const { client, publisher, subscriber } = createClients({ new: true });
 *
 */
const createClients = (optns) => {
  // create and return clients
  return {
    client: createClient(optns), // normal client
    cli: createCli(optns), // cli client
    locker: createLocker(optns), // lock client
    warlocker: createWarlock(optns), // warlock instance
    ...createPubSub(optns), // pubsub clients
  };
};

/**
 * @function createMulti
 * @name createMulti
 * @description Create redis multi command object
 * @return {Object} redis clients
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const multi = createMulti();
 * multi.set('abc:1', 1).set('abc:2', 2).set('abc:3', 3).exec(done);
 *
 */
const createMulti = () => {
  // ensure client
  const redisClient = createClient();

  // create multi
  const redisMulti = redisClient.multi();

  // return multi command object
  return redisMulti;
};

/**
 * @function set
 * @name set
 * @description Set key to hold the value. If key already holds a value,
 * it is overwritten, regardless of its type.
 * @param {String} key key
 * @param {Mixed} value value
 * @param {String} [expiry] expiry strategy(i.e PX or EX)
 * @param {Number} [time] expiry time(i.e seconds or milliseconds)
 * @param {String} [strategy] save strategy(i.e NX or XX)
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * set('users:count', 1);
 * set('users:count', 1, 'EX', 2);
 * set('users:count', 1, 'PX', 2000);
 * set('users:count', 1, 'EX', 1, 'NX');
 * set('users:count', 1, (error, value, key) => { ... });
 *
 */
const set = (key, value, expiry, time, strategy, done) => {
  // do nothing
  if (lodash.isFunction(key)) {
    return key && key();
  }

  // do nothing
  if (lodash.isFunction(value)) {
    return value && value();
  }

  // ensure client
  const redisClient = createClient();

  // prepare command
  const setKey = keyFor(key);
  const setValue = common.stringify(value);
  const setExpiry = expiry && lodash.isString(expiry) ? expiry : undefined;
  const setTime = time && lodash.isNumber(time) ? time : undefined;
  const setStrategy = strategy && lodash.isString(strategy) ? strategy : undefined;

  // derive callback
  let next = lodash.noop;
  next = lodash.isFunction(expiry) ? expiry : next;
  next = lodash.isFunction(time) ? time : next;
  next = lodash.isFunction(strategy) ? strategy : next;
  next = lodash.isFunction(done) ? done : next;
  const cb = (error) => next(error, value, setKey);

  // set value and return
  const args = common.compact([setKey, setValue, setExpiry, setTime, setStrategy, cb]);
  return redisClient.set.call(redisClient, ...args);
};

/**
 * @function get
 * @name get
 * @description Get the value of key. If the key does not exist,
 * null is returned.
 * @param {String} key key
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * get('users:count');
 * get('users:count', (error, value) => { ... });
 *
 */
const get = (key, done) => {
  // do nothing
  if (lodash.isFunction(key)) {
    return key && key();
  }

  // ensure client
  const redisClient = createClient();

  // prepare key
  const getKey = keyFor(key);

  // derive callback
  let next = lodash.noop;
  next = lodash.isFunction(done) ? done : next;
  const cb = (error, value) => next(error, common.parse(value));

  // get value and return
  const args = common.compact([getKey, cb]);
  return redisClient.get.call(redisClient, ...args);
};

/**
 * @function keys
 * @name keys
 * @description Find all keys matching given pattern
 * @param {String} pattern valid key pattern
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * keys('users', (error, keys) => { ... });
 *
 */
const keys = (pattern, done) => {
  // normalize arguments
  const cb = lodash.isFunction(pattern) ? pattern : done;
  let keyPattern = lodash.isString(pattern) ? pattern : '';

  // obtain options
  const { prefix, separator } = withDefaults();

  // obtain key
  keyPattern = common.compact([prefix, ...keyPattern.split(separator)]).join(
    separator
  );
  keyPattern = [...keyPattern, '*'].join('');

  // ensure client
  const redisClient = createClient();

  // fetch keys
  return redisClient.keys(keyPattern, cb);
};

/**
 * @function info
 * @name info
 * @description Collect information and statistics about the server
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * info((error, info) => { ... });
 *
 */
const info = (done) => {
  // ensure client
  const redisClient = createCli();

  // fetch keys
  return redisClient.info((error /* ,info */) => {
    return done(error, redisClient.server_info);
  });
};

/**
 * @function count
 * @name count
 * @description Count the number of keys that match specified pattern
 * @param {...String|String} args valid key patterns
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * count('users', (error, counts) => { ... });
 * count('users:sessions*', 'users:visits*', (error, counts) => { ... });
 *
 */
const count = (...patterns) => {
  // normalize patterns to array
  let keyPatterns = common.uniq([].concat(...patterns));

  // obtain callback
  const done = lodash.last(patterns);

  // drop callback if provided
  if (lodash.isFunction(done)) {
    keyPatterns = lodash.initial(keyPatterns);
  }

  // initiate multi to run all count commands atomically
  const redisClient = createMulti();

  // count for each key pattern
  lodash.forEach(keyPatterns, (keyPattern) => {
    // prepare count LUA script per pattern
    const script = `return #redis.pcall("keys", "${keyPattern}")`;
    // count using a lua script
    redisClient.eval(script, 0);
  });

  // execute key counts
  return redisClient.exec((error, counts) => {
    return done(error, counts.length > 1 ? counts : lodash.first(counts));
  });
};

/**
 * @function config
 * @name config
 * @description Read or reconfigure redis server at run time
 * @param {*} params Valid config params
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.6.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * config('SET', 'notify-keyspace-events', 'Ex');
 * config('SET', 'notify-keyspace-events', 'Ex', (error, results) => { ... });
 *
 * config('GET', 'notify-keyspace-events');
 * config('GET', 'notify-keyspace-events', (error, results) => { ... });
 *
 */
const config = (...params) => {
  // ensure client
  const redisClient = createCli();

  // obtain callback
  const cb = lodash.findLast([...params], (param) => lodash.isFunction(param)) || lodash.noop;

  // obtain args
  const args = lodash.filter([...params], (param) => !lodash.isFunction(param));

  // fetch keys
  return redisClient.config(...[...args, cb]);
};

/**
 * @function clear
 * @name clear
 * @description Clear all data saved and their key
 * @param {Function} done callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * clear(error => { ... });
 *
 * clear('users', error => { ... });
 *
 */
const clear = (pattern, done) => {
  // normalize arguments
  const cb = lodash.isFunction(pattern) ? pattern : done;
  const keyPattern = lodash.isString(pattern) ? pattern : '';

  // TODO use LUA script
  // const script = "for i, name in
  // ipairs(redis.call('KEYS', 'keyPattern'))
  // do redis.call('DEL', name); end";
  // redisClient.eval(script, 0);

  // obtain keys
  keys(keyPattern, (error, foundKeys) => {
    // back-off in case there is error
    if (error) {
      return cb(error);
    }

    // initiate multi to run all commands atomically
    const redisClient = createMulti();

    // queue commands
    lodash.forEach(foundKeys, (foundKey) => redisClient.del(foundKey));

    // execute commands
    return redisClient.exec(cb);
  });
};

/**
 * @function quit
 * @name quit
 * @description Quit and restore redis clients states
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * quit();
 *
 */
const quit = () => {
  // TODO client.end if callback passed

  // quit all clients
  const clients = [publisher, subscriber, locker, cli, client];
  lodash.forEach(clients, (redisClient) => quitRedisClient(redisClient));

  // reset clients
  client = null;
  cli = null;
  warlocker = null;
  locker = null;
  publisher = null;
  subscriber = null;

  // return redis client states
  return { client, cli, locker, warlocker, publisher, subscriber };
};

/**
 * @function emit
 * @name emit
 * @description Posts a message to the given channel
 * @param {String} channel valid channel name or patterns
 * @param {Mixed} message valid message to emit
 * @param {Function} [done] callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * emit('user:clicks', { time: Date.now() });
 *
 */
const emit = (channel, message, done) => {
  // normalize arguments
  let emitMessage =
    common.isNotValue(message) || lodash.isFunction(message) ? channel : message;
  let emitChannel =
    common.isNotValue(message) || lodash.isFunction(message) ? 'default' : channel;
  let cb = lodash.isFunction(message) ? message : done;

  // obtain options
  const { separator } = withDefaults();

  // ensure publisher redis client
  const redisPublisher = createPublisher();

  // ensure emit channel
  emitChannel = eventKeyFor(...emitChannel.split(separator));

  // stringify channel message
  // TODO add source process, timestamp, uuid, ip, macaddres etc
  // TODO make message an object
  emitMessage = common.stringify(emitMessage);

  // obtain callback if present
  // TODO return message with message uuid
  cb = lodash.isFunction(cb) ? cb : lodash.noop;

  // subscriber, publish message and return
  return redisPublisher.publish(emitChannel, emitMessage, cb);
};

/**
 * @function publish
 * @name publish
 * @description Posts a message to the given channel
 * @param {String} channel valid channel name or patterns
 * @param {Mixed} message valid message to publish
 * @param {Function} [done] callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * publish('user:clicks', { time: Date.now() });
 *
 */
const publish = emit;

/**
 * @function on
 * @name on
 * @description Listen for messages published to channels matching
 * the given patterns
 * @param {String} channel valid channel name or patterns
 * @param {Function} done callback to invoke on message
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * on('user:clicks', (channel, message) => { ... });
 *
 */
const on = (channel, done) => {
  // normalize arguments
  let emitChannel = lodash.isFunction(channel) ? 'default' : channel;
  let cb = lodash.isFunction(channel) ? channel : done;

  // obtain options
  const { separator } = withDefaults();

  // ensure subscriber redis client
  const redisSubscriber = createSubscriber();

  // ensure emit channel
  emitChannel = eventKeyFor(...emitChannel.split(separator));

  // obtain callback if present
  cb = lodash.isFunction(cb) ? cb : lodash.noop;

  // subscribe for events
  redisSubscriber.subscribe(emitChannel);

  // listen for event and invoke callback
  return redisSubscriber.on('message', (receiveChannel, message) => {
    if (receiveChannel === emitChannel) {
      const parsedMessage = common.parse(message);
      return cb(emitChannel, parsedMessage);
    }
    return 0;
  });
};

/**
 * @function subscribe
 * @name subscribe
 * @description Listen for messages published to channels matching
 * the given patterns
 * @param {String} channel valid channel name or patterns
 * @param {Function} done callback to invoke on message
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.3.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * subscribe('user:clicks', (channel, message) => { ... });
 *
 */
const subscribe = on;

/**
 * @function unsubscribe
 * @name unsubscribe
 * @description Stop listen for messages published to channels matching
 * the given patterns
 * @param {String} channel valid channel name or patterns
 * @param {Function} done callback to invoke on message
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.2.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * unsubscribe('user:clicks', (channel, count) => { ... });
 *
 */
const unsubscribe = (channel, done) => {
  // normalize arguments
  let emitChannel = lodash.isFunction(channel) ? '*' : channel;
  let cb = lodash.isFunction(channel) ? channel : done;

  // obtain options
  const { separator } = withDefaults();

  // ensure emit channel
  emitChannel = eventKeyFor(...emitChannel.split(separator));

  // obtain callback if present
  cb = lodash.isFunction(cb) ? cb : lodash.noop;

  // if no subscribe return
  if (!subscriber) {
    return cb(null, emitChannel);
  }

  // unsubscribe for events
  return subscriber.unsubscribe(emitChannel, cb);
};

/**
 * @function lock
 * @name lock
 * @description Set lock
 * @param {String} key name for the lock key
 * @param {Number} ttl time in milliseconds for the lock to live
 * @param {Function} [done] callback to invoke on success or failure
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.5.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * lock('paymments:pay', 1000, (error, unlock) => { ... });
 *
 * lock('scheduler:work', (error, unlock) => { ... });
 *
 */
const lock = (key, ttl, done) => {
  // obtain options
  const { lockTtl } = withDefaults();

  // normalize arguments
  const actualKey = key; // TODO: support default
  const actualTTL = lodash.isFunction(ttl) ? lockTtl : ttl;
  const cb = lodash.isFunction(ttl) ? ttl : done || lodash.noop;

  // ensure warlock instance
  const redisWarlocker = createWarlock();

  // prepare wrapped unlock callback
  const actualCallback = (error, unlock) => {
    // this process was not able to set a lock
    if (error) {
      return cb(error);
    }

    // lock was not established by this process
    if (!unlock || !lodash.isFunction(unlock)) {
      return cb(new Error('unable to obtain lock'));
    }

    // lock is set successfully by this process
    return cb(null, unlock);
  };

  // acqure lock
  return redisWarlocker.lock(actualKey, actualTTL, actualCallback);
};

exports.clear = clear;
exports.config = config;
exports.count = count;
exports.createCli = createCli;
exports.createClient = createClient;
exports.createClients = createClients;
exports.createLocker = createLocker;
exports.createMulti = createMulti;
exports.createPubSub = createPubSub;
exports.createPublisher = createPublisher;
exports.createRedisClient = createRedisClient;
exports.createSubscriber = createSubscriber;
exports.createWarlock = createWarlock;
exports.emit = emit;
exports.eventKeyFor = eventKeyFor;
exports.get = get;
exports.info = info;
exports.keyFor = keyFor;
exports.keys = keys;
exports.lock = lock;
exports.lockKeyFor = lockKeyFor;
exports.on = on;
exports.publish = publish;
exports.quit = quit;
exports.quitRedisClient = quitRedisClient;
exports.set = set;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.withDefaults = withDefaults;
