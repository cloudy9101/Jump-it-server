const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const config = require('../config');
router.get('/test', (req, res) =>
  res.status(404).json({ error: 'Users Workdds' })
);
router.post('/signup', async (req, res) => {
  const {
    email,
    username,
    password,
    avator,
    firstName,
    lastName,
    gender,
    birthday,
    height,
    weight
  } = req.body;

  try {
    const isUserExist = await User.findOne({ email });
    if (isUserExist) throw new Error('Email Exist..');

    const newUser = new User({
      email,
      username,
      password,
      avator,
      firstName,
      lastName,
      gender,
      birthday,
      height,
      weight
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) throw err;

        newUser.password = hash;
        const result = await newUser.save();

        if (result) {
          res.json(RestResponse.Success({}, 'Signup Success'));
        }
      });
    });
  } catch (e) {
    res.status(400).json(RestResponse.Error(e.message));
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const curUser = await User.findOne({ email });
    if (!curUser) throw new Error('Email Not Register..');
    const result = await bcrypt.compare(password, curUser.password);
    if (result) {
      const payload = {
        id: curUser._id,
        username: curUser.username,
        avator: curUser.avator,
        firstName: curUser.firstName,
        lastName: curUser.lastName,
        gender: curUser.gender,
        birthday: curUser.birthday,
        height: curUser.height,
        weight: curUser.Weight
      };
      const token = await jwt.sign(payload, config.privateKey);
      if (token)
        res.json(
          RestResponse.Success({  token: 'Bearer ' + token })
        );
    } else {
      throw new Error('Password Incorrect..');
    }
  } catch (e) {
    res.status(400).json(RestResponse.Error(e.message));
  }
});
module.exports = router;
