import _ from 'lodash';
import { expect, faker } from '@lykmapipo/test-helpers';
import {
  withDefaults,
  createClient,
  createPubSub,
  createClients,
  createMulti,
  keyFor,
  set,
  get,
  keys,
  clear,
  info,
  quit,
} from '../src/index';

describe('helpers', () => {
  it('should provide default options', () => {
    expect(withDefaults).to.exist.and.be.a('function');

    const options = withDefaults();
    expect(options).to.exist.and.be.an('object');
    expect(options.url).to.exist.and.be.equal('redis://127.0.0.1:6379');
    expect(options.prefix).to.exist.and.be.equal('r');
    expect(options.separator).to.exist.and.be.equal(':');
  });

  it('should create redis client', () => {
    expect(createClient).to.exist.and.be.a('function');

    const client = createClient();
    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');
  });

  it('should create redis client with give options', () => {
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

  it('should create redis clients', () => {
    expect(createClients).to.exist.and.be.a('function');

    const { client, publisher, subscriber } = createClients();

    expect(client).to.exist;
    expect(client.uuid).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');

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

  it('should get keys without pattern', done => {
    expect(keys).to.exist.and.be.a('function');

    keys((error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should get keys with given pattern', done => {
    expect(keys).to.exist.and.be.a('function');

    keys('users', (error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should get keys with given pattern', done => {
    expect(keys).to.exist.and.be.a('function');

    keys('users:abc:likes', (error, foundKeys) => {
      expect(error).to.not.exist;
      done(error, foundKeys);
    });
  });

  it('should quit all redis clients', () => {
    expect(quit).to.exist.and.be.a('function');

    const { client, publisher, subscriber } = createClients();

    expect(client).to.exist;
    expect(publisher).to.exist;
    expect(subscriber).to.exist;

    const quited = quit();
    expect(quited.client).to.not.exist;
    expect(quited.publisher).to.not.exist;
    expect(quited.subscriber).to.not.exist;
  });

  it('should obtain redis server info', done => {
    info((error, serverInfo) => {
      expect(error).to.not.exist;
      expect(serverInfo).to.exist;
      done(error, serverInfo);
    });
  });
});

describe('set', () => {
  before(done => clear(done));

  it('should not set with no key and value', done => {
    set((error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should not set with not value', done => {
    const key = faker.random.uuid();

    set(key, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.not.exist;
      done(error, result);
    });
  });

  it('should set string', done => {
    const key = faker.random.uuid();
    const value = faker.random.word();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set number', done => {
    const key = faker.random.uuid();
    const value = faker.random.number();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set array', done => {
    const key = faker.random.uuid();
    const value = [faker.random.word(), faker.random.word()];

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set plain object', done => {
    const key = faker.random.uuid();
    const value = faker.helpers.createTransaction();

    set(key, value, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set expiry', done => {
    const key = faker.random.uuid();
    const value = faker.random.word();

    set(key, value, 'EX', 1, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  it('should set save strategy', done => {
    const key = faker.random.uuid();
    const value = faker.random.word();

    set(key, value, 'EX', 1, 'NX', (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(value);
      done(error, result);
    });
  });

  after(done => clear(done));
});

describe('get', () => {
  before(done => clear(done));

  const keyString = faker.random.uuid();
  const string = faker.random.word();

  const keyNumber = faker.random.uuid();
  const number = faker.random.number();

  const keyArray = faker.random.uuid();
  const array = [faker.random.word(), faker.random.word()];

  const keyObject = faker.random.uuid();
  const object = _.omit(faker.helpers.createTransaction(), 'date');

  before(done => set(keyString, string, done));
  before(done => set(keyNumber, number, done));
  before(done => set(keyArray, array, done));
  before(done => set(keyObject, object, done));

  it('should get string', done => {
    get(keyString, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(string);
      done(error, result);
    });
  });

  it('should get number', done => {
    get(keyNumber, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(number);
      done(error, result);
    });
  });

  it('should get array', done => {
    get(keyArray, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(array);
      done(error, result);
    });
  });

  it('should get plain object', done => {
    get(keyObject, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      expect(result).to.be.eql(object);
      done(error, result);
    });
  });

  after(done => clear(done));
});

describe('clear', () => {
  beforeEach(done => clear(done));

  it('should clear all data', done => {
    clear((error, cleared) => {
      expect(error).to.not.exist;
      done(error, cleared);
    });
  });

  after(done => clear(done));
});
