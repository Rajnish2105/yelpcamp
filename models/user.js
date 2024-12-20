const Campground = require("./campground");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//this line will add usename password on our model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
