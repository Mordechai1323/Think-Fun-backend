const express = require("express");
const bcrypt = require("bcrypt");
const { validateUser, UserModel, validateLogin, generateToken, validateNameAndEmail, validatePassword } = require("../models/userModel");
const { auth, authAdmin } = require("../middlewares/auth");
const router = express.Router();

router.get("/allUsers", authAdmin, async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  let page = Number(req.query.page) || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? 1 : -1;
  try {
    let users = await UserModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.get("/checkToken", auth, async (req, res) => {
  res.json(req.tokenData);
});

router.get("/myInfo", auth, async (req, res) => {
  try {
    let data = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/count", async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  try {
    let count = await UserModel.countDocuments({});
    let page = Math.ceil(count / perPage);
    res.json({ count, page });
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post("/", async (req, res) => {
  let validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "*****";
    res.status(201).json(user);
  } catch (err) {
    if (err.code == 11000) {
      return res.status(401).json({ err: "Email already in system, try log in", code: 11000 });
    }
    console.log(err);
    res.status(502).json(err);
  }
});

router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Email or password not match" });
    }
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ err: "Email or password not match" });
    }
    let token = generateToken(user._id, user.role);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.put("/", auth, async (req, res) => {
  let validBody = validateNameAndEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.updateOne({ _id: req.tokenData._id }, req.body);
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.put("/editPassword", auth, async (req, res) => {
  let validBody = validatePassword(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    let validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ err: "Password not match" });
    }
    req.body.password = await bcrypt.hash(req.body.password, 10);
    user = await UserModel.updateOne({ _id: req.tokenData._id }, req.body);
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    let data = await UserModel.deleteOne({ _id: req.tokenData._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

// Chang user id
router.patch("/role", authAdmin, async (req, res) => {
  try {
    let user_id = req.query.user_id;
    let role = req.query.role;
    if (user_id == req.tokenData._id || user_id == "63d68f8b9cd6921b2d9a8588") {
      return res.status(401).json({ err: "You try to change yourself or the super admin" });
    }
    let data = await UserModel.updateOne({ _id: user_id }, { role });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
