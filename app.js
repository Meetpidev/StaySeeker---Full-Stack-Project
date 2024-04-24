const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/warpAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/reviews.js");
const warpAsync = require("./utils/warpAsync.js");
const flash = require('connect-flash');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingController = require("./controller/listing.js");
const ReviewController = require("./controller/review.js");
const UserController = require("./controller/user.js");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const path = require("path");
const port = 6080;

if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const dbUrl = process.env.ATLATDB_URL;

main().then(() => {
    console.log("Connection Successful..");
})
    .catch(err => console.log(err))

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
    secret: process.env.SECRET,
    mongoUrl: process.env.ATLATDB_URL,
    touchAfter: 24*3600,
});

app.use(session({
    store,
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}));


store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration (local strategy)
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    console.log("Working...");
    res.send("the first page");
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//Sign_Up Page
app.get("/user", UserController.RenderSignupForm);

//Sign_Up Page Info Store
app.post("/signup", wrapAsync(UserController.SignupPageInfoStore));

//Login Page
app.get("/login", UserController.RenderLoginPage);

//Login Page Info Authenticate
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}),
    UserController.LoginPageInfoStore);

//Log_Out
app.get("/logout", UserController.LogOut);

//Index Rout
app.get("/listings", warpAsync(listingController.index));

//New Rout
app.get("/listing/new", warpAsync(listingController.renderNewForm));

//Show Rout
app.get("/listings/:id", wrapAsync(listingController.ShowListings));

//Post Request For New Rout 
app.post("/listings",wrapAsync(listingController.CreatListing));

//Edit Rout
app.get("/listing/:id/edit",wrapAsync(listingController.EditListings));

//Update Rout
app.put("/listings/:id", wrapAsync(listingController.UpdateListing));

//Delete Rout
app.delete("/listings/:id", listingController.DestroyListing);


//review
app.post("/listings/:id/reviews", ReviewController.CreateNewReview);

//review Delete Rout
app.delete("/listings/:id/reviews/:reviewId", warpAsync(ReviewController.DestroyReview));

//Search
app.get("/search", async (req, res, next) => {
    let searchTerm = req.query.title;

    try {
        const listings = await Listing.find({ title: { $regex: searchTerm, $options: 'i' } });
        res.render("listing/searchlist.ejs", { listings, searchTerm });
    } catch (e) {
        console.error(e);
        res.render("error.ejs", { error: "Failed to fetch listings" }); // Render error page
    }
});

app.get("/listings/:id/book", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/book.ejs", { listing }); 
  });
  

app.post("/listings/:id/book",(req, res) => {
    req.flash("success","Payment Successful");
    res.redirect("/listings");
});


// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });

// app.use((err, req, res, next) => {
//     let { statusCode = 404, message = "Invalid" } = err;
//     res.sendStatus(statusCode);
// });

app.listen(port, () => {
    console.log(`Listing  port is:${port}`);
});