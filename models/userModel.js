const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
    default: 'user',
  },
  one_time_code: { type: String, default: 0 },
  date_created: {
    type: Date,
    default: Date.now,
  },
});
exports.UserModel = mongoose.model('users', userSchema);

exports.validateUser = (reqBody) => {

  reqBody.name = reqBody.name.replace(/[^A-Za-z0-9\s\-_]/g, ' ');
  reqBody.email = reqBody.email.replace(/[^A-Za-z0-9\s\-_@.]/g, ' ');
  reqBody.password = reqBody.password.replace(/[^A-Za-z0-9\s\-_@?!]/g, ' ');

  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
    
  });
  return joiSchema.validate(reqBody);
};

exports.validateLogin = (reqBody) => {
  reqBody.email = reqBody.email.replace(/[^A-Za-z0-9\s\-_@.]/g, ' ');
  reqBody.password = reqBody.password.replace(/[^A-Za-z0-9\s\-_@?!]/g, ' ');

  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(6).max(150).required(),
    
  });
  return joiSchema.validate(reqBody);
};

exports.validateNameAndEmail = (reqBody) => {
  reqBody.name = reqBody.name.replace(/[^A-Za-z0-9\s\-_]/g, ' ');
  reqBody.email = reqBody.email.replace(/[^A-Za-z0-9\s\-_@.]/g, ' ');

  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validatePassword = (reqBody) => {
  reqBody.oldPassword = reqBody.oldPassword.replace(/[^A-Za-z0-9\s\-_@?!]/g, ' ');
  reqBody.password = reqBody.password.replace(/[^A-Za-z0-9\s\-_@?!]/g, ' ');

  let joiSchema = Joi.object({
    oldPassword: Joi.string().min(6).max(150).required(),
    password: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateEmail = (reqBody) => {
  reqBody.email = reqBody.email.replace(/[^A-Za-z0-9\s\-_@.]/g, ' ');

  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    recaptchaToken: Joi.string().min(6).max(150).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validateOneTimeCode = (reqBody) => {
  reqBody.code = reqBody.code.replace(/[^A-Za-z0-9\s\-_]/g, ' ');

  let joiSchema = Joi.object({
    code: Joi.number().min(100000).max(999999).required(),
  });
  return joiSchema.validate(reqBody);
};

exports.validatePasswordOneTimeCode = (reqBody) => {
  reqBody.password = reqBody.password.replace(/[^A-Za-z0-9\s\-_@?!]/g, ' ');
  
  let joiSchema = Joi.object({
    password: Joi.string().min(6).max(150).required(),
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

exports.generateOneTimeCodeToken = (user_id) => {
  let token = jwt.sign({ _id: user_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ONE_TIME_CODE_TOKEN_EXPIRATION });
  return token;
};
