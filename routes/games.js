const express = require('express');
const { authAdmin } = require('../middlewares/auth');
const { MatchingGameModel, validateMatchingGame } = require('../models/gameModel');
const { ticTacToeHelp } = require('../middlewares/helpFromGPT');
const router = express.Router();

router.get('/helpFromGPT', async (req, res) => {
  const typeGame = req.query.typeGame;
  let result;
  switch (typeGame) {
    case 'tic_tac_toe':
      result = ticTacToeHelp(req.body.board, req.body.sign);
      break;
    case 'matching_game':
      result = ticTacToeHelp(req.body.board, req.body.sign);
      break;
    default:
      break;
  }
  res.json(result);
});

router.get('/matchingGame', async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  let page = Number(req.query.page) || 1;
  const category = req.query.category;
  let searchQ = req.query.s;
  let searchExp = new RegExp(searchQ, 'i');
  try {
    let findQuery = {};
    if (category && searchExp) {
      findQuery = { $and: [{ description: searchExp }, { category_id: category }] };
    } else findQuery = { description: searchExp };
    let data = await MatchingGameModel.find(findQuery)
      .limit(perPage)
      .skip((page - 1) * perPage);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.get('/matchingGame/single/:id', authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await MatchingGameModel.findOne({ _id: id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post('/matchingGame', authAdmin, async (req, res) => {
  const validBody = validateMatchingGame(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const data = new MatchingGameModel(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put('/matchingGame/:idEdit', authAdmin, async (req, res) => {
  const validBody = validateMatchingGame(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const idEdit = req.params.idEdit;
    const data = await MatchingGameModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete('/matchingGame/:idDel', authAdmin, async (req, res) => {
  try {
    const idDel = req.params.idDel;
    const data = await MatchingGameModel.deleteOne({ _id: idDel }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
