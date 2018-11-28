var express = require("express");
var router = express.Router(); 
var Campground = require("../models/campground"); 
var middleware = require("../midware");
var User = require("../models/user");
var Notification = require("../models/notification");
var Comment = require("../models/comment");
var Review = require("../models/review");

//show form to create cg
router.get("/new",middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs");
});

//show all cg
router.get("/", function(req, res){
    
    Campground.find({}, function(err, allCampgrounds){
        if (err) {
            console.log("ERR!");
        } else {
            res.render("campgrounds/index", {campground: allCampgrounds});
        }
    });
});

//post a new pg
router.post("/", middleware.isLoggedIn, async function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.img;
    var artist = req.body.artist;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, artist: artist, description: desc, author:author}

    try {
      let campground = await Campground.create(newCampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        campgroundId: campground.id
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to campgrounds/id page
      res.redirect(`/album/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});

// //show more infor. about chosen PG item 
// router.get("/:id", function(req, res) {
//     //find the campground with the id, in db, then render the information in db on web-page
//     Campground.findById(req.params.id).populate("comments").exec(function(err, foundCG){
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("campgrounds/show", {campground: foundCG});
//         }
//     });
// });

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//edit cg route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    //is user loggin? 
    Campground.findById(req.params.id, function(err, foundcampground){
       res.render("campgrounds/edit", {campground: foundcampground});
    });
});

//update cg route

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   //find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updateCampground) {
       if (err) {
           res.redirect("/album");
       } else {
           res.redirect("/album/" + req.params.id);
       }
   })
   //redirect to the updated CG
});

//destrop CG route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err){
       if (err) {
           res.redirect("/album");
       } else {
           res.redirect("/album");
       }
    });
});
// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/album");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/album");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/album");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/album");
                });
            });
        }
    });
});

module.exports = router; 