const mongoose = require("mongoose");
const reviewSchema = require("./review.js").reviewSchema;

const courseSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  teacher: String,
  teacherName: String,
  video: [String],
  reviews: [reviewSchema],
});

module.exports = {
  Course: new mongoose.model("Course", courseSchema),
  courseSchema: courseSchema,
};
