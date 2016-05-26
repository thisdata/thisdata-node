function remoteIpFromRequest(req){
  return req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;
}

function buildBaseEvent(req, options){
  var options = options || {};

  return {
    ip: options.ip || remoteIpFromRequest(req),
    user_agent: options.userAgent || req.headers['user-agent'],
    user: options.user || {
      id: 'anonymous'
    }
  }
}

module.exports = {
  remoteIpFromRequest: remoteIpFromRequest,
  buildBaseEvent: buildBaseEvent
}