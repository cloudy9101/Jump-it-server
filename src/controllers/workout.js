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

  await saveData(data, curUserId);

  res.json(RestResponse.Success('Success..'));
};
function saveData(data, id) {
  const keys = Object.keys(data);
  switch (keys[0]) {
    case 'step': {
      const { step } = data;
      const newStep = new StepCount({
        userId: id,
        value: step.value,
        startDate: _parseDate(step.startDate),
        endDate: _parseDate(step.startDate),
        date: _parseDate(new Date())
      });
      newStep.save();
      break;
    }
    case 'distance': {
      const { distance } = data;
      const newDistance = new Distance({
        userId: id,
        value: distance.value,
        startDate: _parseDate(distance.startDate),
        endDate: _parseDate(distance.startDate),
        date: _parseDate(new Date())
      });
      newDistance.save();
      break;
    }
    case 'floor': {
      const { floor } = data;
      const newfloor = new Floor({
        userId: id,
        value: floor.value,
        startDate: _parseDate(floor.startDate),
        endDate: _parseDate(floor.startDate),
        date: _parseDate(new Date())
      });
      newfloor.save();
      break;
    }
    default:
      break;
  }
}
function createAndGetUser(obj) {
  return;
}

function _parseDate(str) {
  return Date.parse(moment(str, 'DD-MM-YYYY').toDate());
}

module.exports = { save };
