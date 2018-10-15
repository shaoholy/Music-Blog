
//all midware

var middlewareObj = {};
var Campground = require("../models/campground"); 
var Comment = require("../models/comment"); 


middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
}
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundcampground){
           if (err) {
               req.flash("error", "Campground not found.");
               res.redirect("/campground"); 
           } else {
               //if user matched
               if (foundcampground.author.id.equals(req.user._id)) {
                   next(); 
               } else {
                   req.flash("error", "You are not the owner of the campground.");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}
middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.id, function(err, foundComment){
           if (err) {
               req.flash("error", "Comment not found.");
               res.redirect("back"); 
           } else {
               //if user matched
               if (foundComment.author.id.equals(req.user._id)) {
                   next(); 
               } else {
                   req.flash("error", "You are not the owner of the comment.");
                   res.redirect("back");
               }
           }
        });
        
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}

module.exports = middlewareObj;