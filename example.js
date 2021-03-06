//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , util = require('util')
    , port = (process.env.PORT || 8081);
//other dependancies
// ejs

var easyoauth = require('./lib/easy-oauth');

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({secret : "shhhhhhhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(easyoauth(require('./keys_file')));
    server.use(server.router);
});



server.listen( port);


server.get('/', function(req,res){
  res.render('index.ejs');
});


console.log('Listening on http://0.0.0.0:' + port );
