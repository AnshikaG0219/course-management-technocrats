const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  identity: String,
  verified: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);
module.exports = new mongoose.model("user", userSchema);