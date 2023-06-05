const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  validateUser,
  UserModel,
  validateLogin,
  generateAccessToken,
  generateRefreshToken,
  validateNameAndEmail,
  validatePassword,
  validateEmail,
  generateOneTimeCodeToken,
  validateOneTimeCode,
  validatePasswordOneTimeCode,
} = require('../models/userModel');
const { auth, authAdmin, authRefresh, validateHuman } = require('../middlewares/auth');
const { sendEmail } = require('../middlewares/sendEmail');
const { StatisticModel } = require('../models/statisticModel');
const { upload } = require('../middlewares/uploadImage');
const fs = require('fs');
const router = express.Router();

router.get('/allUsers', authAdmin, async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  let page = Number(req.query.page) || 1;
  let sort = req.query.sort || '_id';
  let reverse = req.query.reverse == 'true' ? -1 : 1;
  let search = req.query.s;
  let searchExp = new RegExp(search, 'i');

  try {
    let users = await UserModel.find({ name: searchExp }, { password: 0, refresh_tokens: 0, one_time_code: 0 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.get('/myInfo', auth, async (req, res) => {
  try {
    let data = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0, refresh_tokens: 0, one_time_code: 0 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/count', async (req, res) => {
  let perPage = Number(req.query.perPage) || 10;
  try {
    let count = await UserModel.countDocuments({});
    let pages = Math.ceil(count / perPage);
    res.json({ count, pages });
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post('/register', async (req, res) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refresh_tokens = [refreshToken];

    await user.save();

    user.password = '*****';
    const statistic = new StatisticModel();
    statistic.user_id = user._id;
    await statistic.save();

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({ accessToken, user });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(401).json({ err: 'Email already in system, try log in', code: 11000 });
    }
    console.log(err);
    res.status(502).json(err);
  }
});

router.post('/login', async (req, res) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.sendStatus(401);
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.sendStatus(401);
    }
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    if (!user.refresh_tokens) user.refresh_tokens = [refreshToken];
    else user.refresh_tokens.push(refreshToken);
    await user.save();

    res.cookie('token', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'None' });
    res.json({ accessToken, name: user.name, role: user.role, img_url: user.img_url });
  } catch (err) {
    console.log(err);
    res.sendStatus(502);
  }
});

router.get('/refreshToken', authRefresh, async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.status(401).json({ err: 'fail validating token' });
    if (!user.refresh_tokens.includes(req.refreshToken)) {
      user.refresh_tokens = [];
      await user.save();
      return res.status(403).json({ err: 'fail validating token' });
    }
    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ accessToken, name: user.name, role: user.role, img_url: user.img_url });
  } catch (err) {
    return res.status(403).json({ err: 'fail validating token' });
  }
});

router.get('/logout', authRefresh, async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) {
      res.clearCookie('token', { httpOnly: true });
      return res.status(401);
    }
    if (!user.refresh_tokens.includes(req.refreshToken)) {
      res.clearCookie('token', { httpOnly: true });
      user.refresh_tokens = [];
      await user.save();
      return res.status(401).json({ err: 'no token' });
    }
    user.refresh_tokens.splice(user.refresh_tokens.indexOf(req.refreshToken), 1);
    await user.save();
    res.clearCookie('token', { httpOnly: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(502).json(err);
  }
});

router.post('/uploadImage', auth, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err || !req.file) {
        console.log('err :' + err);
        return res.status(400).json({ err: 'only image' });
      } else {
        let updateData = await UserModel.updateOne({ _id: req.tokenData._id }, { img_url: 'usersImg/' + req.file.filename });
        res.json(updateData);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post('/forgotPassword', async (req, res) => {
  const validBody = validateEmail(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const human = await validateHuman(req.body.recaptchaToken);
    if (!human) return res.sendStatus(400);

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.sendStatus(401);
    const onTimeCode = Math.floor(100000 + Math.random() * 900000);
    user.one_time_code = await bcrypt.hash(onTimeCode.toString(), 10);
    const forgotPasswordToken = generateOneTimeCodeToken(user._id);
    await user.save();
    sendEmail(req.body.email, user.name, onTimeCode);
    res.status(200).json({ forgotPasswordToken });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post('/verifyOneTimeCode', auth, async (req, res) => {
  const validBody = validateOneTimeCode(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(400);
    const match = await bcrypt.compare(req.body.code.toString(), user.one_time_code);
    if (!match) return res.sendStatus(401);
    const tokenConfirmationCodeVerified = generateOneTimeCodeToken(user._id);
    res.status(200).json({ tokenConfirmationCodeVerified });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put('/editPassword/oneTimeCode', auth, async (req, res) => {
  const validBody = validatePasswordOneTimeCode(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(401);
    user.password = await bcrypt.hash(req.body.password, 10);
    user.one_time_code = null;
    user.save();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put('/', auth, async (req, res) => {
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

router.put('/editPassword', auth, async (req, res) => {
  let validBody = validatePassword(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    let validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!validPassword) return res.sendStatus(401)
    req.body.password = await bcrypt.hash(req.body.password, 10);
    user = await UserModel.updateOne({ _id: req.tokenData._id }, req.body);
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.post('/editImage', auth, async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user.img_url) return res.status(400).json({ err: 'No image found' });
    const imagePath = 'public/' + user.img_url;
    await fs.promises.unlink(imagePath);
    upload(req, res, async (err) => {
      if (err || !req.file) {
        return res.status(400).json({ err: 'only image' });
      } else {
        let updateData = await UserModel.updateOne({ _id: req.tokenData._id }, { img_url: 'usersImg/' + req.file.filename });
        res.json(updateData);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete('/deleteImage', auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    if (!user) return res.sendStatus(401);
    if (!user.img_url) return res.status(400).json({ err: 'No image found' });
    const imagePath = 'public/' + user.img_url;
    await fs.promises.unlink(imagePath);
    user.img_url = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${user.name}`;
    await user.save();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id });
    if (user.img_url[0] !== 'h') {
      const imagePath = 'public/' + user.img_url;
      await fs.promises.unlink(imagePath);
    }
    let data = await UserModel.deleteOne({ _id: req.tokenData._id });
    await StatisticModel.deleteOne({ user_id: req.tokenData._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

//TODO
// Chang user id
router.patch('/role', authAdmin, async (req, res) => {
  try {
    let user_id = req.query.user_id;
    let role = req.query.role;
    if (!user_id || !role) {
      return res.status(400).json({ err: 'user_id and role are required parameters' });
    }
    if (user_id == req.tokenData._id || user_id == '63d68f8b9cd6921b2d9a8588') {
      return res.status(401).json({ err: 'You try to change yourself or the super admin' });
    }
    let data = await UserModel.updateOne({ _id: user_id }, { role });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json(err);
  }
});

module.exports = router;
