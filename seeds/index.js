const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

//for making request
// const axios = require('axios');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

//live connection report
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    // const config = {
    //     params: {
    //         client_id: '70EUqwszejZ454Uf9iFSTxzppwXwu_-_ICH7rfSmTEw',
    //         collections: '2184453'
    //     }
    // };
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        //making api request for image
        // const image = await axios.get('https://api.unsplash.com/photos/random', config);
        // const imageUrl = image.data.urls.full;

        const camp = new Campground({
            author: '66a095266531719cfcc30025',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            coordinate: [cities[random1000].latitude, cities[random1000].longitude],
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnhsfzts3/image/upload/v1721908284/YelpCamp%28america%29/ajbjwqsnm23lw5xbjr0g.jpg',
                    filename: 'YelpCamp(america)/ajbjwqsnm23lw5xbjr0g'
                },
                {
                    url: 'https://res.cloudinary.com/dnhsfzts3/image/upload/v1721908283/YelpCamp%28america%29/zatfhyqotqqk1h3qtghc.jpg',
                    filename: 'YelpCamp(america)/zatfhyqotqqk1h3qtghc'
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sit ipsa delectus praesentium aperiam vel, ipsam ut blanditiis commodi aliquid. Aut aliquid cum consectetur nihil necessitatibus neque corporis et ipsam nostrum?',
            price
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        //close the connection after the work is done.
        mongoose.connection.close();
    })