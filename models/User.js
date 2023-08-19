const mongoose = require("mongoose"); 
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
      refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }

);
module.exports = mongoose.model("User", userSchema);