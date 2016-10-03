var assert = require('assert');
var http = require('http');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var ThisData = require('../lib');
var eventsPayload = require('./stub/events_list');

var thisdata;
var server;
var eventOptions;

var testServerUrl = 'http://localhost:5001';
var rq = request.defaults({
  baseUrl: testServerUrl
});


describe('ThisData', function(){

  before(function(){

    var app = express();
    app.use(bodyParser.json());

    // Fake ThisData API endpoint
    app.post('/event', function(req, res){
      var ev = thisdata.event.build(req, req.body);
      res.send(ev);
    });

    app.post('/login', function(req, res){
      thisdata.track(req, req.body, function(e, r, b){
        res.send('OK');
      });
    });

    app.post('/transfer', function(req, res){
      thisdata.verify(req, req.body, function(e, r, b){
        res.send(b);
      });
    });

    // FAKE THISDATA ENDPOINTS
    app.post('/v1/events', function(req, res){
      res.type('application/json');
      res.send();
    });

    app.post('/v1/verify', function(req, res){
      res.type('application/json');
      res.send({ score: 0, risk_level: 'green', triggers: [], messages: [] });
    });

    app.get('/v1/events', function(req, res){
      res.type('application/json');
      res.send(eventsPayload);
    });

    server = http.createServer(app);
    server.listen(5001);
  });

  beforeEach(function(){
    thisdata = ThisData('fake-key', {
      host: testServerUrl + '/v1'
    });

    eventOptions = {
      ip: '123.123.123.123',
      user_agent: 'Firefox, Windows 98',
      verb: thisdata.verbs.LOG_IN,
      user: {
        id: 'kingkong123',
        name: 'King Kong',
        email: 'kong@thisdata.com'
      },
      session: {
        id: null,
        td_cookie_expected: false
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

  describe('#event', function(){

    it('should allow authenticated to be set', function(done){
      rq.post('/event', {
          json: {
            user: {
              id: '123',
              authenticated: false
            }
          }
      }, function(err, res, body) {
        assert.equal(body.user.authenticated, false);
        done();
      });
    });

    it('should track devices', function(done){
      rq.post('/event', {
          json: {
            device: {
              id: 'mr-t'
            }
          }
      }, function(err, res, body) {
        assert.equal(body.device.id, 'mr-t');
        done();
      });
    });

    it('should extract default to building event using request properties', function(done){

      var expectedEvent = {
        ip: '123.123.123.123',
        user_agent: 'Chicken Browser',
        user: { id: 'anonymous' },
        session: { id: null, td_cookie_id: 'hello', td_cookie_expected: true },
        device: {}
      }

      rq.post('/event', {
          headers: {
            'User-Agent': 'Chicken Browser',
            'Cookie': '__tdli=hello',
            'X-FORWARDED-FOR': '123.123.123.123'
          },
          json: {
            session: {
              cookieExpected: true
            }
          }
      }, function(err, res, body) {
        assert.deepEqual(body, expectedEvent);
        done();
      });
    });

    it('should be able to customize the cookie name', function(done){

      thisdata = ThisData('fake-key', {
        host: testServerUrl,
        cookieName: 'chocolate'
      });

      rq.post('/event', {
          headers: {
            'Cookie': 'chocolate=chip'
          },
          json: {}
      }, function(err, res, body) {
        assert.equal(body.session.td_cookie_id, 'chip');
        done();
      });
    });

    it('should let cookieExpected be set on initialization', function(done){

      thisdata = ThisData('fake-key', {
        host: testServerUrl,
        cookieExpected: true
      });

      rq.post('/event', {
          json: {}
      }, function(err, res, body) {
        assert.equal(body.session.td_cookie_expected, true);
        done();
      });
    });

  });

  describe('#events', function(){

    it('should allow filtering of events', function(done){

      thisdata.getEvents({
        limit: 1,
        verbs: ['log-in']
      }, function(err, res, body){

        assert.equal('api_key=fake-key&limit=1&verbs%5B0%5D=log-in', res.request.url.query);
        assert.equal(1, body.total);
        assert.deepEqual(eventsPayload, body);

        done();
      });
    });
  });

  describe('#track', function(){

    it('should send a message to thisdata track api', function(done){
      rq.post('login', {
          headers: {
            'User-Agent': 'Chicken Browser'
          },
          json: eventOptions
      }, function(err, res, body) {
        assert.equal('OK', body);
        done();
      });
    });

    it('should not blow up if req is null', function(){
      thisdata.track(null);
    });

  });

  describe('#verify', function(){

    it('should require a callback argument', function(){
      assert.throws(thisdata.verify, error('You must pass a callback function to this method'));
    });

    it('should callback after a successful send to thisdata', function(done){
      rq.post('/transfer', {
          headers: {
            'User-Agent': 'Chicken Browser'
          },
          json: eventOptions
      }, function(err, res, body) {
        assert.equal('green', body.risk_level);

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