const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    student_id: String,
    studentName: String, 
    content: String
})

let review = new mongoose.model("Review", reviewSchema);

module.exports = {
  review: review,
  reviewSchema: reviewSchema
}