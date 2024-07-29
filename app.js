if (process.env.NODE_ENV !== 'porduction') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

//setting session store
const MongoStore = require('connect-mongo');

//security
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

//auth
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

//for boilerplate
const ejsMate = require('ejs-mate');

//only in server file not in models
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl);

//Continues monitoring of the database connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//special functions for errors and async error handling
const ExpressError = require('./utils/ExpressError');

//using ejs Mate for boilerplate
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//for form data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'RPAAAR'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log('The Mongo session storage is down!', e);
})

const sessionConfig = {
    store,
    name: 'Season_id',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/",
    "https://unpkg.com/leaflet@1.9.4/",
    "https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js"
]

const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet.markercluster/dist/",
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://cdnjs.cloudflare.com/",
    "https://use.fontawesome.com/"
];

const connectSrcUrls = [
    "https://api.opencagedata.com/",
    "https://cdn.jsdelivr.net/npm/axios/"
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", "'unsafe-eval'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnhsfzts3/",
                "https://unpkg.com/leaflet@1.9.4/dist/",
                "https://images.unsplash.com/",
                "https://a.basemaps.cartocdn.com/",
                "https://b.basemaps.cartocdn.com/",
                "https://c.basemaps.cartocdn.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
)

//authentication using passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
//storing user in session and extracting
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//helpers awailable on every webpage
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//setting prefix to routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404))
});

//error handler middleware
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Oh No! somthing went wrong"
    res.status(status).render('error', { err });
})

const portNumber = process.env.PORT || 3000;
app.listen(portNumber, () => {
    console.log(`The sever is now active at http://localhost:${portNumber}/`)
});