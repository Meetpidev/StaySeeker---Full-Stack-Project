const User = require('../models/user');
module.exports.RenderSignupForm = (req, res) => {
    res.render("listing/signup.ejs");
};

module.exports.SignupPageInfoStore = async (req, res, next) => {
    try {
        let { username, password, email } = req.body;
        const newUser = new User({ email, username });
        const UserRegister = await User.register(newUser, password);
        console.log(UserRegister);
        req.login(UserRegister, (error) => {
            if (error) {
                return next(error);
            }
            req.flash("success", "Register Successful");
            res.redirect("/listings");
        });
    } catch (error) {
        console.log("Error occurred during signup:", error);
        req.flash("error", "An error occurred during signup.");
        res.redirect("/user"); // Redirect to signup page or handle error appropriately
    }
};

module.exports.RenderLoginPage = (req, res) => {
    res.render("listing/login.ejs");
};

module.exports.LoginPageInfoStore = async (req, res) => {
    try {
        // console.log(req.user);
        req.flash("success", "Welcome To Wanderlust..");
        res.redirect("/listings");
    } catch (error) {
        console.log("Error occurred during login:", error);
        req.flash("error", "An error occurred during login.");
        res.redirect("/login"); // Redirect to login page or handle error appropriately
    }
};

module.exports.LogOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully Logged Out");
        res.redirect("/listings"); // Redirect to homepage or another appropriate page
    });
};
