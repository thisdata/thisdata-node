var assert = require('assert');
var request = require('request');
var crypto = require('crypto');
var scmp = require('scmp');

var verbs = require('./verbs');
var Event = require('./event');

function ThisData (apiKey, options) {
  if (!(this instanceof ThisData)) return new ThisData(apiKey, options);
  assert(apiKey, 'You must pass your ThisData api key');

  var options = options || {};
  this.verbs = verbs;
  this.event = new Event(options);

  this.client = request.defaults({
    headers: {
      'User-Agent': 'thisdata-node'
    },
    baseUrl: options.host || 'https://api.thisdata.com/v1/',
    qs: {
      api_key: apiKey
    },
    json: true
  });
}

ThisData.prototype.track = function(req, options, callback){
  var options = options || {};

  var message = this.event.build(req, options);
  message.verb = options.verb || verbs.LOG_IN;

  this.client.post('/events', {
    body: message
  }, this.responseHandler(callback));
};

ThisData.prototype.verify = function(req, options, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  var message = this.event.build(req, options);

  this.client.post('/verify', {
    body: message
  }, this.responseHandler(callback));
};

ThisData.prototype.getEvents = function(options, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.get('/events', {
    qs: options
  }, this.responseHandler(callback));
};

ThisData.prototype.validateWebhook = function(secret, signature, payload){
  var sig = crypto.createHmac('sha512', secret)
                  .update(new Buffer(payload, 'utf-8'))
                  .digest('hex');

  return scmp(signature, sig);
};

ThisData.prototype.responseHandler = function(callback){
  return function(err, res, body){
    if(err || res.statusCode !== 200){
      err = err || res.statusCode
    }

    if (callback){
      callback(err, body);
    }
  };
}

module.exports = ThisData;

