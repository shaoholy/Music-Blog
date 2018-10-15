var express         = require("express"),
    app             = express(),
    request         = require("request"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    seedDB          = require("./seed"), 
    passport        = require("passport"), 
    User            = require("./models/user"),
    LocalStrategy   = require("passport-local"),
    flash           = require("connect-flash"),
    methodOverride  = require("method-override");

var commentRoutes      = require("./routes/comments"),
    campgroundRoutes   = require("./routes/campgrounds"),
    indexRoutes        = require("./routes/index"); 

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//passport config
app.use(require("express-session")({
   secret: "once again song fang is cutiest",
   resave: false, 
   saveUnitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//all locals can have currentUser
app.use(function(req, res, next){
   res.locals.currentUser = req.user; 
   res.locals.error = req.flash("error"); 
   res.locals.success = req.flash("success"); 
   next(); 
});

//use/require the routes
app.use(indexRoutes);
app.use("/campground/:id/comments",commentRoutes);
app.use("/campground",campgroundRoutes);

//midware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server on!");
});
//every exprees need this line at bottom