const mongoose = require("mongoose");

let Schema = mongoose.Schema;

const Review = require("./review.js");
const { required } = require("joi");

// let listingSchema = new Schema({
//     title:{
//         type:String, 
//     },
//     description:{
//         type:String,
//     },
//     image:{
//         filename:{
//         type:String,
//         default:"https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1374",
//         set :(v)=>v === ""?"https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074":v,
// }},
//     price:{
//         type:Number,
//     },
//     location:{
//         type:String,
//     },
//     country:{
//         type:String,
//     }

// });

const listingSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1374",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1515041219749-89347f83291a?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1074"
          : v,
    },
  },
  category:{
    type:String,
    
    enum: [
            "Trending",
            "Rooms",
            "Beach",
            "Mountains",
            "Arctic",
            "Forest",
            "Beachfront",
            "Pools",
            "Camping",
            "Hiking",
            "Apartments",
            "Villas",
            "City",
            "Heritage",
            "Pet Friendly",
            "Wi-Fi",
            "Kitchen",
            "Spa",
            "Gym",
            "Hot Tub"
        ],
        default: "Trending",
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Review"
  },],
  owner :   {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  bookings: [
   {
      type: Schema.Types.ObjectId,
      ref: "Booking"
   }
]
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){

      await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})




let Listing =  mongoose.model("Listing",listingSchema);


module.exports=Listing;