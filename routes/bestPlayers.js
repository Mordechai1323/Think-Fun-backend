const express = require("express");
const { authAdmin } = require("../middlewares/auth");
const { BestPlayerModel } = require("../models/bestPlayerModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const typeGame = req.query.typeGame;
  let searchExp = new RegExp(typeGame, "i");
  try {
    let bestPlayers = await BestPlayerModel.find({ type_game: searchExp });
    res.json(bestPlayers);
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
