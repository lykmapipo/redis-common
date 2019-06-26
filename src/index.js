import { compact, mergeObjects } from '@lykmapipo/common';
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
 * const { withDefaults } = require('@lykmapipo/redis-common');
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
    redisClient.id = redisClient.id || uuidv1();
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
    redisPublisher.id = redisPublisher.id || uuidv1();
    redisPublisher.prefix = redisPublisher.prefix || prefix;
    publisher = publisher || redisPublisher;
  }

  // obtain or create redis subscriber client
  if (recreate || !redisSubscriber) {
    redisSubscriber = redis.createClient(options);
    redisSubscriber.id = redisSubscriber.id || uuidv1();
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
export const createClients = () => {};
