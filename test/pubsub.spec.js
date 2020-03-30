import _ from 'lodash';
import { expect } from '@lykmapipo/test-helpers';
import { clear, emit, on, publish, subscribe, unsubscribe } from '../src';

describe('publish & subscribe', () => {
  beforeEach((done) => unsubscribe(done));
  beforeEach((done) => clear(done));

  it('should publish event on default channel', (done) => {
    publish({}, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      done(error, result);
    });
  });

  it('should publish event on given channel', (done) => {
    publish('clicks', {}, (error, result) => {
      expect(error).to.not.exist;
      expect(result).to.exist;
      done(error, result);
    });
  });

  it('should subscribe for event on default channel', (done) => {
    const payload = {};
    subscribe((channel, message) => {
      expect(channel).to.exist;
      expect(message).to.exist.and.be.eql(payload);
      done();
    });
    _.delay(() => publish(payload), 100);
  });

  it('should subscribe for event on given channel', (done) => {
    const payload = {};
    subscribe('clicks', (channel, message) => {
      expect(channel).to.exist;
      expect(message).to.exist.and.be.eql(payload);
      done();
    });
    _.delay(() => publish('clicks', payload), 100);
  });

  it('should listen event on given channel', (done) => {
    const payload = {};
    on('logs', (channel, message) => {
      expect(channel).to.exist;
      expect(message).to.exist.and.be.eql(payload);
      done();
    });
    _.delay(() => emit('logs', payload), 100);
  });

  after((done) => unsubscribe(done));
  after((done) => clear(done));
});
