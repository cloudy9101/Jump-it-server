const User = require('../models/User');
const RestResponse = require('../utils/RestResponse');
const {
  getCurUserId,
  signUpService,
  signInService,
  changePasswordService,
  updateUserService,
  updateNotificationEnabledService,
  forgetPasswordService,
  sendEmailService,
  deviceRegService,
  deviceUnregService
} = require('../services/UserService');

const signUp = async function(req, res) {
  const token = await signUpService(req.body);
  res.json(RestResponse.Success({ token: 'Bearer ' + token }));
};

const signIn = async function(req, res) {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  const token = await signInService(email, password)
  if (token) res.json(RestResponse.Success({ token: 'Bearer ' + token }));
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
  const { password, newPassword } = req.body;
  const curUserId = getCurUserId(req);

  const result = await changePasswordService(curUserId, password, newPassword);
  if (result) res.json(RestResponse.Success('Success..'));
};

const updateUser = async (req, res) => {
  const curUserId = getCurUserId(req);

  const user = await updateUserService(curUserId, req.body);
  if (user) res.json(RestResponse.Success(user));
};

const updateNotificationEnabled = async (req, res) => {
  const curUserId = getCurUserId(req);

  const { notificationEnabled } = req.body;

  const user = await updateNotificationEnabledService(curUserId, notificationEnabled);
  if (user) res.json(RestResponse.Success(user));
};

const forgetPassword = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  const result = await forgetPasswordService(email, password);
  if (result) res.json(RestResponse.Success('Success..'));
};

const sendEmail = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const code = await sendEmailService(email);
  res.json(RestResponse.Success({ code, email }));
};

const deviceReg = async function(req, res) {
  const userId = getCurUserId(req);
  const { deviceId, regToken } = req.body;

  const fcmToken = await deviceRegService(userId, deviceId, regToken);
  res.json(RestResponse.Success(fcmToken.userId));
};

const deviceUnreg = async function(req, res) {
  const curUserId = getCurUserId(req);
  const { deviceId } = req.body;

  deviceUnregService(curUserId, deviceId);
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
