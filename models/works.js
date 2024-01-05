const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, "Serial Number is required."],
    unique: [true, "Serial Number must be unique."],
  },
  name: {
    type: String,
    required: [true, "Name is a required field"],
  },
  categories: [
    {
      type: String,
      required: [true, "Atleast one category is required."],
    },
  ],
  subcategories: [
    {
      type: String,
    },
  ],
  year: {
    type: String,
    required: [true, "Year of work creation is required."],
  },
  description: {
    type: String,
    required: [true, "Work description is required."],
  },
  link: {
    type: String,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});

const Work = mongoose.model("Work", workSchema);
module.exports = Work;
