const mongoose = require("mongoose");
//const Joi = require("joi");

const bestPlayerSchema = new mongoose.Schema({
  user_id: { type: String, default: "nothing" },
  name: { type: String, default: "nothing" },
  numbers_of_win: { type: Number, default: 0 },
  type_game: { type: String, default: "nothing" },
});

exports.BestPlayerModel = mongoose.model("bestPlayers", bestPlayerSchema);

