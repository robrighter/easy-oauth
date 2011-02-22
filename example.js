//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , sys = require('sys')
    , port = (process.env.PORT || 8081);
//other dependancies
// ejs

var easyoauth = require('./lib/easy-oauth').EasyOAuth;

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(connect.bodyDecoder());
    server.use(express.cookieDecoder());
    server.use(express.session({secret : "shhhhhhhhhhhhhh!"}));
    server.use(connect.staticProvider(__dirname + '/static'));
    easyoauth(server,['twitter','facebook'], require('./keys_file'));
    server.use(server.router);
});



server.listen( port);


server.get('/', function(req,res){
  res.render('index.ejs');
});


console.log('Listening on http://0.0.0.0:' + port );
