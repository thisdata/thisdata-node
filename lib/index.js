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
  this.apiKey = apiKey;
  this.host = options.host || 'https://api.thisdata.com';
  this.verbs = verbs;
  this.event = new Event(options);
}

ThisData.prototype.track = function(req, options, callback){
  var options = options || {};

  var ev = this.event.build(req, options);
  ev.verb = options.verb || verbs.LOG_IN;

  this.send('events', ev, callback);
};

ThisData.prototype.verify = function(req, options, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  var ev = this.event.build(req, options);

  this.send('verify', ev, callback);
};

ThisData.prototype.validateWebhook = function(secret, signature, payload){
  var sig = crypto.createHmac('sha512', secret)
                  .update(new Buffer(payload, 'utf-8'))
                  .digest('hex');

  return scmp(signature, sig);
};

ThisData.prototype.send = function(path, message, callback){
  var options = {
    method: 'POST',
    headers: {
      'User-Agent': 'thisdata-node'
    },
    uri: this.host + '/v1/' + path + '?api_key=' + this.apiKey,
    json: message
  };

  var cb = function(err, res, body){
    if(err || res.statusCode !== 200){
      console.log('ThisData: Error sending to ' + path);
      err = err || res.statusCode
    }
    if (callback){
      callback(err, body);
    }
  };

  try{
    request.post(options, cb);
  } catch(e){
    console.log('ThisData: Error sending to API');
    console.log(e);
  }
}

module.exports = ThisData;

