const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner}=require("../middleware.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

//index route
router.get("/",async(req,res)=>{
   const allListings=await Listing.find({});
   res.render("listings/index",{allListings})
      
})
//New route
router.get("/new",isLoggedIn,(req,res)=>{
   
    res.render("listings/new.ejs");
    
});


//show route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error","Listing Not Found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing})
})
);

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    if(!listing){
        req.flash("error","Listing Not Found!");
        return res.redirect("/listings");
    }
   let originalImageUrl=listing.image.url;
  originalImageUrl= originalImageUrl.replace("/upload","/upload/h_250,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
})
);

//update route
router.put("/:id",isLoggedIn,isOwner, upload.single("Listing[image]"),wrapAsync (async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    
    await listing.save();
    }
    console.log(req.body);
    req.flash("success","Successfully edited a listing!");
    res.redirect(`/listings/${id}`);
 })
);

//Create new route
router.post("/", isLoggedIn, upload.single("Listing[image]"), wrapAsync(async (req, res) => {
    let { title, description, price, country, location } = req.body.Listing;

    const newListing = new Listing({
        title,
        description,
        image: {
            url: req.file.path,
            filename: req.file.filename
        },
        price,
        country,
        location,
        owner: req.user._id
    });

    await newListing.save();
    req.flash("success", "Successfully added a new listing!");
    
 
    console.log("Uploaded file:", req.file);

    res.redirect("/listings");
}));


 router.delete("/:id",isLoggedIn,isOwner,wrapAsync (async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Successfully deleted listing!");
    res.redirect("/listings");
 })
);

module.exports=router;