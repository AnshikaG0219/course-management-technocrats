const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    title: String,
    url: String,
    filetype: String
})

module.exports = {
  Video: new mongoose.model("Video", videoSchema),
  videoSchema: videoSchema,
};