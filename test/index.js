var assert = require('assert');
var http = require('http');
var request = require('request');
var express = require('express');
var ThisData = require('../lib');

var thisdata;
var eventOptions;
var server;
var testServerUrl;

describe('ThisData', function(){

  before(function(){
    testServerUrl = 'http://localhost:5001';

    thisdata = ThisData('fake-key', {
      host: testServerUrl
    });

    eventOptions = {
      ip: '123.123.123.123',
      user_agent: 'Firefox, Windows 98',
      verb: thisdata.verbs.LOG_IN,
      user: {
        id: 'kingkong123',
        name: 'King Kong',
        email: 'kong@thisdata.com'
      }
    };

    var app = express();

    // Fake ThisData API endpoint
    app.post('/v1/events', function(req, res){
      res.type('application/json');
      res.send();
    });

    app.post('/v1/verify', function(req, res){
      res.type('application/json');
      res.send();
    });

    // Fake Express app controller
    app.post('/login', function(req, res){
      thisdata.track(req, eventOptions, function(err, body){
        res.send('OK');
      });
    });

    app.post('/transfer', function(req, res){
      thisdata.verify(req, eventOptions, function(err, body){
        res.send('OK');
      });
    });

    server = http.createServer(app);
    server.listen(5001);
  });

  before(function(){
    testServerUrl = 'http://localhost:5001';

    thisdata = ThisData('fake-key', {
      host: testServerUrl
    });

    eventOptions = {
      ip: '123.123.123.123',
      user_agent: 'Firefox, Windows 98',
      verb: thisdata.verbs.LOG_IN,
      user: {
        id: 'kingkong123',
        name: 'King Kong',
        email: 'kong@thisdata.com'
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

  it('should expose verbs as constants', function(){
    assert.equal(thisdata.verbs.LOG_IN, 'log-in');
  });

  describe('#track', function(){

    it('should send a message to thisdata track api', function(done){
      request({
          method:'POST',
          url: testServerUrl + '/login',
          headers: {
            'User-Agent': 'Chicken Browser'
          }
      }, function(err, res, body) {
        assert.equal('OK', body);
        done();
      });
    });

  });

  describe('#verify', function(){

    it('should require a callback argument', function(){
      assert.throws(thisdata.verify, error('You must pass a callback function to this method'));
    });

    it('should callback after a successful send to thisdata', function(done){
      request({
          method:'POST',
          url: testServerUrl + '/transfer',
          headers: {
            'User-Agent': 'Chicken Browser'
          }
      }, function(err, res, body) {
        assert.equal('OK', body);
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