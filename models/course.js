const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  teacher: String,
  teacherName: String,
  video: [String],
});

module.exports = new mongoose.model("course", courseSchema);