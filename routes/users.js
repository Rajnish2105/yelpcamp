const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

//controller
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

//passport authentication middelware
//takes a stratergies local, google, twitter etc
//takes a object which sent a flash and and redirect upon failure

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

module.exports = router;