thisdata-node [![Build Status](https://travis-ci.org/thisdata/thisdata-node.png?branch=master)](https://travis-ci.org/thisdata/thisdata-dotnet)
=============

thisdata-node is a nodejs client for the ThisData Login Intelligence API (https://thisdata.com).

## Setup
Install the [latest thisdata-node package]() from npm
```
npm install thisdata --save
```

Create a ThisData client
```
var ThisData = require('thisdata');
var thisdata = ThisData("YOUR API KEY FROM THISDATA");
```

## Track Events
Find the point in your code just after a login success, failure or password reset
and use the `track` method to send data to the ThisData API.
```
thisdata.track({
  verb: 'log-in',
  ip: '0.0.0.0',
  user_agent: 'Firefox, Windows 98',
  user: {
    id: 'john123455',
    name: 'John Titor',
    email: 'john+titor@thisdata.com'
  }
});
```

### Optional params
* `user.name` - string The full name of the user
* `user.email` - string - An email address for sending unusual activity alerts to
* `user.mobile` - E.164 format - An mobile number for sending unusual activity SMS alerts to. e.g. +15555555555

### Event Types
For a full list of supported verbs see http://help.thisdata.com/v1.0/docs/verbs

### Webhooks
You should validate incoming webhooks to make sure theyre from ThisData. To do this you will enter a secret string
in the settings area of your ThisData account and then use that same secret to validate the webhook signature
that we send in the `X-Signature` header.

```
// returns true or false
thisdata.validateWebhook('your shared secret', 'X-Signature value', 'request body');
```

For more information about types of webhooks you can recieve see http://help.thisdata.com/docs/webhooks

## API Documentation

API Documentation is available at [http://help.thisdata.com/docs/apiv1events](http://help.thisdata.com/docs/apiv1events).
