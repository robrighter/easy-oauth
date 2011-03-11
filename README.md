EasyOAuth
=================

EasyOAuth is a simple module that is intended to make it very easy to add OAuth to your node.js website.

Installation
================= 
	
	npm install easy-oauth

This will automatically install the dependencies (connect, oauth, connect-auth, express)


Usage
=================

(1) Setup your OAuth Keys

* Copy down example_keys_file.js from https://github.com/robrighter/easy-oauth/blob/master/example_keys_file.js
* Rename it to keys_file.js.
* Edit it to include the keys associated with your oauth application.


(2) Usage on the Server Side
(NOTE: This example assumes you are using express 2.0 however, the module will work with earlier versions of express)

		var connect = require('connect');
		var express = require('express');
		var easyoauth = require('easy-oauth');
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

(3) Usage on the Client Side

**Include JQuery and the EasyOAuth Client Lib**

		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
		<script>!window.jQuery && document.write('<script src="js/jquery-1.4.2.min.js"><\/script>')</script>
		<script src="/auth/client"></script>

**Then use it in your client side javascript:**

		var authcallback = function(data){
		  $('.details').html('<p>You are all signed in as <strong>'
		        +data.user.username+
		        '</strong><br>...and here are some details:'
		        +JSON.stringify(data.user)+
		        '</p><a href="/logout">logout</a>').fadeIn('slow');
		}

		$('#twitbutt').click(function(){
		  openEasyOAuthBox('twitter',authcallback);
		});

		$('#facebutt').click(function(){
		   openEasyOAuthBox('facebook',authcallback);
		});

(4) Access Protected Resources

Once a user has OAuth'd in, you will have access to the access keys via the expressjs request object using req.getAuthDetails(). For more information about how to use req.getAuthDetails() to access protected resources, checkout @ciaran_j's https://github.com/ciaranj/connect-auth