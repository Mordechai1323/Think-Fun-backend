const express = require("express");
const { authAdmin } = require("../middlewares/auth");
const { BestPlayerModel } = require("../models/bestPlayerModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let ticTacToeBestPlayers = await BestPlayerModel.find({ type_game: 'tic_tac_toe' });
    let matchingGameBestPlayers = await BestPlayerModel.find({ type_game: 'matching_game' });
    let checkersBestPlayers = await BestPlayerModel.find({ type_game: 'checkers' });
    res.json({ticTacToeBestPlayers,matchingGameBestPlayers, checkersBestPlayers});
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/",authAdmin, async (req, res) => {
  try {
    const data = new BestPlayerModel();
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
