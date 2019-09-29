const fs = require('fs');
const file = fs.readFileSync(__dirname + '/../config/exercises.json', 'utf8');
const fileForDietPlan = fs.readFileSync(__dirname + '/../config/diets.json', 'utf8');
const exercisesPlan = JSON.parse(file);
const dietsPlan = JSON.parse(fileForDietPlan);
const Diet = require('../models/Diet');

const calBMI = function(height, weight) {
  return weight / (height / 100);
}

const getExercisePlan = function(user, date = new Date()) {
  const weekday = date.getDay();
  let planLevel = "normal";
  if(user.height && user.weight) {
    const bmi = calBMI(user.height, user.weight);
    if(bmi < 24) {
      planLevel = "normal";
    } else if (bmi < 29.9) {
      planLevel = "low";
    } else {
      planLevel = "lower";
    }
  }
  return exercisesPlan[planLevel][weekday];
}

const getDiets = async (userId) => {
  const diets = await Diet.find({ userId: userId });
  return diets;
}

const addDietService = async (userId, name, value) => {
  const newDiet = new Diet({
    name,
    value,
    userId
  });
  await newDiet.save();
  return newDiet;
}

const delDietService = async (userId, dietId) => {
  const diet = await Diet.findById(dietId);
  if (diet === null || userId != diet.userId) {
    throw new NotFound('Food not found');
  }
  return await diet.delete();
}

const defaultDiets = async (user) => {
  let planLevel = "normal";
  if(user.height && user.weight) {
    const bmi = calBMI(user.height, user.weight);
    if(bmi < 24) {
      planLevel = "normal";
    } else if (bmi < 29.9) {
      planLevel = "low";
    } else {
      planLevel = "lower";
    }
  }
  const diets = dietsPlan[planLevel];
  for (let diet of diets) {
    await addDietService(user._id, diet.name, diet.value);
  }
}

module.exports = {
  getExercisePlan,
  getDiets,
  addDietService,
  delDietService,
  defaultDiets
};
