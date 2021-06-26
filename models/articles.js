const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "InshortsCategory",
      required: true,
    },
    source: {
      type: String,
    },
    sourceName: {
      type: String,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InshortsArticles", articleSchema);
