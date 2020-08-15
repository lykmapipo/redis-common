import _ from 'lodash';
import { expect, faker } from '@lykmapipo/test-helpers';
import {
  withDefaults,
  createClient,
  createLocker,
  createPublisher,
  createSubscriber,
  createPubSub,
  createClients,
  createMulti,
  keyFor,
  set,
  get,
  keys,
  clear,
  info,
  count,
  quit,
} from '../src';

describe('helpers', () => {
  it('should provide default options', () => {
    expect(withDefaults).to.exist.and.be.a('function');

    const options = withDefaults();
    expect(options).to.exist.and.be.an('object');
    expect(options.url).to.exist.and.be.equal('redis://127.0.0.1:6379');
    expect(options.prefix).to.exist.and.be.equal('r');
    expect(options.separator).to.exist.and.be.equal(':');
    expect(options.eventPrefix).to.exist.and.be.equal('events');
    expect(options.lockPrefix).to.exist.and.be.equal('locks');
    expect(options.lockTTL).to.exist.and.be.equal(1000);
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

  it('should create redis clients', () => {
    expect(createClients).to.exist.and.be.a('function');

    const { client, locker, publisher, subscriber } = createClients();

    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');

    expect(locker).to.exist;
    expect(locker.uuid).to.exist;
    expect(locker.prefix).to.exist.and.be.equal('r');

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

    const { client, locker, publisher, subscriber } = createClients();

    expect(client).to.exist;
    expect(locker).to.exist;
    expect(publisher).to.exist;
    expect(subscriber).to.exist;

    const quited = quit();
    expect(quited.client).to.not.exist;
    expect(quited.locker).to.not.exist;
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
    const key = faker.random.uuid();

    set(key, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should set string', (done) => {
    const key = faker.random.uuid();
    const value = faker.random.word();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set number', (done) => {
    const key = faker.random.uuid();
    const value = faker.random.number();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set array', (done) => {
    const key = faker.random.uuid();
    const value = [faker.random.word(), faker.random.word()];

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set plain object', (done) => {
    const key = faker.random.uuid();
    const value = faker.helpers.createTransaction();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set expiry', (done) => {
    const key = faker.random.uuid();
    const value = faker.random.word();

    set(key, value, 'EX', 1, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set save strategy', (done) => {
    const key = faker.random.uuid();
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

  const keyString = faker.random.uuid();
  const string = faker.random.word();

  const keyNumber = faker.random.uuid();
  const number = faker.random.number();

  const keyArray = faker.random.uuid();
  const array = [faker.random.word(), faker.random.word()];

  const keyObject = faker.random.uuid();
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
