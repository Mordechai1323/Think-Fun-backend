const express = require("express");
const { auth } = require("../middlewares/auth");
const { validateStatistic, StatisticModel } = require("../models/statisticModel");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    let data = await StatisticModel.findOne({ user_id: req.tokenData._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.put("/", auth, async (req, res) => {
  const validBody = validateStatistic(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let data = await StatisticModel.updateOne({ user_id: req.tokenData._id }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
