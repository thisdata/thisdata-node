var assert = require('assert');
var http = require('http');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var ThisData = require('../lib');

var thisdata;
var server;

var testServerUrl = 'http://localhost:5021';
var rq = request.defaults({
  baseUrl: testServerUrl
});


describe('ThisData', function(){

  before(function(){

    var app = express();
    app.use(bodyParser.json());

    // FAKE THISDATA ENDPOINTS
    app.get('/v1/rules', function(req, res){
      res.type('application/json');
      res.send([{
        "id": "123456",
        "name": "A node rule",
        "description": "Node rule",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["6.6.6.6","7.7.7.7"]
      },{
        "id": "132456789",
        "name": "A node rule 2",
        "description": "Node rule 2",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["0.0.0.0/0"]
      }]);
    });

    app.get('/v1/rules/123456', function(req, res){
      res.type('application/json');

      var rule = {
        "id": "123456",
        "name": "A node rule",
        "description": "Node rule",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["6.6.6.6","7.7.7.7"]
      }

      res.send(rule);
    });    

    app.post('/v1/rules', function(req, res){
      res.type('application/json');

      var rule = req.body;
      rule.id = "654321";

      res.send(rule);
    });
    app.post('/v1/rules/123456', function(req, res){
      res.type('application/json');

      var rule = {
        "id": "123456",
        "name": "Updated node rule",
        "description": "Node rule",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["6.6.6.6","7.7.7.7"]
      }

      res.send(rule);
    });
    app.delete('/v1/rules/123456', function(req, res){
      res.type('application/json');
      res.send(204);
    });

    server = http.createServer(app);
    server.listen(5021);
  });

  beforeEach(function(){
    thisdata = ThisData('fake-key', {
      host: testServerUrl + '/v1'
    });
  });


  describe('#rules', function(){
    it('should return a list of rules', function(done){
      thisdata.rules.list(function(err, rules){
        assert.equal(2, rules.length);
        done();
      });
    });

    it('should return a single rule', function(done){
      thisdata.rules.get("123456", function(err, rule){

        var expected = {
          "id": "123456",
          "name": "A node rule",
          "description": "Node rule",
          "type": "blacklist",
          "target": "location.ip",
          "filters": ["6.6.6.6","7.7.7.7"]
        };        

        assert.deepEqual(rule, expected);
        done();
      });
    });

    it('should allow rules to be created', function(done){
      var new_rule = {
        "name": "A node rule",
        "description": "Node rule",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["6.6.6.6","7.7.7.7"]
      };

      var expected = {
        "id": "654321",
        "name": "A node rule",
        "description": "Node rule",
        "type": "blacklist",
        "target": "location.ip",
        "filters": ["6.6.6.6","7.7.7.7"]
      };

      thisdata.rules.create(new_rule, function(err, rule){
        assert.deepEqual(rule, expected);
        done();
      });
    });

    it('should allow rules to be updated', function(done){
      var updated_rule = {
        "id": "123456",
        "name": "Updated node rule"
      };

      thisdata.rules.update(updated_rule, function(err, rule){
        assert.equal(rule.name, "Updated node rule");
        done();
      });
    });

    it('should allow rules to be deleted', function(done){
      thisdata.rules.delete("123456", function(err, deleted){
        assert.equal(deleted, true);
        done();
      });
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