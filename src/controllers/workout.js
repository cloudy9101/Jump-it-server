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
  const { date } = data;
  await saveData(data, curUserId);
  res.json(RestResponse.Success('Success..'));
};
async function saveData(data, id) {
  const keys = Object.keys(data);
  switch (keys[0]) {
    case 'step': {
      const { step, date } = data;

      const arr = await StepCount.find({
        userId: id,
        endDate: { $lte: step.endDate },
        startDate: { $gte: step.startDate }
      });
      if (arr.length > 1) {
        arr.forEach(async e => {
          await e.deleteOne();
        });
      } else if (arr.length == 1) {
        if (arr[0].value !== step.value) {
          await StepCount.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: step.value, endDate: step.endDate }
          );
          return;
        }
        return;
      }
      const newStep = new StepCount({
        userId: id,
        value: step.value,
        startDate: step.startDate,
        endDate: step.endDate,
        date: moment(date).toDate()
      });
      await newStep.save();
      break;
    }
    case 'distance': {
      const { distance, date } = data;
      const arr = await Distance.find({
        userId: id,
        endDate: { $lte: distance.endDate },
        startDate: { $gte: distance.startDate }
      });
      if (arr.length > 1) {
        arr.forEach(async e => {
          await e.deleteOne();
        });
      } else if (arr.length == 1) {
        if (arr[0].value !== distance.value) {
          await Distance.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: distance.value, endDate: distance.endDate }
          );
          return;
        }
        return;
      }

      const newDistance = new Distance({
        userId: id,
        value: distance.value,
        startDate: distance.startDate,
        endDate: distance.endDate,
        date: moment(date).toDate()
      });
      newDistance.save();
      break;
    }
    case 'floor': {
      const { floor, date } = data;
      const arr = await Floor.find({
        userId: id,
        endDate: { $lte: floor.endDate },
        startDate: { $gte: floor.startDate }
      });
      if (arr.length > 1) {
        arr.forEach(async e => {
          await e.deleteOne();
        });
      } else if (arr.length == 1) {
        if (arr[0].value !== floor.value) {
          await Distance.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: floor.value, endDate: floor.endDate }
          );
          return;
        }
        return;
      }

      const newfloor = new Floor({
        userId: id,
        value: floor.value,
        startDate: floor.startDate,
        endDate: floor.endDate,
        date: moment(date).toDate()
      });
      newfloor.save();
      break;
    }
    default:
      break;
  }
}

module.exports = { save };
