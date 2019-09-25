const jwt = require('jsonwebtoken');
const config = require('../config');
const RestResponse = require('../utils/RestResponse');
const User = require('../models/User');
const Diet = require('../models/Diet');
const { getCurUserId } = require('../services/UserService');
const Plan = require('../services/Plan');

const exercises = async function(req, res) {
  const curUserId = getCurUserId(req);
  const curUser = await User.findOne({ _id: curUserId });
  const date = req.query.date ? new Date(req.query.date) : new Date();

  const plans = Plan.getExercisePlan(curUser, date);
  res.json(RestResponse.Success(plans));
};

const diets = async function(req, res) {
  const curUserId = getCurUserId(req);
  const curUser = await User.findOne({ _id: curUserId });

  const diets = await Plan.getDiets(curUser._id);
  res.json(RestResponse.Success(diets));
};

const addDiet = async function(req, res) {
  const curUserId = getCurUserId(req);
  const curUser = await User.findOne({ _id: curUserId });
  const { name, value } = req.body;

  const newDiet = Plan.addDietService(curUserId, name, value);
  res.json(RestResponse.Success(newDiet, 'Add diet success'));
};

module.exports = { exercises, diets, addDiet };
