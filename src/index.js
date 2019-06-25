import { compact, mergeObjects } from '@lykmapipo/common';
import { getString } from '@lykmapipo/env';

/**
 * @function withDefaults
 * @name withDefaults
 * @description merge provided options with defaults.
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
 * const { withDefaults } = require('@lykmapipo/keu-common');
 * const redis = (process.env.REDIS_URL || { port: 6379, host: '127.0.0.1' });
 * const options = withDefaults({ redis })
 *
 * // => { redis: ...}
 *
 */
export const withDefaults = optns => {
  // defaults
  const defaults = {
    redis: getString('REDIS_URL') || { port: 6379, host: '127.0.0.1' },
  };

  // merge and compact with defaults
  const options = compact(mergeObjects(defaults, optns));

  // return
  return options;
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
