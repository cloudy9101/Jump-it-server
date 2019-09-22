const bcrypt = require('bcrypt');
const User = require('../models/User');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');
const StepCount = require('../models/StepCount');
const Distance = require('../models/Distance');
const Floor = require('../models/Floor');

const save = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const data = req.body;

  const result = await saveData(data, curUserId);
  if (result) res.json(RestResponse.Success('Success..'));
};

module.exports = { save };
