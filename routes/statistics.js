const express = require('express');
const { auth } = require('../middlewares/auth');
const { BestPlayerModel } = require('../models/bestPlayerModel');
const { StatisticModel } = require('../models/statisticModel');
const { UserModel } = require('../models/userModel');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const data = await StatisticModel.findOne({ user_id: req.tokenData._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const typeGame = req.query.typeGame;
    const isOnline = req.query.isOnline;
    const level = req.query.level;
    const gameRes = req.query.gameRes;

    const data = await StatisticModel.findOne({ user_id: req.tokenData._id });
    if (isOnline == 'true') {
      gameRes === 'win' ? (data[typeGame].winOnline += 1) : gameRes === 'lose' ? (data[typeGame].winOnline -= 1) : '';
    } else data[typeGame][level][gameRes] += 1;
    let newData = await StatisticModel.updateOne({ user_id: req.tokenData._id }, data);

    const bestPlayers = await BestPlayerModel.find({ type_game: typeGame });
    const statisticsData = await StatisticModel.find({});
    statisticsData.sort((a, b) => b[typeGame].winOnline - a[typeGame].winOnline);

    for (let i = 0; i < 5; i++) {
      if (statisticsData[i]) {
        bestPlayers[i].user_id = statisticsData[i].user_id;
        const user = await UserModel.findOne({ _id: statisticsData[i].user_id });
        bestPlayers[i].name = user.name;
        bestPlayers[i].numbers_of_win = statisticsData[i][typeGame].winOnline;
      } else {
        bestPlayers[i].user_id = 'nothing';
        bestPlayers[i].name = 'nothing';
        bestPlayers[i].numbers_of_win = 0;
      }
      await BestPlayerModel.updateOne({ _id: bestPlayers[i]._id }, bestPlayers[i]);
    }
    res.json(newData);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
