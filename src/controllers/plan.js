const jwt = require('jsonwebtoken');
const fs = require('fs');
const file = fs.readFileSync(__dirname + '/../config/exercises.json', 'utf8');
const config = require('../config');
const RestResponse = require('../utils/RestResponse');
const User = require('../models/User');
const Diet = require('../models/Diet');
const exercisesPlan = JSON.parse(file);

const calBMI = function(height, weight) {
  return weight / (height / 100);
};

const getExercisePlan = function(user) {
  let planLevel = 'normal';
  if (user.height && user.weight) {
    const bmi = calBMI(user.height, user.weight);
    if (bmi < 24) {
      planLevel = 'normal';
    } else if (bmi < 29.9) {
      planLevel = 'low';
    } else {
      planLevel = 'lower';
    }
  }

  return exercisesPlan[planLevel];
};

const exercises = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const curUser = await User.findOne({ _id: curUserId });

  const date = req.query.date ? new Date(req.query.date) : new Date();
  const weekday = date.getDay();
  const plans = getExercisePlan(curUser)[weekday];
  res.json(RestResponse.Success(plans));
};

const diets = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const curUser = await User.findOne({ _id: curUserId });
  const diets = await Diet.find({ userId: curUser._id });

  res.json(RestResponse.Success(diets));
};

const addDiet = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const curUser = await User.findOne({ _id: curUserId });
  const { name, value } = req.body;

  const newDiet = new Diet({
    name,
    value,
    userId: curUser._id
  });
  const result = await newDiet.save();

  if (result) {
    res.json(RestResponse.Success(newDiet, 'Add diet success'));
  }
};

module.exports = { exercises, diets, addDiet };
