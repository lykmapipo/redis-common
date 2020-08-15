import {
  forEach,
  first,
  initial,
  isEmpty,
  isFunction,
  isNumber,
  isString,
  last,
  noop,
} from 'lodash';
import {
  compact,
  isNotValue,
  mergeObjects,
  parse,
  stringify,
  uniq,
  uuidv1,
} from '@lykmapipo/common';
import { getNumber, getString } from '@lykmapipo/env';
import redis from 'redis';
import warlock from 'node-redis-warlock';

// local refs
let client; // command client
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
 * @param {String} [optns.prefix='r'] valid redis key prefix
 * @param {String} [optns.separator=':'] valid redis key separator
 * @param {String} [optns.eventPrefix='events'] valid redis events key prefix
 * @param {Number} [optns.lockTTL=1000] valid redis ttl in milliseconds
 * @return {Object} merged options
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
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
export const withDefaults = (optns) => {
  // defaults
  const defaults = {
    url: getString('REDIS_URL', 'redis://127.0.0.1:6379'),
    prefix: getString('REDIS_KEY_PREFIX', 'r'),
    separator: getString('REDIS_KEY_SEPARATOR', ':'),
    eventPrefix: getString('REDIS_EVENT_PREFIX', 'events'),
    lockPrefix: getString('REDIS_LOCK_PREFIX', 'locks'),
    lockTTL: getNumber('REDIS_LOCK_TTL', 1000),
  };

  // merge and compact with defaults
  const options = compact(mergeObjects(defaults, optns));

  // return
  return options;
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
export const keyFor = (...args) => {
  // obtain options
  const { prefix, separator } = withDefaults();

  // collect key parts
  let parts = compact([].concat(...args));
  parts = !isEmpty(parts) ? parts : [uuidv1()];

  // prepare key
  const storageKey = compact([prefix, ...parts]).join(separator);

  // return storage key
  return storageKey;
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
export const createClient = (optns) => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref client
  let redisClient = client;

  // obtain or create redis client
  if (recreate || !redisClient) {
    redisClient = redis.createClient(options);
    redisClient.uuid = redisClient.uuid || uuidv1();
    redisClient.prefix = redisClient.prefix || prefix;
    client = client || redisClient;
  }

  // return redis client
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
export const createLocker = (optns) => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref locker
  let redisLocker = locker;

  // obtain or create redis lock client
  if (recreate || !redisLocker) {
    redisLocker = redis.createClient(options);
    redisLocker.uuid = redisLocker.uuid || uuidv1();
    redisLocker.prefix = redisLocker.prefix || prefix;
    locker = locker || redisLocker;
  }

  // return locker client
  return redisLocker;
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
export const createWarlock = (optns) => {
  // obtain options
  const { recreate, lockPrefix } = withDefaults(optns);

  // ref warlocker
  let redisWarlocker = warlocker;

  // obtain or create redis warlock instance
  if (recreate || !redisWarlocker) {
    const redisLocker = createLocker(optns);
    redisWarlocker = warlock(redisLocker);
    redisWarlocker.uuid = redisLocker.uuid;
    redisWarlocker.prefix = redisLocker.prefix;

    // override: internal warlock key generator
    redisWarlocker.makeKey = (key) => keyFor(lockPrefix, key, 'lock');

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
export const createPublisher = (optns) => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref publisher
  let redisPublisher = publisher;

  // obtain or create redis publisher client
  if (recreate || !redisPublisher) {
    redisPublisher = redis.createClient(options);
    redisPublisher.uuid = redisPublisher.uuid || uuidv1();
    redisPublisher.prefix = redisPublisher.prefix || prefix;
    publisher = publisher || redisPublisher;
  }

  // return pubisher client
  return redisPublisher;
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
export const createSubscriber = (optns) => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref subscriber
  let redisSubscriber = subscriber;

  // obtain or create redis subscriber client
  if (recreate || !redisSubscriber) {
    redisSubscriber = redis.createClient(options);
    redisSubscriber.uuid = redisSubscriber.uuid || uuidv1();
    redisSubscriber.prefix = redisSubscriber.prefix || prefix;
    subscriber = subscriber || redisSubscriber;
  }

  // return subscriber client
  return redisSubscriber;
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
export const createPubSub = (optns) => {
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
export const createClients = (optns) => {
  // create and return clients
  return {
    client: createClient(optns), // normal client
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
export const createMulti = () => {
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
export const set = (key, value, expiry, time, strategy, done) => {
  // do nothing
  if (isFunction(key)) {
    return key && key();
  }

  // do nothing
  if (isFunction(value)) {
    return value && value();
  }

  // ensure client
  const redisClient = createClient();

  // prepare command
  const setKey = keyFor(key);
  const setValue = stringify(value);
  const setExpiry = expiry && isString(expiry) ? expiry : undefined;
  const setTime = time && isNumber(time) ? time : undefined;
  const setStrategy = strategy && isString(strategy) ? strategy : undefined;

  // derive callback
  let next = noop;
  next = isFunction(expiry) ? expiry : next;
  next = isFunction(time) ? time : next;
  next = isFunction(strategy) ? strategy : next;
  next = isFunction(done) ? done : next;
  const cb = (error) => next(error, value, setKey);

  // set value and return
  const args = compact([setKey, setValue, setExpiry, setTime, setStrategy, cb]);
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
export const get = (key, done) => {
  // do nothing
  if (isFunction(key)) {
    return key && key();
  }

  // ensure client
  const redisClient = createClient();

  // prepare key
  const getKey = keyFor(key);

  // derive callback
  let next = noop;
  next = isFunction(done) ? done : next;
  const cb = (error, value) => next(error, parse(value));

  // get value and return
  const args = compact([getKey, cb]);
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
export const keys = (pattern, done) => {
  // normalize arguments
  const cb = isFunction(pattern) ? pattern : done;
  let keyPattern = isString(pattern) ? pattern : '';

  // obtain options
  const { prefix, separator } = withDefaults();

  // obtain key
  keyPattern = compact([prefix, ...keyPattern.split(separator)]).join(
    separator
  );
  keyPattern = [...keyPattern, '*'].join('');

  // ensure client
  const redisClient = createClient();

  // fetch keys
  return redisClient.keys(keyPattern, cb);
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
export const clear = (pattern, done) => {
  // normalize arguments
  const cb = isFunction(pattern) ? pattern : done;
  const keyPattern = isString(pattern) ? pattern : '';

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
    forEach(foundKeys, (foundKey) => redisClient.del(foundKey));

    // execute commands
    return redisClient.exec(cb);
  });
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
export const info = (done) => {
  // ensure client
  const redisClient = createClient();

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
export const count = (...patterns) => {
  // normalize patterns to array
  let keyPatterns = uniq([].concat(...patterns));

  // obtain callback
  const done = last(patterns);

  // drop callback if provided
  if (isFunction(done)) {
    keyPatterns = initial(keyPatterns);
  }

  // initiate multi to run all count commands atomically
  const redisClient = createMulti();

  // count for each key pattern
  forEach(keyPatterns, (keyPattern) => {
    // prepare count LUA script per pattern
    const script = `return #redis.pcall("keys", "${keyPattern}")`;
    // count using a lua script
    redisClient.eval(script, 0);
  });

  // execute key counts
  return redisClient.exec((error, counts) => {
    return done(error, counts.length > 1 ? counts : first(counts));
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
export const quit = () => {
  // quit all clients
  // TODO client.end if callback passed
  const clients = [publisher, subscriber, locker, client];
  forEach(clients, (redisClient) => {
    // clear subscriptions and listeners
    redisClient.unsubscribe();
    redisClient.removeAllListeners();
    // quit client
    redisClient.quit();
  });

  // reset clients
  client = null;
  warlocker = null;
  locker = null;
  publisher = null;
  subscriber = null;

  // return redis client states
  return { client, locker, warlocker, publisher, subscriber };
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
export const emit = (channel, message, done) => {
  // normalize arguments
  let emitMessage =
    isNotValue(message) || isFunction(message) ? channel : message;
  let emitChannel =
    isNotValue(message) || isFunction(message) ? 'default' : channel;
  let cb = isFunction(message) ? message : done;

  // obtain options
  const { prefix, eventPrefix, separator } = withDefaults();

  // ensure publisher redis client
  const redisPublisher = createPublisher();

  // ensure emit channel
  emitChannel = compact([
    prefix,
    eventPrefix,
    ...emitChannel.split(separator),
  ]).join(separator);

  // stringify channel message
  // TODO add source process, timestamp, uuid, ip, macaddres etc
  // TODO make message an object
  emitMessage = stringify(emitMessage);

  // obtain callback if present
  // TODO return message with message uuid
  cb = isFunction(cb) ? cb : noop;

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
export const publish = emit;

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
export const on = (channel, done) => {
  // normalize arguments
  let emitChannel = isFunction(channel) ? 'default' : channel;
  let cb = isFunction(channel) ? channel : done;

  // obtain options
  const { prefix, eventPrefix, separator } = withDefaults();

  // ensure subscriber redis client
  const redisSubscriber = createSubscriber();

  // ensure emit channel
  emitChannel = compact([
    prefix,
    eventPrefix,
    ...emitChannel.split(separator),
  ]).join(separator);

  // obtain callback if present
  cb = isFunction(cb) ? cb : noop;

  // subscribe for events
  redisSubscriber.subscribe(emitChannel);

  // listen for event and invoke callback
  return redisSubscriber.on('message', (receiveChannel, message) => {
    if (receiveChannel === emitChannel) {
      const parsedMessage = parse(message);
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
export const subscribe = on;

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
export const unsubscribe = (channel, done) => {
  // normalize arguments
  let emitChannel = isFunction(channel) ? '*' : channel;
  let cb = isFunction(channel) ? channel : done;

  // obtain options
  const { prefix, eventPrefix, separator } = withDefaults();

  // ensure emit channel
  emitChannel = compact([
    prefix,
    eventPrefix,
    ...emitChannel.split(separator),
  ]).join(separator);

  // obtain callback if present
  cb = isFunction(cb) ? cb : noop;

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
export const lock = (key, ttl, done) => {
  // obtain options
  const { lockTTL } = withDefaults();

  // normalize arguments
  const actualKey = key; // TODO: support default
  const actualTTL = isFunction(ttl) ? lockTTL : ttl;
  const cb = isFunction(ttl) ? ttl : done || noop;

  // ensure warlock instance
  const redisWarlocker = createWarlock();

  // prepare wrapped unlock callback
  const actualCallback = (error, unlock) => {
    // this process was not able to set a lock
    if (error) {
      return cb(error);
    }

    // lock was not established by this process
    if (!unlock || !isFunction(unlock)) {
      return cb(new Error('unable to obtain lock'));
    }

    // lock is set successfully by this process
    return cb(null, unlock);
  };

  // acqure lock
  return redisWarlocker.lock(actualKey, actualTTL, actualCallback);
};
