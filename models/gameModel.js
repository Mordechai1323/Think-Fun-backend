const mongoose = require("mongoose");
const Joi = require("joi");

const memoryGameSchema = new mongoose.Schema({
  description: String,
  img_url: String,
  category_id: String,
  date_created: {
    type: Date,
    default: Date.now,
  },
});

exports.MemoryGameModel = mongoose.model("games", memoryGameSchema);

exports.validateMemoryGame = (reqBody) => {
  const joiSchema = Joi.object({
    description: Joi.string().min(2).max(200).required(),
    img_url: Joi.string().min(2).max(500).required(),
    category_id: Joi.string().min(2).max(200).required(),
  });

  return joiSchema.validate(reqBody);
};
