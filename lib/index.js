var assert = require('assert');
var request = require('request');
var crypto = require('crypto');
var scmp = require('scmp');

module.exports = ThisData;

function ThisData (apiKey, options) {
  if (!(this instanceof ThisData)) return new ThisData(apiKey, options);
  assert(apiKey, 'You must pass your ThisData api key');

  options = options || {};
  this.apiKey = apiKey;
  this.host = options.host || 'api.thisdata.com';
}

ThisData.prototype.track = function(message, callback){
  this.send('events', message, callback);
};

ThisData.prototype.verify = function(message, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');
  this.send('verify', message, callback);
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
    uri: 'https://' + this.host + '/v1/' + path + '?api_key=' + this.apiKey,
    json: message
  };

  var cb = function(err, res, body){
    if(err){
      console.log('ThisData: Error sending to ' + path);
      console.log(body);
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



