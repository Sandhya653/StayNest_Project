// .env setup

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// server ka setup

const express= require("express")
const mongoose = require('mongoose');
const  app = express();

const dbUrl = process.env.ATLASDB_URL ;



async function main() {
    await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch(err => {
    console.log("Connection Failed");
    console.log(err);
  });
  
// // =====================================



// request ka data parse karane k liye
app.use(express.urlencoded({extended:true}));

const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")




const  methodOverride= require("method-override")
app.use(methodOverride("_method"))



// const mongoose = require('mongoose');      //  no this should not be here






const session = require("express-session")
const flash = require("connect-flash")

// const session = require('express-session');
const {MongoStore }= require('connect-mongo');
// console.log(MongoStore);

const passport= require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error",()=>{
    console.log("Error in Mongo Session Store",error);
})

const sessionOptions ={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true

    },
}


app.use(session(sessionOptions))
app.use(flash());


app.use(passport.initialize())
app.use(passport.session());


// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()))

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});




app.get("/demouser",async(req,res)=>{
    let fakeUser =new User({

        email:"student@gmail.com",
        username:"delta-student"
    })
    let registeredUser = await User.register(fakeUser,"helloworld!")

    res.send(registeredUser);
})


const  {isLoggedIn, isOwner} = require("./middleware.js");

const Review = require("./models/review.js");

const reviews = require("./routes/review.js")

const userRouter = require("./routes/user.js")



app.use("/listings/:id/reviews",reviews)

app.use("/",userRouter)






// -------------------------------------------------------------------------------------------------------------------------

// validate Schema
const { listingSchema ,reviewSchema } = require("./schema.js");


const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }

    next();
};

// ----------------------------------------------------------------------------------------------------------------------------------------

const bookingRouter = require("./routes/booking");

app.use("/listings/:id/bookings", bookingRouter);


// app.get("/",(req,res)=>{
//     res.send("successfull");
// })

// validete listing passing validations as middleware




// ejs setup
const path = require("path");  
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// requiring ejMate ~ helps in creating multiple template for ex navbar
const ejsMate = require("ejs-Mate")
app.engine("ejs",ejsMate);


// to use static file such as css files 

app.use(express.static(path.join(__dirname,"/public")))

//reqiring listings
const Listing= require("./models/listing.js");
const { required } = require("joi");
const { connect } = require("http2");
// app.get("/testListings",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My Villa",
//         description: "A luxurious private villa with a pool, garden, and peaceful surroundings — perfect for a family getaway.",
//         price:7500,
//         location:"Goa, India"

//     })
//     await sampleListing.save();
//     console.log("sample wasm saved");
//     res.send("successful testing");
// })
const multer  = require('multer')
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });



// for my catogery vala feature
app.get("/listings", async (req, res) => {
    const { category } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
});

// app.get("/listings/category/:category", async (req, res) => {

//     const listings = await Listing.find({
//         category: req.params.category
//     });

//     res.render("listings/index.ejs",{listings});
// });






// listing API

app.get("/listings",wrapAsync (async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})
}))


app.get("/listings/search", async (req, res) => {
    try {
        const { destination } = req.query;

        console.log("Searching for:", destination);

        const allListings = await Listing.find({
            $or: [
                { location: { $regex: destination, $options: "i" } },
                { country: { $regex: destination, $options: "i" } },
                { title: { $regex: destination, $options: "i" } }
            ]
        });

        console.log("Listings found:", allListings.length);

        res.render("listings/index.ejs", { allListings });

    } catch (err) {
        console.log(err);
        res.redirect("/listings");
    }
});


// app.get("/listings/:id", async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/show.ejs", { listing });
// });

// create:new and create route

app.get("/listings/new",isLoggedIn, async (req, res) => {
    

    res.render("listings/new.ejs");
});

// create route
app.post("/listings",isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(async(req,res,next)=>{
        let url = req.file.path;
        let filename = req.file.filename
        console.log("req.user =", req.user);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        
        newListing.image = {url,filename};
        await newListing.save();
        const savedListing = await Listing.findById(newListing._id);
        console.log("Saved Listing =", savedListing);
        req.flash("success","New Listing Created!")
        console.log(req.file);
        res.redirect("/listings"); 
}))


// update:Edit and update route
// edit route
app.get("/listings/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

     if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings");
    
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs",{ listing,originalImageUrl })
}))

// update route
app.put("/listings/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(async(req,res)=>{
    
    let {id} = req.params ;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){

        let url = req.file.path;
        let filename = req.file.filename
        listing.image = { url,filename };
        await listing.save();
    }
    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}`);
}));

// Delete route : Delete Route 

app.delete("/listings/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings")
}))

// show route ~~ read data listing/:id

app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing= await Listing.findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author",
            },
        }).populate("owner");
    console.log(listing);
    // console.log("Listing Owner:", listing.owner);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        return res.redirect("/listings");
    
    }

    // console.log(listing)
    res.render("listings/show.ejs",{listing});

}))





app.use((req, res) => {
    res.status(404).send("Page Not Found");
    //  let { statusCode = 500, message = "Something went wrong!" } = err;

    // res.status(statusCode).render("error.ejs", { message });
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,()=>{
    console.log("app is listining");
})