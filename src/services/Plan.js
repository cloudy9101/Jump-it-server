const fs = require('fs');
const file = fs.readFileSync(__dirname + '/../config/exercises.json', 'utf8');
const exercisesPlan = JSON.parse(file);

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

module.exports = { getExercisePlan };
