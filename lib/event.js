var cookie = require('cookie');
var cookieName;

function remoteIpFromRequest(req){
  if(!req) return '';
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function userAgentFromRequest(req){
  if(!req) return '';
  return req.headers['user-agent']
}

function cookieIdFromRequest(req){
  if(!req) return null;

  var cookies = cookie.parse(req.headers['cookie'] || '');

  return cookies[cookieName] || null;
}

function buildEvent(req, options){
  var options = options || {};
  var session = options.session || { };

  return {
    ip: options.ip || remoteIpFromRequest(req),
    user_agent: options.userAgent || userAgentFromRequest(req),
    user: options.user || {
      id: 'anonymous'
    },
    session: {
      id: session.id || null,
      td_cookie_id: cookieIdFromRequest(req),
      td_cookie_expected: session.cookieExpected || false
    },
    device: options.device || {}
  }
}

module.exports = function(options){

  var options = options || {};
  cookieName = options.cookieName || "__tdli";

  return {
    build: buildEvent
  };
}
