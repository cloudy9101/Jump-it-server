const bcrypt = require('bcrypt');
const User = require('../models/User');
const FcmToken = require('../models/FcmToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../config');
const {
  NotFound,
  PermissionDeny,
  UnprocessableEntity
} = require('../middleWare/errorHandler');

const getCurUserId = (req) => {
  const token = req.get('Authorization').split(' ')[1];
  return jwt.verify(token, config.privateKey).id;
}

const signUpService = async ({
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
}) => {
  email = email.toLowerCase();

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

  const hashedPassword = await hashPassword(newUser.password);
  newUser.password = hashedPassword;
  const result = await newUser.save();
  const curUser = await User.findOne({ email });
  if (curUser) {
    const payload = {
      id: curUser._id
    };
    const token = await jwt.sign(payload, config.privateKey);
    if (token) return token;
  }
}

const signInService = async (email, password) => {
  const curUser = await User.findOne({ email });
  if (!curUser) throw new NotFound('Email Not Register..');
  const result = await bcrypt.compare(password, curUser.password);
  if (result) {
    const payload = {
      id: curUser._id
    };
    const token = await jwt.sign(payload, config.privateKey);
    return token;
  } else {
    throw new PermissionDeny('Password Incorrect..');
  }
}

const changePasswordService = async (userId, password, newPassword) => {
  const curUser = await User.findOne({ _id: userId });
  const match = await bcrypt.compare(password, curUser.password);
  if (match) {
    const hashedPassword = await hashPassword(newPassword);
    const result = await User.updateOne(
      { _id: curUser._id },
      { password: hashedPassword }
    );

    console.log(result)
    return result;
  } else {
    throw new PermissionDeny('Password Incorrect..');
  }
}

const updateUserService = async (userId, {
  avator,
  username,
  firstName,
  lastName,
  height,
  weight
}) => {
  const curUser = await User.findOne({ _id: userId });
  const result = await User.updateOne(
    { _id: curUser._id },
    { avator, username, firstName, lastName, height, weight }
  );
  if (result) {
    const user = await User.findOne({ _id: curUser._id });
    return user
  }
}

const updateNotificationEnabledService = async (userId, notificationEnabled) => {
  const result = await User.updateOne(
    { _id: userId },
    { notificationEnabled }
  );
  if (result) {
    const user = await User.findOne({ _id: userId });
    return user
  }
}

const forgetPasswordService = async (email, password) => {
  const curUser = await User.findOne({ email: email });

  const hashedPassword = await hashPassword(password);
  const result = await User.updateOne(
    { _id: curUser._id },
    { password: hashedPassword }
  );
  return result;
}

const sendEmailService = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: config.user,
        pass: config.password
    }
  });
  let info = await transporter.sendMail({
    from: 'jump_it <jump_it@outlook.com>',
    to: email,
    subject: 'Change Password',
    html: `<b>Your verification code is ${code}</b>`
  });
  return code;
}

const deviceRegService = async (userId, deviceId, regToken) => {
  const curUser = await User.findOne({ _id: userId });
  if (!curUser) throw new NotFound('User not found');

  let fcmToken = await FcmToken.findOne({ userId: curUser._id, deviceId });
  if (fcmToken) {
    fcmToken.token = regToken;
    await fcmToken.save();
  } else {
    fcmToken = new FcmToken({ userId: curUser._id, deviceId, token: regToken });
    await fcmToken.save();
  }
  return fcmToken;
}

const deviceUnregService = async (userId, deviceId) => {
  const curUser = await User.findOne({ _id: userId });
  if (!curUser) throw new NotFound('User not found');

  await FcmToken.deleteMany({ userId: curUser._id, deviceId });
}

const hashPassword = async (password) => {
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) reject(err)
      resolve(hash)
    });
  })

  return hashedPassword
}

module.exports = {
  getCurUserId,
  signUpService,
  signInService,
  changePasswordService,
  updateUserService,
  updateNotificationEnabledService,
  forgetPasswordService,
  sendEmailService,
  deviceRegService,
  deviceUnregService,
  hashPassword
}
