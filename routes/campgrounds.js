var express = require("express");
var router = express.Router(); 
var Campground = require("../models/campground"); 
var middleware = require("../midware");
var User = require("../models/user");
var Notification = require("../models/notification");

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
      res.redirect(`/campground/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});
// router.post("/", middleware.isLoggedIn, function(req, res){
//     //get data from form and store in sys
//     //console.log(req);
//     var name = req.body.name; 
//     var url =  req.body.img; 
//     var description =  req.body.description; 
//     var author = {
//         id: req.user._id, 
//         username: req.user.username
//     }; 
//     var newCamp = {name: name, image: url, description: description, author: author};
    
//     //save to mongo db
//     Campground.create(newCamp, function(err, newlyCreated){
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(newCamp);
//             res.redirect("/campground");
//         }
//     });
// });

//show more infor. about chosen PG item 
router.get("/:id", function(req, res) {
    //find the campground with the id, in db, then render the information in db on web-page
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCG){
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCG});
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
           res.redirect("/campground");
       } else {
           res.redirect("/campground/" + req.params.id);
       }
   })
   //redirect to the updated CG
});

//destrop CG route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err){
       if (err) {
           res.redirect("/campground");
       } else {
           res.redirect("/campground");
       }
    });
});

module.exports = router; 