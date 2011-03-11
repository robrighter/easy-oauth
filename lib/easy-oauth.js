module.exports = function(keys) {
  var app = require('express').createServer(),
      auth = require('connect-auth');
  var strategies = [],
      oauthInfoRequests = {};
      
  Object.keys(keys).forEach(function(k){
    switch( k ) {
      case 'twitter':
        strategies.push( auth.Twitter({ consumerKey: keys.twitter.consumerkey, consumerSecret: keys.twitter.consumersecret, callback: keys.twitter.callback }) );
        break;
      case 'facebook':
        strategies.push( auth.Facebook({ appId : keys.facebook.id, appSecret: keys.facebook.secret, scope: 'email', callback: keys.facebook.callback }) );
        break;
      default:
        throw 'unknown authentication strategy';
    }
  });

  app.use( auth(strategies) );

  app.get('/auth/longpoll', function(req, res, match){
    var callback = function(oauthsession){ res.send(oauthsession); }
    var authdetails = req.getAuthDetails();
    
    if( authdetails.hasOwnProperty('user') ){
      // this person is already oauthed in so just return it
      callback(authdetails);
    }
    else{
      // this person is not oauthed in yet. So defer the response until we have it.
      oauthInfoRequests[req.sessionID] = callback;
      res.socket.on('end',  function(){
        if( oauthInfoRequests.hasOwnProperty(req.sessionID) ){
          // we lost connection to the browser so lets just go ahead and delete
          // this one to avoid a memory leak
          delete oauthInfoRequests[req.sessionID];
        }
      });
    }
  });

  // setup the routes for each of the strategies
  strategies.forEach(function(strategy){
    app.get ('/auth/' + strategy.name, function(req,res,params){
      runstrategy(strategy.name, req, res, params);
    });
  });

  var runstrategy = function(strategy, req, res, params) {
    req.authenticate([strategy], function(error, authenticated) {
      if( authenticated ) {
        if( oauthInfoRequests.hasOwnProperty(req.sessionID) ){
          // we got a request waiting so send it back:
          oauthInfoRequests[req.sessionID](req.getAuthDetails());
          // now delete it from the list because its been notified
          delete oauthInfoRequests[req.sessionID];
        }
        res.send("<html><p>You can now <a href='#' onclick='self.close();'>close this window</a> and follow or unfollow whomever you wish.</p>" +
                 "<script type='text/javascript'>self.close();</script></html>");
      }
      else {
        res.end("<html><h1>Authentication failed :( </h1></html>")
      }
    });
  }
  
  app.get('/auth/client', function(req, res, params){
    res.header('Content-Type', 'application/javascript');
    var tosend = "var openEasyOAuthBox = function(strategy, callback){"
               + "  window.open('/auth/' + strategy,'Login with Twitter','menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450');"
               + "  $.get('/auth/longpoll', callback);"
               + "}";
    res.send(tosend);
  });

  app.get ('/logout', function(req, res, params) {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
  });
  
  return app;
}