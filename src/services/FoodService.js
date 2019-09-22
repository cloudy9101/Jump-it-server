const Food = require('../models/food');

const createFood = async function(food) {
  const result = await food.save();
  if (result) {
    return 'Add food success';
  }
};

const findFoods = async function(userId) {
  const foods = await Food.find({ userId });
  return foods;
};
const removeFood = async function(foodId, userId) {
  const food = await Food.findById(foodId);

  if (food === null || userId != food.userId) {
    throw new NotFound('Food not found');
  }
  return await food.delete();
};
const update = async function(foodId, userId, name, value, imgUri, imgIndex) {
  const food = await Food.findById(foodId);
  if (food.userId != userId) {
    throw new NotFound('Food not found');
  }
  if (name != null) {
    food.name = name;
  }
  if (value != null) {
    food.value = value;
  }
  if (imgUri != null) {
    food.imgUri = imgUri;
  }
  if (imgIndex != null) {
    if (food.imgIndex != imgIndex) {
      food.imgUri = null;
    }
    food.imgIndex = imgIndex;
  }

  const result = await food.save();
  if (result) {
    return food;
  }
};
module.exports = { createFood, findFoods, update, removeFood };
