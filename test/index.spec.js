import { expect } from '@lykmapipo/test-helpers';
import { withDefaults } from '../src/index';

describe('redis-common', () => {
  it('should provide default options', () => {
    expect(withDefaults).to.exist.and.be.a('function');

    const options = withDefaults();
    expect(options).to.exist.and.be.an('object');
    expect(options.url).to.exist.and.be.equal('redis://127.0.0.1:6379');
    expect(options.prefix).to.exist.and.be.equal('r');
  });
});
