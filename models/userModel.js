const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  img_url: String,
  refresh_tokens: {
    type: [String],
  },
  role: {
    type: String,
    default: "user",
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});
exports.UserModel = mongoose.model("users", userSchema);

exports.validateUser = (reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateNameAndEmail = (reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validatePassword = (reqBody) => {
  let joiSchema = Joi.object({
    oldPassword: Joi.string().min(2).max(150).required(),
    password: Joi.string().min(2).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateLogin = (reqBody) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(2).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.generateAccessToken = (user_id, role) => {
  let token = jwt.sign({ _id: user_id, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
  return token;
};

exports.generateRefreshToken = (user_id, role) => {
  let token = jwt.sign({ _id: user_id, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
  return token;
};
