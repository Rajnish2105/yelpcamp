const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; //shortcut

const imageSchema = new Schema({
  url: String,
  filename: String,
});
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true }, timestamps: true };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    coordinate: {
      type: [Number],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("linkToCamp").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <div>${this.description.substring(0, 20)}...</div>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
