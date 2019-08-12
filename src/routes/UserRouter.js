const express = require('express');
const router = express.Router();
const { signUp, signIn, findUser } = require('../controllers/users');
const { exercises, diets, addDiet } = require('../controllers/plan');
const { foods, updateFood, addFood, deleteFood } = require('../controllers/foods');
const asyncHandler = require('../utils/asyncHandler');

router.get('/test', (req, res) => {
  // throw new PermissionDeny("User denied");
});

router.post('/signup', asyncHandler(signUp));
router.post('/signin', asyncHandler(signIn));
router.get('/find', asyncHandler(findUser));

router.get('/plan/exercises', asyncHandler(exercises));
router.get('/plan/diets', asyncHandler(diets));
router.post('/plan/diets', asyncHandler(addDiet));

router.get('/foods', asyncHandler(foods));
router.put('/foods/:id', asyncHandler(updateFood));
router.post('/foods', asyncHandler(addFood));
router.delete('/foods/:id', asyncHandler(deleteFood));

module.exports = router;
