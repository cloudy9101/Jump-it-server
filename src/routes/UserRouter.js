const express = require('express');
const router = express.Router();
const {
  signUp,
  signIn,
  findUser,
  changePassword,
  updateUser
} = require('../controllers/users');
const { exercises, diets, addDiet } = require('../controllers/plan');
const {
  foods,
  updateFood,
  addFood,
  deleteFood
} = require('../controllers/foods');
const { save } = require('../controllers/workout');
const { saveHighblood } = require('../controllers/measure');

const asyncHandler = require('../utils/asyncHandler');

router.get('/test', (req, res) => {
  // throw new PermissionDeny("User denied");
});

//user
router.post('/signup', asyncHandler(signUp));
router.post('/signin', asyncHandler(signIn));
router.get('/find', asyncHandler(findUser));
router.put('/password', asyncHandler(changePassword));
router.put('/update', asyncHandler(updateUser));

router.get('/plan/exercises', asyncHandler(exercises));
router.get('/plan/diets', asyncHandler(diets));
router.post('/plan/diets', asyncHandler(addDiet));
//workout
router.post('/workout/save', asyncHandler(save));
//measure

router.post('/measure/save', asyncHandler(saveHighblood));
//food
router.get('/foods', asyncHandler(foods));
router.put('/foods/:id', asyncHandler(updateFood));
router.post('/foods', asyncHandler(addFood));
router.delete('/foods/:id', asyncHandler(deleteFood));

module.exports = router;
