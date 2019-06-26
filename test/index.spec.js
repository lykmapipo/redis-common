import { expect } from '@lykmapipo/test-helpers';
import {
  withDefaults,
  createClient,
  createPubSub,
  createClients,
  createMulti,
  key,
  quit,
} from '../src/index';

describe('redis-common', () => {
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
    expect(key()).to.exist;
    expect(key('ab')).to.be.equal('r:ab');
    expect(key(['users', 'ab'])).to.be.equal('r:users:ab');
    expect(key('users', 'likes', 'vegetables')).to.be.equal(
      'r:users:likes:vegetables'
    );
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
});
