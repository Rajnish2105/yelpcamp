const User = require('../models/user');
const Campground = require("../models/campground")


module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = await new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}


module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome Back ${req.body.username}`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}

module.exports.info = async (req, res, next) => {
    const user = req.user;
    const campgrounds = await Campground.find({ author: user._id }).populate('author');
    res.render('campgrounds/user', { user, campgrounds })
}