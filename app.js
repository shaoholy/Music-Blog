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
    methodOverride  = require("method-override"),
    cookieParser    = require('cookie-parser'),
    server          = require('http').createServer(app),
    io              = require('socket.io').listen(server);
    
var users = []; 
var connections = []; 

var commentRoutes      = require("./routes/comments"),
    campgroundRoutes   = require("./routes/campgrounds"),
    chatroomRoutes     = require("./routes/chatroom"), 
    indexRoutes        = require("./routes/index"); 
    
    
console.log(process.env.DATABASEURL);

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//seedDB();

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp"
mongoose.connect(url);
//mongoose.connect("mongodb://localhost/yelp_camp");
//mongoose.connect("mongodb://shaoboran:195891sbr@ds131963.mlab.com:31963/yelpcampshao");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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
app.use(async function(req, res, next){
   res.locals.currentUser = req.user;
   if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
   }
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//use/require the routes
app.use(indexRoutes);
app.use("/album/:id/comments",commentRoutes);
app.use("/album",campgroundRoutes);
app.use("/chatroom",chatroomRoutes);

io.on('connection', function(socket){
    connections.push(socket); 
    console.log('Connected: %s sockets connected', connections.length);
    
    //disconnect
    socket.on('disconnect', function(data){
      // if (!socket.username) {
      //   return; 
      // }
      users.splice(users.indexOf(socket.username), 1); 
      updateUsernames(); 
      
      connections.splice(connections.indexOf(socket), 1); 
      console.log('Disconnected: %s sockets connected', connections.length); 
    });
    
    //send message
    socket.on('send message', function(data){
        //console.log(data.name);
        //console.log(req.cookie);
      io.sockets.emit('new message', {msg: data.msg, name: socket.username}); 
    });
    
    //new user
    socket.on('new user', function(data, callback){
      callback(true); 
      socket.username = data; 
      users.push(socket.username);
      updateUsernames(); 
    });
    
    function updateUsernames() {
      io.sockets.emit('get users', users); 
    }
});

server.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server on!");
});
//every exprees need this line at bottom