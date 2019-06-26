import { expect } from '@lykmapipo/test-helpers';
import { withDefaults, createClient } from '../src/index';

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
    expect(client.id).to.exist;
    expect(client.prefix).to.exist.and.be.equal('r');
  });

  it('should create redis client with give options', () => {
    expect(createClient).to.exist.and.be.a('function');

    const client = createClient({ prefix: 're', recreate: true });
    expect(client).to.exist;
    expect(client.id).to.exist;
    expect(client.prefix).to.exist.and.be.equal('re');
  });

  it('should not re-create redis client', () => {
    const a = createClient();
    const b = createClient();
    expect(a.id).to.be.equal(b.id);
    expect(a.prefix).to.be.equal(b.prefix);
  });
});
