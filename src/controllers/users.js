const bcrypt = require('bcrypt');
const User = require('../models/User');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { NotFound, PermissionDeny, UnprocessableEntity } = require('../middleWare/errorHandler');

const signUp = async function (req, res) {
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

  const isUserExist = await User.findOne({ email });
  if (isUserExist) throw new UnprocessableEntity('Email Exist..');

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
        console.log("success");
        res.json(RestResponse.Success({}, 'Signup Success'));
      }
    });
  });
}

const signIn = async function(req, res) {
  const { email, password } = req.body;
  const curUser = await User.findOne({ email });
  if (!curUser) throw new NotFound('Email Not Register..');
  const result = await bcrypt.compare(password, curUser.password);
  if (result) {
    const payload = {
      id: curUser._id,
    };
    const token = await jwt.sign(payload, config.privateKey);
    if (token)
      res.json(
        RestResponse.Success({  token: 'Bearer ' + token })
      );
  } else {
    throw new PermissionDeny('Password Incorrect..');
  }
}

module.exports = {
  signUp,
  signIn
}
