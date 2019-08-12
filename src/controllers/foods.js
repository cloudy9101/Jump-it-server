const jwt = require('jsonwebtoken');
const RestResponse = require('../utils/RestResponse');
const { NotFound } = require('../middleWare/errorHandler');
const config = require('../config');
const Food = require('../models/food');

const foods = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const foods = await Food.find({ userId: curUserId });

  res.json(RestResponse.Success(foods))
}

const addFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const {
    name,
    value
  } = req.body;

  const newFood = new Food({
    name,
    value,
    userId: curUserId
  });
  const result = await newFood.save();

  if(result) {
    res.json(RestResponse.Success(newFood, 'Add food success'));
  }
}

const updateFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const foodId = req.params.id;
  const {
    name,
    value
  } = req.body;

  const food = await Food.findById(foodId);
  if(food.userId != curUserId) {
    throw new NotFound('Food not found');
  }

  if(name != null) { food.name = name; }
  if(value != null) { food.value = value; }
  const result = await food.save();

  if(result) {
    res.json(RestResponse.Success(food, 'Update food success'));
  }
}

const deleteFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const foodId = req.params.id;
  const food = await Food.findById(foodId);

  if(food === null || curUserId != food.userId) {
    throw new NotFound('Food not found');
  }

  const result = await food.delete();
  if(result) {
    res.json(RestResponse.Success('Delete food success'));
  }
}

module.exports = { foods, addFood, updateFood, deleteFood };
