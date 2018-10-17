var express = require("express");
var router = express.Router(); 
var middleware = require("../midware");


//show chatroom page
router.get("/", middleware.isLoggedIn, function(req, res){
    res.render("chatroom/chatroom");
});

module.exports = router; 