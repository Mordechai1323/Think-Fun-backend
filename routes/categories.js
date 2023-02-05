const express = require("express");
const { authAdmin } = require("../middlewares/auth");
const { CategoryModel, validateCategory } = require("../models/categoryModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await CategoryModel.find({});
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.get("/single/:id", authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await CategoryModel.findOne({ _id: id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post("/", authAdmin, async (req, res) => {
  const validBody = validateCategory(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const category = new CategoryModel(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.put("/:idEdit", authAdmin, async (req, res) => {
  const validBody = validateCategory(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const idEdit = req.params.idEdit;
    const category = await CategoryModel.updateOne({ _id: idEdit }, req.body);
    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete("/:idDel", authAdmin, async (req, res) => {
  try {
    const idDel = req.params.idDel;
    const category = await CategoryModel.deleteOne({ _id: idDel });
    res.json(category);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
