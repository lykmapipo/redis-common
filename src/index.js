import { forEach, isEmpty, isFunction, isNumber, isString, noop } from 'lodash';
import { compact, mergeObjects, stringify } from '@lykmapipo/common';
import { getString } from '@lykmapipo/env';
import uuidv1 from 'uuid/v1';
import redis from 'redis';

// local refs
let client;
let publisher;
let subscriber;

/**
 * @function withDefaults
 * @name withDefaults
 * @description Merge provided options with defaults.
 * @param {Object} [optns] provided options
 * @return {Object} merged options
 * @author lally elias <lallyelias87@gmail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 *
 * const redis = (process.env.REDIS_URL || { port: 6379, host: '127.0.0.1' });
 * const options = withDefaults({ redis })
 *
 * // => { redis: ...}
 *
 */
export const withDefaults = optns => {
  // defaults
  const defaults = {
    url: getString('REDIS_URL', 'redis://127.0.0.1:6379'),
    prefix: getString('REDIS_KEY_PREFIX', 'r'),
    separator: getString('REDIS_KEY_SEPARATOR', ':'),
  };

  // merge and compact with defaults
  const options = compact(mergeObjects(defaults, optns));

  // return
  return options;
};

/**
 * @function createClient
 * @name createClient
 * @description Create redis client or return existing one
 * @param {Object} optns valid options
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
export const createClient = optns => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref client
  let redisClient = client;

  // obtain  or create redis client
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
 * @function createPubSub
 * @name createPubSub
 * @description Create redis pubsub clients
 * @param {Object} optns valid options
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
export const createPubSub = optns => {
  // obtain options
  const { prefix, recreate, ...options } = withDefaults(optns);

  // ref clients
  let redisPublisher = publisher;
  let redisSubscriber = subscriber;

  // obtain or create redis publisher client
  if (recreate || !redisPublisher) {
    redisPublisher = redis.createClient(options);
    redisPublisher.uuid = redisPublisher.uuid || uuidv1();
    redisPublisher.prefix = redisPublisher.prefix || prefix;
    publisher = publisher || redisPublisher;
  }

  // obtain or create redis subscriber client
  if (recreate || !redisSubscriber) {
    redisSubscriber = redis.createClient(options);
    redisSubscriber.uuid = redisSubscriber.uuid || uuidv1();
    redisSubscriber.prefix = redisSubscriber.prefix || prefix;
    subscriber = subscriber || redisSubscriber;
  }

  // return pub sub clients
  return { publisher: redisPublisher, subscriber: redisSubscriber };
};

/**
 * @function createClients
 * @name createClients
 * @description Create redis clients
 * @param {Object} optns valid options
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
export const createClients = optns => {
  // create and return clients
  return { client: createClient(optns), ...createPubSub(optns) };
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
 * mult.set('abc:1', 1).set('abc:2', 2).set('abc:3', 3).exec(done);
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
 *
 * set('users:count', 1, 'EX', 2);
 *
 * set('users:count', 1, 'PX', 2000);
 *
 * set(key, value, 'EX', 1, 'NX');
 *
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
  const cb = error => next(error, value, setKey);

  // set value and return
  const args = compact([setKey, setValue, setExpiry, setTime, setStrategy, cb]);
  return redisClient.set.call(redisClient, ...args);
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
  keyPattern = compact([prefix, ...keyPattern.split(separator)]).join(':');
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

  // obtain keys
  keys(keyPattern, (error, foundKeys) => {
    // back-off in case there is error
    if (error) {
      return cb(error);
    }

    // initiate multi to run all commands atomically
    const redisClient = createMulti();

    // queue commands
    forEach(foundKeys, foundKey => redisClient.del(foundKey));

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
export const quit = () => {
  // quit all clients
  // TODO client.end if callback passed
  const clients = [publisher, subscriber, client];
  forEach(clients, redisClient => {
    // clear subscriptions and listeners
    redisClient.unsubscribe();
    redisClient.removeAllListeners();
    // quit client
    redisClient.quit();
  });

  // reset clients
  client = null;
  publisher = null;
  subscriber = null;

  // return redis client states
  return { client, publisher, subscriber };
};
