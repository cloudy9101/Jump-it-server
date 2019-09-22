const bcrypt = require('bcrypt');
const RestResponse = require('../utils/RestResponse');
const jwt = require('jsonwebtoken');

const config = require('../config');
const {
  saveMeasurement,
  findHB,
  findSugar,
  findStep,
  findFloor,
  findDistance
} = require('../services/measureService');
const saveMeasure = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { low, high, value, date } = req.body;
  const result = await saveMeasurement(curUserId, low, high, value, date);

  if (result) res.json(RestResponse.Success('Success..'));
};

const readHighBlood = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const { date, type } = req.params;
  const payload = await findHB(curUserId, date, type);
  if (payload) {
    res.json(RestResponse.Success(payload));
  }
};

const readSugar = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const payload = await findSugar(curUserId, date, type);
  if (payload) {
    res.json(RestResponse.Success(payload));
  }
};
const readStepCount = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const payload = await findStep(curUserId, date, type);
  if (payload) {
    res.json(RestResponse.Success(payload));
  }
};
const readFloors = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const payload = await findFloor(curUserId, date, type);
  if (payload) {
    res.json(RestResponse.Success(payload));
  }
};
const readDistance = async (req, res) => {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const { date, type } = req.params;
  const payload = await findDistance(curUserId, date, type);
  if (payload) {
    res.json(RestResponse.Success(payload));
  }
};

module.exports = {
  saveMeasure,
  readHighBlood,
  readSugar,
  readStepCount,
  readFloors,
  readDistance
};
