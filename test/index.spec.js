import _ from 'lodash';
import { parallel } from 'async';
import { expect, faker } from '@lykmapipo/test-helpers';
import {
  withDefaults,
  createRedisClient,
  quitRedisClient,
  createClient,
  createCli,
  createLocker,
  createWarlock,
  createPublisher,
  createSubscriber,
  createPubSub,
  createClients,
  createMulti,
  keyFor,
  eventKeyFor,
  lockKeyFor,
  set,
  get,
  keys,
  clear,
  info,
  count,
  config,
  setConfig,
  getConfig,
  quit,
  lock,
} from '../src';

describe('helpers', () => {
  it('should provide default options', () => {
    expect(withDefaults).to.exist.and.be.a('function');

    const options = withDefaults();
    expect(options).to.exist.and.be.an('object');
    expect(options.url).to.exist.and.be.equal('redis://127.0.0.1:6379');
    expect(options.db).to.exist.and.be.equal(0);
    expect(options.prefix).to.exist.and.be.equal('r');
    expect(options.separator).to.exist.and.be.equal(':');
    expect(options.eventPrefix).to.exist.and.be.equal('events');
    expect(options.lockPrefix).to.exist.and.be.equal('locks');
    expect(options.lockTtl).to.exist.and.be.equal(1000);
  });

  it('should create new redis client', () => {
    expect(createRedisClient).to.exist.and.be.a('function');

    const client = createRedisClient();
    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');
  });

  it('should quit given redis client', (done) => {
    let redisClient = createRedisClient();

    redisClient.on('ready', () => {
      expect(redisClient.ready).to.be.true;
      redisClient = quitRedisClient(redisClient);
      expect(redisClient.ready).to.be.false;
      done();
    });
  });

  it('should create redis client', () => {
    expect(createClient).to.exist.and.be.a('function');

    const client = createClient();
    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');
  });

  it('should create redis client with given options', () => {
    expect(createClient).to.exist.and.be.a('function');

    const client = createClient({ prefix: 're', recreate: true });
    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('re');
  });

  it('should not re-create redis client', () => {
    const a = createClient();
    const b = createClient();
    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create cli redis client', () => {
    expect(createCli).to.exist.and.be.a('function');

    const cli = createCli();

    expect(cli).to.exist;
    expect(cli.uuid).to.exist;
    expect(cli.prefix).to.exist.and.be.equal('r');
  });

  it('should not re-create cli redis client', () => {
    const a = createCli();
    const b = createCli();

    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create publisher redis client', () => {
    expect(createPublisher).to.exist.and.be.a('function');

    const publisher = createPublisher();

    expect(publisher).to.exist;
    expect(publisher.uuid).to.exist;
    expect(publisher.prefix).to.exist.and.be.equal('r');
  });

  it('should not re-create publisher redis client', () => {
    const a = createPublisher();
    const b = createPublisher();

    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create subscriber redis client', () => {
    expect(createSubscriber).to.exist.and.be.a('function');

    const subscriber = createSubscriber();

    expect(subscriber).to.exist;
    expect(subscriber.uuid).to.exist;
    expect(subscriber.prefix).to.exist.and.be.equal('r');
  });

  it('should not re-create subscriber redis client', () => {
    const a = createSubscriber();
    const b = createSubscriber();

    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create pubsub redis clients', () => {
    expect(createPubSub).to.exist.and.be.a('function');

    const { publisher, subscriber } = createPubSub();

    expect(publisher).to.exist;
    expect(publisher.uuid).to.exist;
    expect(publisher.prefix).to.exist.and.be.equal('r');

    expect(subscriber).to.exist;
    expect(subscriber.uuid).to.exist;
    expect(subscriber.prefix).to.exist.and.be.equal('r');

    expect(publisher.uuid).to.not.be.equal(subscriber.uuid);
  });

  it('should not re-create pubsub redis clients', () => {
    const { publisher: a, subscriber: b } = createPubSub();
    const { publisher: c, subscriber: d } = createPubSub();

    expect(a.uuid).to.be.equal(c.uuid);
    expect(a.prefix).to.be.equal(c.prefix);

    expect(b.uuid).to.be.equal(d.uuid);
    expect(b.prefix).to.be.equal(d.prefix);
  });

  it('should create lock redis client', () => {
    expect(createLocker).to.exist.and.be.a('function');

    const locker = createLocker();

    expect(locker).to.exist;
    expect(locker.uuid).to.exist;
    expect(locker.prefix).to.exist.and.be.equal('r');
  });

  it('should not re-create lock redis client', () => {
    const a = createLocker();
    const b = createLocker();

    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create warlock redis instance', () => {
    expect(createWarlock).to.exist.and.be.a('function');

    const warlocker = createWarlock();

    expect(warlocker).to.exist;
    expect(warlocker.uuid).to.exist;
    expect(warlocker.prefix).to.exist.and.be.equal('r');

    expect(warlocker.makeKey).to.be.a('function');
    expect(warlocker.makeKey('expiry')).to.be.equal('r:locks:expiry');
    expect(warlocker.makeKey('schedule:123')).to.be.equal(
      'r:locks:schedule:123'
    );
    expect(warlocker.makeKey('scheduler:expiry')).to.be.equal(
      'r:locks:scheduler:expiry'
    );
  });

  it('should not re-create warlock redis instance', () => {
    const a = createWarlock();
    const b = createWarlock();

    expect(a.uuid).to.be.equal(b.uuid);
    expect(a.prefix).to.be.equal(b.prefix);
  });

  it('should create redis clients', () => {
    expect(createClients).to.exist.and.be.a('function');

    const { client, cli, locker, warlocker, publisher, subscriber } =
      createClients();

    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');

    expect(cli).to.exist;
    expect(cli.uuid).to.exist;
    expect(cli.prefix).to.exist.and.be.equal('r');

    expect(locker).to.exist;
    expect(locker.uuid).to.exist;
    expect(locker.prefix).to.exist.and.be.equal('r');

    expect(warlocker).to.exist;
    expect(warlocker.uuid).to.exist;
    expect(warlocker.prefix).to.exist.and.be.equal('r');

    expect(publisher).to.exist;
    expect(publisher.uuid).to.exist;
    expect(publisher.prefix).to.exist.and.be.equal('r');

    expect(subscriber).to.exist;
    expect(subscriber.uuid).to.exist;
    expect(subscriber.prefix).to.exist.and.be.equal('r');

    expect(publisher.uuid).to.not.be.equal(subscriber.uuid);
  });

  it('should create redis client multi command object', () => {
    expect(createMulti).to.exist.and.be.a('function');

    const multi = createMulti();
    expect(multi).to.exist;
    expect(multi.exec).to.exist;
    expect(multi.exec).to.be.a('function');
  });

  it('should create redis key', () => {
    expect(keyFor()).to.exist;
    expect(keyFor('ab')).to.be.equal('r:ab');
    expect(keyFor(['users', 'ab'])).to.be.equal('r:users:ab');
    expect(keyFor('users', 'likes', 'vegetables')).to.be.equal(
      'r:users:likes:vegetables'
    );
  });

  it('should create redis event key', () => {
    expect(eventKeyFor()).to.exist;
    expect(eventKeyFor('ab')).to.be.equal('r:events:ab');
    expect(eventKeyFor(['users', 'ab'])).to.be.equal('r:events:users:ab');
    expect(eventKeyFor('users', 'likes', 'vegetables')).to.be.equal(
      'r:events:users:likes:vegetables'
    );
  });

  it('should create redis lock key', () => {
    expect(lockKeyFor()).to.exist;
    expect(lockKeyFor('ab')).to.be.equal('r:locks:ab');
    expect(lockKeyFor(['users', 'ab'])).to.be.equal('r:locks:users:ab');
    expect(lockKeyFor('users', 'likes', 'vegetables')).to.be.equal(
      'r:locks:users:likes:vegetables'
    );
  });

  it('should get keys without pattern', (done) => {
    expect(keys).to.exist.and.be.a('function');

    keys((error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should get keys with given pattern', (done) => {
    expect(keys).to.exist.and.be.a('function');

    keys('users', (error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should get keys with given pattern', (done) => {
    expect(keys).to.exist.and.be.a('function');

    keys('users:abc:likes', (error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should obtain redis server info', (done) => {
    info((error, serverInfo) => {
      expect(error).to.not.exist;
      expect(serverInfo).to.exist;
      done(error, serverInfo);
    });
  });

  it('should quit all redis clients', () => {
    expect(quit).to.exist.and.be.a('function');

    const { client, cli, locker, warlocker, publisher, subscriber } =
      createClients();

    expect(client).to.exist;
    expect(cli).to.exist;
    expect(locker).to.exist;
    expect(warlocker).to.exist;
    expect(publisher).to.exist;
    expect(subscriber).to.exist;

    const quited = quit();
    expect(quited.client).to.not.exist;
    expect(quited.cli).to.not.exist;
    expect(quited.locker).to.not.exist;
    expect(quited.warlocker).to.not.exist;
    expect(quited.publisher).to.not.exist;
    expect(quited.subscriber).to.not.exist;
  });
});

describe('set', () => {
  before((done) => clear(done));

  it('should not set with no key and value', (done) => {
    set((error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should not set with not value', (done) => {
    const key = faker.datatype.uuid();

    set(key, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should set string', (done) => {
    const key = faker.datatype.uuid();
    const value = faker.random.word();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set number', (done) => {
    const key = faker.datatype.uuid();
    const value = faker.datatype.number();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set array', (done) => {
    const key = faker.datatype.uuid();
    const value = [faker.random.word(), faker.random.word()];

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set plain object', (done) => {
    const key = faker.datatype.uuid();
    const value = faker.helpers.createTransaction();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set expiry', (done) => {
    const key = faker.datatype.uuid();
    const value = faker.random.word();

    set(key, value, 'EX', 1, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set save strategy', (done) => {
    const key = faker.datatype.uuid();
    const value = faker.random.word();

    set(key, value, 'EX', 1, 'NX', (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  after((done) => clear(done));
});

describe('get', () => {
  before((done) => clear(done));

  const keyString = faker.datatype.uuid();
  const string = faker.random.word();

  const keyNumber = faker.datatype.uuid();
  const number = faker.datatype.number();

  const keyArray = faker.datatype.uuid();
  const array = [faker.random.word(), faker.random.word()];

  const keyObject = faker.datatype.uuid();
  const object = _.omit(faker.helpers.createTransaction(), 'date');

  before((done) => set(keyString, string, done));
  before((done) => set(keyNumber, number, done));
  before((done) => set(keyArray, array, done));
  before((done) => set(keyObject, object, done));

  it('should return', (done) => {
    get((error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should get string', (done) => {
    get(keyString, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(string);
      done(error, result);
    });
  });

  it('should get number', (done) => {
    get(keyNumber, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(number);
      done(error, result);
    });
  });

  it('should get array', (done) => {
    get(keyArray, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(array);
      done(error, result);
    });
  });

  it('should get plain object', (done) => {
    get(keyObject, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(object);
      done(error, result);
    });
  });

  after((done) => clear(done));
});

describe('count', () => {
  beforeEach((done) => clear(done));

  before((done) => {
    createMulti().set('abc:1', 1).set('abc:2', 2).set('abc:3', 3).exec(done);
  });

  it('should be able to count size of keys of specifed pattern', (done) => {
    count('abc:*', (error, keyCount) => {
      expect(error).to.not.exist;
      expect(keyCount).to.exist;
      expect(keyCount).to.be.equal(3);
      done(error, keyCount);
    });
  });

  it('should be able to count size of keys of specifed patterns', (done) => {
    count('abc:*', 'xx:*', (error, keyCounts) => {
      expect(error).to.not.exist;
      expect(keyCounts).to.exist;
      expect(keyCounts).to.have.length(2);
      expect(_.first(keyCounts)).to.be.equal(3);
      expect(_.last(keyCounts)).to.be.equal(0);
      done(error, keyCounts);
    });
  });

  after((done) => clear(done));
});

describe('config', () => {
  beforeEach((done) => clear(done));

  it('should be able to set config', (done) => {
    config('SET', 'notify-keyspace-events', 'xE', (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.be.equal('OK');
      done(error, results);
    });
  });

  it('should be able to set config with setConfig', (done) => {
    setConfig('notify-keyspace-events', 'xE', (error, results) => {
      expect(error).to.not.exist;
      expect(results).to.be.equal('OK');
      done(error, results);
    });
  });

  it('should be able to get config', (done) => {
    config('GET', 'notify-keyspace-events', (error, [key, value]) => {
      expect(error).to.not.exist;
      expect(key).to.be.equal('notify-keyspace-events');
      expect(value).to.be.equal('xE');
      done(error, [key, value]);
    });
  });

  it('should be able to get config with getConfig', (done) => {
    getConfig('notify-keyspace-events', (error, [key, value]) => {
      expect(error).to.not.exist;
      expect(key).to.be.equal('notify-keyspace-events');
      expect(value).to.be.equal('xE');
      done(error, [key, value]);
    });
  });

  after((done) => clear(done));
});

describe('clear', () => {
  beforeEach((done) => clear(done));

  it('should clear all data', (done) => {
    clear((error, cleared) => {
      expect(error).to.not.exist;
      done(error, cleared);
    });
  });

  after((done) => clear(done));
});

describe('warlock', () => {
  beforeEach((done) => clear(done));

  it('should lock with default ttl', (done) => {
    lock('schedule:1', (error, unlock) => {
      expect(error).to.not.exist;
      expect(unlock).to.exist.and.be.a('function');
      done(error, unlock);
    });
  });

  it('should lock with given ttl', (done) => {
    lock('schedule:2', 2000, (error, unlock) => {
      expect(error).to.not.exist;
      expect(unlock).to.exist.and.be.a('function');
      done(error, unlock);
    });
  });

  it('should thrown if lock already acquired', (done) => {
    parallel(
      [(next) => lock('schedule:3', next), (next) => lock('schedule:3', next)],
      (error /* , unlock */) => {
        expect(error).to.exist;
        expect(error.message).to.be.equal('unable to obtain lock');
        done();
      }
    );
  });

  it('should lock and unlock with default ttl', (done) => {
    lock('schedule:4', (error, unlock) => {
      expect(error).to.not.exist;
      expect(unlock).to.exist.and.be.a('function');
      unlock(done);
    });
  });

  it('should lock and unlock with given ttl', (done) => {
    lock('schedule:5', 1000, (error, unlock) => {
      expect(error).to.not.exist;
      expect(unlock).to.exist.and.be.a('function');
      unlock(done);
    });
  });

  after((done) => clear(done));
});
