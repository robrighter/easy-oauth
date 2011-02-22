(function(){
  var auth = require('connect-auth');
  exports.EasyOAuth = function(app, strategies, keys) {  
    var stratlist = strategies.map(function(s){
      switch(s){
        case 'twitter':
          return auth.Twitter({consumerKey: keys.twitterConsumerKey, consumerSecret: keys.twitterConsumerSecret});
          break;
        case 'facebook':
          return auth.Facebook({appId : keys.fbId, appSecret: keys.fbSecret, scope: "email", callback: keys.fbCallbackAddress});
          break;
        case 'google':
          return auth.Google({consumerKey: keys.googleConsumerKey, consumerSecret: keys.googleConsumerSecret, scope: "", callback: keys.googleCallbackAddress});
          break;
        default:
         throw "unknown authentication strategy";
      }
    });
    app.use(auth(stratlist));
  
    var oauthInfoRequests = {};
  
    app.get("/auth/longpoll", function(req, res, match){
      var callback = function(oauthsession){ res.send(oauthsession);}
      var authdetails = req.getAuthDetails();
    
      if(authdetails.hasOwnProperty('user')){
        //this person is already oauthed in so just return it
        callback(authdetails);
      }
      else{
        //this person is not oauthed in yet. So defer the response until we have it.
        oauthInfoRequests[req.sessionId] = callback;
      }
    });
  
  
    //setup the routes for each of the strategies
    strategies.forEach(function(strategy){
      app.get ('/auth/' + strategy, function(req,res,params){
        runstrategy(strategy, req, res, params);
      });
    });
  
    var runstrategy = function(strategy, req, res, params) {
      req.authenticate([strategy], function(error, authenticated) {
        if( authenticated ) {
          if(oauthInfoRequests.hasOwnProperty(req.sessionId)){
            //we got a request waiting so send it back:
            oauthInfoRequests[req.sessionId](req.getAuthDetails());
            //now delete it from the list because its been notified
            delete oauthInfoRequests[req.sessionId];
          }
          res.send("<html><p>You can now <a href='#' onclick='self.close();'>close this window</a> and follow or unfollow whomever you wish.</p>" +
                   "<script type='text/javascript'>self.close();</script></html>");
        }
        else {
          res.end("<html><h1>Authentication failed :( </h1></html>")
        }
      });
    }
    
    app.get('/auth/client', function(req,res,params){
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
  }
})();
