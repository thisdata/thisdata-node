var assert = require('assert');

function Rules(client){
  this.client = client;
}

Rules.prototype.list = function(callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.get('/rules', {}, function(err, res, body){
    if(err || res.statusCode !== 200){
      err = err || res.statusCode
    }
    callback(err, body);
  });
}

Rules.prototype.get = function(id, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.get('/rules/' + id, {}, function(err, res, body){
    if(err || res.statusCode !== 200){
      err = err || res.statusCode
    }
    callback(err, body);
  });
}

Rules.prototype.create = function(rule, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.post('/rules', { body: rule }, function(err, res, body){
    if(err || res.statusCode !== 201){
      err = err || res.statusCode
    }
    callback(err, body);
  });
}

Rules.prototype.update = function(rule, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.post('/rules/' + rule.id, { body: rule }, function(err, res, body){
    if(err || res.statusCode !== 200){
      err = err || res.statusCode
    }
    callback(err, body);
  });
}

Rules.prototype.delete = function(rule, callback){
  assert(typeof callback === 'function', 'You must pass a callback function to this method');

  this.client.delete('/rules/' + rule.id, {}, function(err, res, body){
    if(err || res.statusCode !== 204){
      err = err || res.statusCode
    }
    callback(err, true);
  });
}

module.exports = Rules;