const mongoose = require("mongoose");
const passport = require("passport");
const courseSchema = require("./course").courseSchema
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  identity: String,
  verified: { type: Boolean, default: false },
  purchase: [courseSchema]
});

userSchema.plugin(passportLocalMongoose);
module.exports = new mongoose.model("user", userSchema);