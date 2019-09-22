const jwt = require('jsonwebtoken');
const RestResponse = require('../utils/RestResponse');
const { NotFound } = require('../middleWare/errorHandler');
const config = require('../config');
const Food = require('../models/food');
const {
  createFood,
  findFoods,
  update,
  removeFood
} = require('../services/FoodService');
const foods = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const foods = await findFoods(curUserId);

  res.json(RestResponse.Success(foods));
};

const addFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const { name, value, imgUri, imgIndex } = req.body;

  const newFood = new Food({
    name,
    value,
    imgUri,
    imgIndex,
    userId: curUserId
  });
  const result = await createFood(newFood);
  if (result) {
    res.json(RestResponse.Success(newFood, result));
  }
};

const updateFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;
  const foodId = req.params.id;
  const { name, value, imgUri, imgIndex } = req.body;
  const food = await update(foodId, curUserId, name, value, imgUri, imgIndex);
  res.json(RestResponse.Success(food, 'Update food success'));
};

const deleteFood = async function(req, res) {
  const token = req.get('Authorization').split(' ')[1];
  const curUserId = jwt.verify(token, config.privateKey).id;

  const foodId = req.params.id;
  const result = await removeFood(foodId, curUserId);

  if (result) {
    res.json(RestResponse.Success('Delete food success'));
  }
};

module.exports = { foods, addFood, updateFood, deleteFood };
