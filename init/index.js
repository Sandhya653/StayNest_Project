const mongoose = require("mongoose");
// taking files
const initData = require("./data.js");

const Listing= require("../models/listing.js");
main().then(()=>{console.log("connection  successfull for DB")}).catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/StayNest');
}


const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6a4e37cfb73c30f7fa3cf4b9"
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();