
$(document).ready(function() {      
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
});
