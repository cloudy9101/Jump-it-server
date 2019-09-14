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
      const obj = await StepCount.find({
        userId: id,
        endDate: { $gte: step.startDate, $lte: step.endDate }
      });
      if (obj) {
        if (isExit(step.endDate, obj.endDate)) {
          await obj.deleteMany({ userId: obj.id });
        }
      }

      const newStep = new StepCount({
        userId: id,
        value: step.value,
        startDate: moment(step.startDate).toDate(),
        endDate: moment(step.endDate).toDate(),
        date: moment(date).toDate()
      });
      newStep.save();
      break;
    }
    case 'distance': {
      const { distance, date } = data;
      const obj = await Distance.find({
        userId: id,
        endDate: distance.endDate
      });
      if (obj) {
        if (isExit(distance.endDate, obj.endDate)) {
          await obj.deleteMany({ userId: obj.id });
        }
      }
      const newDistance = new Distance({
        userId: id,
        value: distance.value,
        startDate: moment(distance.startDate).toDate(),
        endDate: moment(distance.endDate).toDate(),
        date: moment(date).toDate()
      });
      newDistance.save();
      break;
    }
    case 'floor': {
      const { floor, date } = data;
      const obj = await Floor.find({ userId: id, endDate: floor.endDate });
      if (obj) {
        if (isExit(floor.endDate, obj.endDate)) {
          await obj.deleteMany({ userId: obj.id });
        }
      }
      const newfloor = new Floor({
        userId: id,
        value: floor.value,
        startDate: moment(floor.startDate).toDate(),
        endDate: moment(floor.endDate).toDate(),
        date: moment(date).toDate()
      });
      newfloor.save();
      break;
    }
    default:
      break;
  }
}
function isExit(today, past) {
  return (
    moment(today)
      .toDate()
      .getTime() >=
    moment(today)
      .toDate()
      .getTime()
  );
}

module.exports = { save };
