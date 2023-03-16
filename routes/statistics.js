const express = require("express");
const { auth } = require("../middlewares/auth");
const { BestPlayerModel } = require("../models/bestPlayerModel");
const { StatisticModel } = require("../models/statisticModel");
const { UserModel } = require("../models/userModel");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const typeGame = req.query.typeGame;
    const isOnline = Boolean(req.query.isOnline);
    const level = req.query.level;
    const status = req.query.status;

    const data = await StatisticModel.findOne({ user_id: req.tokenData._id });
    isOnline ? (data[typeGame].winOnline += 1) : (data[typeGame][level][status] += 1);
    let newData = await StatisticModel.updateOne({ user_id: req.tokenData._id }, data);

    const bestPlayer = await BestPlayerModel.findOne({ type_game: typeGame });
    if (data[typeGame].winOnline > bestPlayer.numbers_of_win) {
      const user = await UserModel.findOne({ _id: req.tokenData._id });
      bestPlayer.user_id = user._id;
      bestPlayer.name = user.name;
      bestPlayer.numbers_of_win = data[typeGame].winOnline;
      await BestPlayerModel.updateOne({ _id: bestPlayer._id }, bestPlayer);
    }
    res.json(newData);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
