const express = require("express");
const { authAdmin } = require("../middlewares/auth");
const { MemoryGameModel, validateMemoryGame } = require("../models/gameModel");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ err: "games Work 200" });
});

router.get("/memoryGame", async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  let page = Number(req.query.page) || 1;
  const category = req.query.category;
  let searchQ = req.query.s;
  let searchExp = new RegExp(searchQ, "i");
  try {
    let findQuery = {};
    if (category && searchExp) {
      findQuery = { $and: [{ description: searchExp }, { category_id: category }] };
    }
    else findQuery = { description: searchExp }
    let data = await MemoryGameModel.find(findQuery)
      .limit(perPage)
      .skip((page - 1) * perPage);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.get("/memoryGame/single/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await MemoryGameModel.findOne({ _id: id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post("/memoryGame", authAdmin, async (req, res) => {
  const validBody = validateMemoryGame(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const data = new MemoryGameModel(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/memoryGame/:idEdit", authAdmin, async (req, res) => {
  const validBody = validateMemoryGame(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const idEdit = req.params.idEdit;
    const data = await MemoryGameModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete("/memoryGame/:idDel", authAdmin, async (req, res) => {
  try {
    const idDel = req.params.idDel;
    const data = await MemoryGameModel.deleteOne({ _id: idDel }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
