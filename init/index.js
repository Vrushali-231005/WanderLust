const mongoose = require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();


main().then(()=>{
    console.log("Connection Successfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.ATLASDB);
}

const initDB = async()=>{
   await  Listing.deleteMany({});

   initData.data=initData.data.map((obj)=>({ ...obj,owner:"67fcfa84ac96406fa3d44392"}));
   await  Listing.insertMany(initData.data);
   console.log("Data was initialised");
}

initDB();