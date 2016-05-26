var assert = require('assert');
var ThisData = require('../lib');

var thisdata;
var fakeEvent;

describe('ThisData', function(){

  beforeEach(function(){
    thisdata = ThisData('fake-key');

    fakeEvent =   {
      ip: '123.123.123.123',
      user_agent: 'Firefox, Windows 98',
      verb: 'log-in',
      user: {
        id: '1234user',
        name: 'Tommy Lee Jones',
        email: 'tommy@thisdata.com'
      }
    };

  });

  it('should expose a constructor', function(){
    assert.equal('function', typeof ThisData);
  });

  it('should not require the new keyword', function(){
    assert(thisdata instanceof ThisData);
  });

  it('should require an api key', function(){
    assert.throws(ThisData, error('You must pass your ThisData api key'));
  });

  describe('#track', function(){

    it('should send a message to thisdata without a callback', function(){
      thisdata.track(fakeEvent);
    });

    it('should send a message to thisdata with optional callback', function(done){
      thisdata.track(fakeEvent, function(err, body){
        done();
      });
    });

  });

  describe('#verify', function(){

    it('should require a callback argument', function(){
      assert.throws(thisdata.verify, error('You must pass a callback function to this method'));
    });

    it('should callback after a successful send to thisdata', function(done){
      thisdata.track(fakeEvent, function(err, body){
        done();
      });
    });

  });

  describe('#validateWebhook', function(){

    before(function(){
      webhookSignature = '291264d1d4b3857e872d67b7587d3702b28519a0e3ce689d688372b7d31f6af484439a1885f21650ac073e48119d496f44dc97d3dc45106409d345f057443c6b';
      webhookPayload = '{"version":1,"was_user":null,"alert":{"id":533879540905150463,"description":null}}'
    });

    it('should validate a webhook with valid secret', function(){
      assert(thisdata.validateWebhook('hello', webhookSignature, webhookPayload));
    });

  });

});

/**
 * Assert an error with `message` is thrown.
 *
 * @param {String} message
 * @return {Function}
 */
function error(message){
  return function(err){
    return err.message == message;
  };
}