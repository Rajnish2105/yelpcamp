const express = require('express');
const router = express.Router({ mergeParams: true });

//handling error in async functions
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

//models
const Campground = require('../models/campground');
const Review = require('../models/review');

//middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//controller
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;