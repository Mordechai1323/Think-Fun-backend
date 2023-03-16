const mongoose = require("mongoose");
//const Joi = require("joi");

const bestPlayerSchema = new mongoose.Schema({
  user_id: { type: String, default: "nothing" },
  name: { type: String, default: "nothing" },
  numbers_of_win: { type: Number, default: 0 },
  type_game: { type: String, default: "nothing" },
});

exports.BestPlayerModel = mongoose.model("bestPlayers", bestPlayerSchema);

// exports.validateBestPlayer = (reqBody) => {
//   const joiSchema = Joi.object({
//     user_id: Joi.string().min(2).max(200).required(),
//     name: Joi.string().min(2).max(500).required(),
//     numbersOfWin: Joi.number().min(0).max(2000000).required(),
//     typeGame: Joi.string().min(2).max(500).required(),
//   });

//   return joiSchema.validate(reqBody);
// };
