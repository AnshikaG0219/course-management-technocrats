const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  identity: String,
  verified: { type: Boolean, default: false },
});

module.exports = new mongoose.model("user", userSchema);