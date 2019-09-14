const bcrypt = require('bcrypt');
const User = require('../models/User');
const FcmToken = require('../models/FcmToken');
const RestResponse = require('../utils/RestResponse');
const Firebase = require('../utils/FirebaseUtil');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config');
const {
  NotFound,
  PermissionDeny,
  UnprocessableEntity
} = require('../middleWare/errorHandler');

const signUp = async function(req, res) {
  const {
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
  const email = req.body.email.toLowerCase();

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
      const curUser = await User.findOne({ email });
      if (curUser) {
        const payload = {
          id: curUser._id
        };
        const token = await jwt.sign(payload, config.privateKey);
        if (token) res.json(RestResponse.Success({ token: 'Bearer ' + token }));
      }
    });
  });
};

const signIn = async function(req, res) {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  const curUser = await User.findOne({ email });
  if (!curUser) throw new NotFound('Email Not Register..');
  const result = await bcrypt.compare(password, curUser.password);
  if (result) {
    const payload = {
      id: curUser._id
    };
    const token = await jwt.sign(payload, config.privateKey);
    if (token) res.json(RestResponse.Success({ token: 'Bearer ' + token }));
  } else {
    throw new PermissionDeny('Password Incorrect..');
  }
};

const findUser = async function(req, res) {
  const curUserId = getCurUserId(req);

  const curUser = await User.findOne(
    { _id: curUserId },
    { password: false, _id: false, birthday: false, gender: false }
  );
  res.json(RestResponse.Success(curUser));
};

const changePassword = async function(req, res) {
  let { password, newPassword } = req.body;
  const email = req.body.email.toLowerCase();

  const curUserId = getCurUserId(req);
  const curUser = await User.findOne({ _id: curUserId });
  const match = await bcrypt.compare(password, curUser.password);
  if (match) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newPassword, salt, async function(err, hash) {
        newPassword = hash;
        const result = await User.updateOne(
          { _id: curUserId },
          { password: newPassword }
        );

        if (result) res.json(RestResponse.Success('Success..'));
      });
    });
  } else {
    throw new PermissionDeny('Password Incorrect..');
  }
};

const updateUser = async (req, res) => {
  const curUserId = getCurUserId(req);

  const { avator, username, firstName, lastName, height, weight } = req.body;

  const curUser = await User.findOne({ _id: curUserId });
  const result = await User.updateOne(
    { _id: curUserId },
    { avator, username, firstName, lastName, height, weight }
  );
  if (result) {
    const user = await User.findOne({ _id: curUserId });
    res.json(RestResponse.Success(user));
  }
};

const updateNotificationEnabled = async (req, res) => {
  const curUserId = getCurUserId(req);

  const { notificationEnabled } = req.body;

  const result = await User.updateOne(
    { _id: curUserId },
    { notificationEnabled }
  );
  if (result) {
    const user = await User.findOne({ _id: curUserId });
    res.json(RestResponse.Success(user));
  }
};

getCurUserId = req => {
  const token = req.get('Authorization').split(' ')[1];
  return jwt.verify(token, config.privateKey).id;
};
const forgetPassword = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();
  let plainPassword = password;
  const curUser = await User.findOne({ email: email });

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(plainPassword, salt, async function(err, hash) {
      if (err) throw err;
      plainPassword = hash;

      const result = await User.updateOne(
        { _id: curUser._id },
        { password: plainPassword }
      );

      if (result) res.json(RestResponse.Success('Success..'));
    });
  });
};

const sendEmail = async (req, res) => {
  const email = req.body.email.toLowerCase();

  const code = Math.floor(100000 + Math.random() * 900000);
  console.log(email);
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.user,
      pass: config.password
    }
  });
  let info = await transporter.sendMail({
    from: '"Jump-It"',
    to: email,
    subject: 'Change Password',
    html: `<b>Your verification code is ${code}</b>`
  });
  res.json(RestResponse.Success({ code, email }));
};

const deviceReg = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const { deviceId, regToken } = req.body;

  const curUserId = jwt.verify(token, config.privateKey).id;
  const curUser = await User.findOne({ _id: curUserId });
  if (!curUser) throw new NotFound('User not found');

  let fcmToken = await FcmToken.findOne({ userId: curUser._id, deviceId });
  if (fcmToken) {
    fcmToken.token = regToken;
    await fcmToken.save();
  } else {
    fcmToken = new FcmToken({ userId: curUser._id, deviceId, token: regToken });
    await fcmToken.save();
  }

  res.json(RestResponse.Success(fcmToken.userId));
};

const deviceUnreg = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const { deviceId } = req.body;

  const curUserId = jwt.verify(token, config.privateKey).id;
  const curUser = await User.findOne({ _id: curUserId });
  if (!curUser) throw new NotFound('User not found');

  await FcmToken.deleteMany({ userId: curUser._id, deviceId });

  res.json(RestResponse.Success());
};

module.exports = {
  signUp,
  signIn,
  findUser,
  sendEmail,
  changePassword,
  updateUser,
  updateNotificationEnabled,
  deviceReg,
  deviceUnreg,
  forgetPassword
};
