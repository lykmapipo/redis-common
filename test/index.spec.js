import { expect } from '@lykmapipo/test-helpers';
import { withDefaults } from '../src/index';

describe('redis-common', () => {
  expect(withDefaults).to.exist;
});
