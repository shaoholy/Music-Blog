var mongoose = require("mongoose");
 
var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   artist: String, 
   description: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId, 
         res: "User"
      }, 
      username: String
   }, 
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
       reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});
 
module.exports = mongoose.model("Campground", campgroundSchema);