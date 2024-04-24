const Listing = require("../models/listing.js");
const multer  = require('multer');
const ExpressError = require("../utils/ExpressError.js");
const upload = multer({ dest: 'uploads/' });
const {listingSchema} = require("../validation.js");

module.exports.index = async (req,res)=>{
    let allListing = await Listing.find({});
    res.render("listing/index.ejs",{allListing});
}
module.exports.renderNewForm = async (req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        // req.session.redirectUrl = req.originalUrl;
        // if(req.session.redirectUrl){
        //     res.locals.redirectUrl = req.session.redirectUrl;
        // }
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }
    res.render("listing/new.ejs");
}

module.exports.ShowListings = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id)
    .populate(
        {path: "reviews", 
        populate:{ path: "author" }
    } )

    .populate("owner");

    if(!listing){
        req.flash("error","Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listing/show.ejs",{listing});
};


module.exports.CreatListing = async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    let newListing = new Listing(req.body.listing);

    let result = listingSchema.validate(req.body);
    console.log(result);
    await newListing.save();
    newListing.owner = req.user._id;
    
    req.flash("success","New Listing Created..");
    res.redirect("/listings");
}

module.exports.EditListings = async (req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    } else {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    res.render("listing/edit.ejs",{listing});
}}

module.exports.UpdateListing = async (req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    } 
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit.");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}

module.exports.DestroyListing = async (req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }
    let {id} = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    req.flash("success","successfully Deleted..");
    res.redirect("/listings");
}