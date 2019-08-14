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
  const { timestamp } = data;
  await saveData(data, curUserId);
  res.json(RestResponse.Success('Success..'));
};
async function saveData(data, id) {
  const keys = Object.keys(data);
  switch (keys[0]) {
    case 'step': {
      const { step, timestamp } = data;
      const obj = await StepCount.findOne({ userId: id });
      if (obj) {
        if (isToday(timestamp, obj.date)) {
          await obj.deleteOne();
        }
      }

      const newStep = new StepCount({
        userId: id,
        value: step.value,
        startDate: Date.parse(step.startDate),
        endDate: Date.parse(step.startDate),
        date: timestamp
      });
      newStep.save();
      break;
    }
    case 'distance': {
      const { distance, timestamp } = data;
      const obj = await Distance.findOne({ userId: id });
      if (obj) {
        if (isToday(timestamp, obj.date)) {
          await obj.deleteOne();
        }
      }
      const newDistance = new Distance({
        userId: id,
        value: distance.value,
        startDate: Date.parse(distance.startDate),
        endDate: Date.parse(distance.startDate),
        date: timestamp
      });
      newDistance.save();
      break;
    }
    case 'floor': {
      const { floor, timestamp } = data;
      const obj = await Floor.findOne({ userId: id });
      if (obj) {
        if (isToday(timestamp, obj.date)) {
          await obj.deleteOne();
        }
      }
      const newfloor = new Floor({
        userId: id,
        value: floor.value,
        startDate: Date.parse(floor.startDate),
        endDate: Date.parse(floor.startDate),
        date: timestamp
      });
      newfloor.save();
      break;
    }
    default:
      break;
  }
}
function isToday(today, past) {
  return new Date(today).getDate() == new Date(parseInt(past)).getDate();
}
module.exports = { save };
