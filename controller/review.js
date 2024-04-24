const Listing = require("../models/listing.js");
const Review=require("../models/reviews.js");

module.exports.CreateNewReview = async (req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("Review saved");
    req.flash("success","New Review Created..");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.DestroyReview = async(req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }    
let {id,reviewId}=req.params;
await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
await Review.findByIdAndDelete(reviewId);
req.flash("success","Review Deleted..");
res.redirect(`/listings/${id}`);
}