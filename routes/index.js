var express = require("express");
var router = express.Router(); 
var Campground = require("../models/campground"); 
var passport = require("passport");
var User = require("../models/user");
var Comment = require("../models/comment");  

//homepage route
router.get("/", function(req, res){
    res.render("landing");
});
//show all cg
router.get("/campground", function(req, res){
    
    Campground.find({}, function(err, allCampgrounds){
        if (err) {
            console.log("ERR!");
        } else {
            res.render("campgrounds/index", {campground: allCampgrounds});
        }
    });
});

//User Authentication Routes

//1, show register form
router.get("/register", function(req, res) {
    res.render("register");
});

//2, handle sign up 
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if (err) {
            req.flash("error", err.message); 
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to our website" + user.username); 
            res.redirect("/campground"); 
        });
    });
});


//add show login form
router.get("/login", function(req,res){
   res.render("login"); 
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campground",
        failureRedirect: "/login"
        
    }) ,function(req, res){
});

//3, logout route
router.get("/logout", function(req,res){
    req.logout(); 
    req.flash("success", "Successfully logged out");
    res.redirect("/campground");
});


module.exports = router; 