const bcrypt = require('bcrypt');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');
const HighBlood = require('../models/HighBlood');
const SugarIntake = require('../models/SugarIntake');

const saveHighblood = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { low, high, value, timestamp } = req.body;

  console.log(SugarIntake);
  const curHighBlood = new HighBlood({
    curUserId,
    low,
    high,
    timestamp
  });
  const curSugarIntake = new SugarIntake({
    curUserId,
    value,
    timestamp
  });

  await curHighBlood.save();
  await curSugarIntake.save();
  res.json(RestResponse.Success('Success..'));
};

module.exports = { saveHighblood };
