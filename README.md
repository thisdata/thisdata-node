thisdata-node [![Build Status](https://travis-ci.org/thisdata/thisdata-node.png?branch=master)](https://travis-ci.org/thisdata/thisdata-node)
=============

thisdata-node is a nodejs client for the ThisData Login Intelligence API (https://thisdata.com).

## Setup
Install the latest thisdata-node package from npm
```sh
npm install thisdata --save
```

Create a ThisData client
```js
var ThisData = require('thisdata');
var thisdata = ThisData("YOUR API KEY FROM THISDATA");
```

## Track Events
Use this method to asynchronously track events that happen in your app.

```js
thisdata.track(request, options);
```

To track login related events, find the point in your code just after
a login success, failure or password reset and use the `track` method to
send data to the ThisData API.
```js
thisdata.track(req, {
  verb: thisdata.verbs.LOG_IN,
  user: {
    id: 'john123455',
    name: 'John Titor',
    email: 'john+titor@thisdata.com'
  }
});
```

### Options
`ip` and `user_agent` are extracted from `req` but you can override these value and supply additional fields using options.

```js
{
  verb: 'transfer',
  ip: '0.0.0.0',
  userAgent: 'Firefox, Windows 98',
  user: {
    id: 'john123455',
    name: 'John Titor',
    email: 'john+titor@thisdata.com'
  },
  session: {
    id: 'Optional'
    cookieExpected: true
  },
  device: {
    id: 'mobile-device-id'
  }
}
```

* `user.name` - string The full name of the user
* `user.email` - string - An email address for sending unusual activity alerts to
* `user.mobile` - E.164 format - An mobile number for sending unusual activity SMS alerts to. e.g. +15555555555
* `session.id` - string - Typically a browser session id but it's up to you
* `session.cookieExpected` - boolean - Used in combination with [ThisData Javascript](http://help.thisdata.com/docs/better-tracking-using-javascript). Set `true` if the script is installed
* `device.id` - string - A unique device identifier. Typically used for tracking mobile devices.

### Event Types
We recommend using verb constants `thisdata.verbs.LOG_IN` but you can use any verb that represents the type of event that you want to track.

For a full list of verbs see [http://help.thisdata.com/v1.0/docs/verbs](http://help.thisdata.com/v1.0/docs/verbs)

## Verify Identity
Use the `Verify` method to enable contextual authentication in your app. It accepts the same parameters as the `Track` event with the exception of the event type/verb.

```js
thisdata.verify(request, options, callback);
```

Verify will return a risk score between 0->1 which indicates our level confidence that the user is who they say they are.

```js
{ score: 0, risk_level: 'green', triggers: [], messages: [] }
```

0.0 - low risk/high confidence it's the real user

1.0 - high risk/low confidence it's the real user


```js
thisdata.verify(req, {
  user: {
    id: 'john123455',
    name: 'John Titor',
    email: 'john+titor@thisdata.com'
  }
}, function(err, body){

  if(body.score > 0.9){
    // Step up authentication
  }

});
```

### Get a list of Events
You can get a list of events enriched with their risk score and location data for use in custom audit logs. See the [docs for possible query filters and paging params](http://help.thisdata.com/docs/v1getevents).

```js
thisdata.getEvents(options, callback);
```

Get last successful log-in time and location for a user.

```js
thisdata.getEvents({
  user_id: 'john123455',
  limit: 1,
  verbs: ['log-in']
}, function(err, body){

  // last login was from
  var loginCity = body.results[0].location.address.city_name;

});
```

### Webhooks
You should validate incoming webhooks to make sure they're from ThisData. To do this you will enter a secret string
in the settings area of your ThisData account and then use that same secret to validate the webhook signature
that we send in the `X-Signature` header.

```js
var valid = thisdata.validateWebhook('your shared secret', 'X-Signature value', 'request body');
```

For more information about types of webhooks you can receive see http://help.thisdata.com/docs/webhooks

## API Documentation

API Documentation is available at [http://help.thisdata.com/docs/apiv1events](http://help.thisdata.com/docs/apiv1events).

## Test
Run the unit tests
```sh
npm test
```

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/thisdata/thisdata-node

