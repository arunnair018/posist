"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// User Schema
const userSchema = mongoose.Schema({
  username: {
    unique: true,
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "invalid email"],
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
  },
  region: {
    type: String,
    requires: true,
    trim: true,
    lowercase: true,
  },
});

userSchema.set("timestamps", true);

// Password hash function
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Token generating funtion
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
    },
    "5ebe2294ecd0e0f08eab7690d2a6ee69"
  );
  return token;
};

// get user by credentials
userSchema.statics.findByCredentials = async (email, password, region) => {
  const regiond = region.toLowerCase();
  const user = await User.findOne({
    email: email,
    region: regiond,
  });
  if (!user) {
    return {
      error: "Invalid login credentials",
    };
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return {
      error: "Invalid login credentials",
    };
  }
  return user;
};

// model the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
