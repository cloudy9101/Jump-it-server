const bcrypt = require('bcrypt');
const User = require('../models/User');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const { saveWorkout } = require('../services/workoutService');
const config = require('../config');

const save = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const data = req.body;

  const result = await saveWorkout(data, curUserId);
  if (result) res.json(RestResponse.Success('Success..'));
};

module.exports = { save };
