var express = require("express");
var router = express.Router({mergeParams: true}); 
var Campground = require("../models/campground"); 
var Comment = require("../models/comment"); 
var middleware = require("../midware");



///comment routes

router.get("/new", middleware.isLoggedIn,  function(req, res) {
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.log("ERR");
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
    //res.render("comments/new");
});

//comment 
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground by id
    Campground.findById(req.params.id, function(err, campground) {
       if (err) {
           console.log("err");
           req.flash("error", "Comment not found.");
           res.redirect("/campground");
       } else {
           Comment.create(req.body.comment, function(err, comment){
              if (err){
                  console.log("ERR");
              } else {
                  //add username and id to comment
                  req.username
                  comment.author.id = req.user._id; 
                  comment.author.username = req.user.username;
                  comment.save(); 
                  campground.comments.push(comment);
                  campground.save();
                  req.flash("success", "Successfully comment.");
                  res.redirect('/campground/' + campground._id);
              }
           });
       }
    });
});

//


//route edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if (err) {
           res.redirect("back"); 
       } else {
           res.redirect("/campground/" + req.params.id); 
       }
    });
});

//destrop comment route
router.delete("/:comment_id", middleware.checkCommentOwnership,  function(req, res) {
    //findById remove 
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if (err) {
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted.");
           res.redirect("/campground/" + req.params.id);
       }
    });
});

module.exports = router; 