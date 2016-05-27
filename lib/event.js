function remoteIpFromRequest(req){
  if(!req) return '';
  return req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;
}

function userAgentFromRequest(req){
  if(!req) return '';
  return req.headers['User-Agent']
}

function buildEvent(req, options){
  var options = options || {};

  return {
    ip: options.ip || remoteIpFromRequest(req),
    user_agent: options.userAgent || userAgentFromRequest(req),
    user: options.user || {
      id: 'anonymous'
    }
  }
}

exports.build = buildEvent;