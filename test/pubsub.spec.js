import _ from 'lodash';
import { expect } from '@lykmapipo/test-helpers';
import { clear, publish, subscribe } from '../src';

describe('pubsub - publish & subscribe', () => {
  beforeEach(done => clear(done));

  it('should publish event on default channel', done => {
    publish({}, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      done(error, result);
    });
  });

  it('should publish event on given channel', done => {
    publish('clicks', {}, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      done(error, result);
    });
  });

  it('should subscribe for event on default channel', done => {
    const payload = {};
    subscribe((channel, message) => {
      expect(channel).to.exist;
      expect(message).to.exist.and.be.eql(payload);
      done();
    });
    _.delay(() => publish(payload), 100);
  });

  it('should subscribe for event on given channel', done => {
    const payload = {};
    subscribe('clicks', (channel, message) => {
      expect(channel).to.exist;
      expect(message).to.exist.and.be.eql(payload);
      done();
    });
    _.delay(() => publish('clicks', payload), 100);
  });

  after(done => clear(done));
});
