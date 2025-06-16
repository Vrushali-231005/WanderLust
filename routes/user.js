const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js"); 
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try{
        let { username, email, password } = req.body;
        let newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, function(err) {
            if (err) { return next(err); }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        });

        
    }catch(err){
        
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}
));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), 

async (req,res)=>{
    req.flash("success", "Lgged In!Welcome Back!");
    res.redirect("/listings");
}
);


router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Logged Out!");
        res.redirect("/listings");
    });

});
    module.exports = router;