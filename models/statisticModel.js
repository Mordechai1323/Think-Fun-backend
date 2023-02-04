const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const statisticSchema = mongoose.Schema({
  user_id: String,
  tic_tac_toe: {
    easy: {
      win: { type: Number, default: 0 },
      tie: { type: Number, default: 0 },
      lose: { type: Number, default: 0 },
    },
    medium: {
        win: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        lose: { type: Number, default: 0 },
      },
      hard: {
        win: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        lose: { type: Number, default: 0 },
      }
  },
  memory_game: {
    easy: {
      win: { type: Number, default: 0 },
      tie: { type: Number, default: 0 },
      lose: { type: Number, default: 0 },
    },
    medium: {
        win: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        lose: { type: Number, default: 0 },
      },
      hard: {
        win: { type: Number, default: 0 },
        tie: { type: Number, default: 0 },
        lose: { type: Number, default: 0 },
      }
  },
});

exports.StatisticModel = mongoose.model("statistics", statisticSchema);

exports.validateStatistic = (reqBody) => {

  const joiSchema = Joi.object().keys({
    tic_tac_toe: Joi.object({
      easy: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required(),
      medium: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required(),
      hard: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required()
    }).required(),
    memory_game: Joi.object({
      easy: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required(),
      medium: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required(),
      hard: Joi.object({
        win: Joi.number().min(0).max(999999).required(),
        tie: Joi.number().min(0).max(999999).required(),
        lose: Joi.number().min(0).max(999999).required()
      }).required()
    }).required()
  });

  return joiSchema.validate(reqBody);
  
};
