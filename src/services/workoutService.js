const StepCount = require('../models/StepCount');
const Distance = require('../models/Distance');
const Floor = require('../models/Floor');

const saveWorkout = async (curUserId, data) => {
  const result = await saveData(curUserId, data);
  return result;
};
async function saveData(id, data) {
  const keys = Object.keys(data);
  let result = null;
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
          result = await StepCount.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: step.value, endDate: step.endDate }
          );
          return result;
        }
        return arr[0];
      }
      const newStep = new StepCount({
        userId: id,
        value: step.value,
        startDate: step.startDate,
        endDate: step.endDate,
        date: moment(date).toDate()
      });
      result = await newStep.save();
      return result;
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
          result = await Distance.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: distance.value, endDate: distance.endDate }
          );
          return result;
        }
        return arr[0];
      }

      const newDistance = new Distance({
        userId: id,
        value: distance.value,
        startDate: distance.startDate,
        endDate: distance.endDate,
        date: moment(date).toDate()
      });
      result = await newDistance.save();
      return result;
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
          result = await Distance.updateOne(
            { userId: id, endDate: arr[0].endDate },
            { value: floor.value, endDate: floor.endDate }
          );
          return result;
        }
        return arr[0];
      }

      const newfloor = new Floor({
        userId: id,
        value: floor.value,
        startDate: floor.startDate,
        endDate: floor.endDate,
        date: moment(date).toDate()
      });
      result = await newfloor.save();
      return result;
    }
    default:
      return result;
  }
}
module.exports = {
  saveWorkout
};
