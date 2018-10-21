var express = require("express");
var router = express.Router(); 
var Campground = require("../models/campground"); 
var passport = require("passport");
var User = require("../models/user");
var Comment = require("../models/comment");  
var middleware = require("../midware");
var Notification = require("../models/notification");

//homepage route
router.get("/", function(req, res){
    res.render("landing");
});
//show all cg
router.get("/album", function(req, res){
    
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
            res.redirect("/album"); 
        });
    });
});


//add show login form
router.get("/login", function(req,res){
   res.render("login"); 
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/album",
        failureRedirect: "/login"
        
    }) ,function(req, res){
});

//3, logout route
router.get("/logout", function(req,res){
    req.logout(); 
    req.flash("success", "Successfully logged out");
    res.redirect("/album");
});


// user profile
router.get('/users/:id', async function(req, res) {
  try {
    let user = await User.findById(req.params.id).populate('followers').exec();
    res.render('profile', { user });
  } catch(err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/album/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

module.exports = router; 