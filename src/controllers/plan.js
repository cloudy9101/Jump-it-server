const RestResponse = require('../utils/RestResponse');
const fs = require('fs');
const file = fs.readFileSync(__dirname + '/../config/exercises.json', 'utf8');
const exercisesPlan = JSON.parse(file);

const exercises = function(req, res) {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const weekday = date.getDay();
  const plans = exercisesPlan[weekday];
  res.json(RestResponse.Success(plans));
}

module.exports = { exercises };
