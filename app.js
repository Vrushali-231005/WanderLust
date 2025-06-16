if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const ExpressError=require("./utils/ExpressError.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const store=MongoStore.create({
    mongoUrl:process.env.ATLASDB,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    SaveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7, 
        maxAge:1000*60*60*24*7
    }
};


//middlewares
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));



main().then(()=>{
    console.log("Connection Successfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.ATLASDB);
}

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    next();

});

app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        username:"demo",
        email:"user123@gmail.com"
    });
   let registeredUser= await User.register(fakeUser,"password123");
    res.send(registeredUser);
        
   } );
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.all("*",(req,res,next)=>{
    next(new ExpressError("Page Not Found",404));
});
app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong"}=err;
    res.render("error.ejs",{message});
});
    



app.listen(8080,()=>{
    console.log("Server is listening at port 8080");
})
