const express = require('express');
const router = express.Router();
const {
  signUp,
  signIn,
  findUser,
  changePassword,
  updateUser,
  updateNotificationEnabled,
  forgetPassword,
  deviceReg
} = require('../controllers/users');
const { exercises, diets, addDiet } = require('../controllers/plan');
const {
  foods,
  updateFood,
  addFood,
  deleteFood
} = require('../controllers/foods');
const { save } = require('../controllers/workout');
const {
  saveMeasure,
  readHighBlood,
  readSugar,
  readStepCount,
  readDistance,
  readFloors
} = require('../controllers/measure');

const asyncHandler = require('../utils/asyncHandler');

router.get('/test', async (req, res) => {
  // throw new PermissionDeny("User denied");
});

//user
router.post('/signup', asyncHandler(signUp));
router.post('/signin', asyncHandler(signIn));
router.get('/find', asyncHandler(findUser));
router.put('/password', asyncHandler(changePassword));
router.put('/update', asyncHandler(updateUser));
router.put('/updateNotificationEnabled', asyncHandler(updateNotificationEnabled));
router.post('/send', asyncHandler(forgetPassword));
router.post('/deviceReg', asyncHandler(deviceReg));

router.get('/plan/exercises', asyncHandler(exercises));
router.get('/plan/diets', asyncHandler(diets));
router.post('/plan/diets', asyncHandler(addDiet));
//workout
router.post('/workout/save', asyncHandler(save));
//measure
router.post('/measure/save', asyncHandler(saveMeasure));
router.get('/measure/highblood/:date/:type', asyncHandler(readHighBlood));
router.get('/measure/sugar/:date/:type', asyncHandler(readSugar));
router.get('/measure/step/:date/:type', asyncHandler(readStepCount));
router.get('/measure/distance/:date/:type', asyncHandler(readDistance));
router.get('/measure/floor/:date/:type', asyncHandler(readFloors));
//food
router.get('/foods', asyncHandler(foods));
router.put('/foods/:id', asyncHandler(updateFood));
router.post('/foods', asyncHandler(addFood));
router.delete('/foods/:id', asyncHandler(deleteFood));

module.exports = router;
