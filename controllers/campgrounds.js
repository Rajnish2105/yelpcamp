const Campground = require("../models/campground");
const Review = require("../models/review");
const axios = require("axios");
const { cloudinary } = require("../cloudinary");

//all the logic for all the campgrounds

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res, next) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  const config = {
    params: {
      q: campground.location,
      key: process.env.MAP_KEY,
    },
  };
  const results = await axios.get(
    "https://api.opencagedata.com/geocode/v1/json",
    config
  );
  const lat = results.data.results[0].geometry.lat;
  const lon = results.data.results[0].geometry.lng;
  campground.coordinate = [lat, lon];

  await campground.save();
  req.flash("success", "New campgrounds is succesfully created!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);

  const config = {
    params: {
      q: campground.location,
      key: process.env.MAP_KEY,
    },
  };
  const results = await axios.get(
    "https://api.opencagedata.com/geocode/v1/json",
    config
  );
  const lat = results.data.results[0].geometry.lat;
  const lon = results.data.results[0].geometry.lng;
  campground.coordinate = [lat, lon];

  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Campgrounds is succesfully Updated!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  for (let img of campground.images) {
    await cloudinary.uploader.destroy(img.filename);
  }
  req.flash("success", "Succesfully Deleted a Campground!");
  res.redirect("/campgrounds");
};
