import { expect } from '@lykmapipo/test-helpers';
import { withDefaults, createClient, createPubSub } from '../src/index';

describe('redis-common', () => {
  it('should provide default options', () => {
    expect(withDefaults).to.exist.and.be.a('function');

    const options = withDefaults();
    expect(options).to.exist.and.be.an('object');
    expect(options.url).to.exist.and.be.equal('redis://127.0.0.1:6379');
    expect(options.prefix).to.exist.and.be.equal('r');
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
});
