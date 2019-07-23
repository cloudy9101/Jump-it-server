const express = require('express');
const router = express.Router();
const { signUp, signIn } = require('../controllers/users');
const { exercises, diets, addDiet } = require('../controllers/plan')
const asyncHandler = require('../utils/asyncHandler');

router.get('/test', (req, res) => {
  // throw new PermissionDeny("User denied");
});

router.post('/signup', asyncHandler(signUp));

router.post('/signin', asyncHandler(signIn));

router.get('/plan/exercises', exercises);

router.get('/plan/diets', asyncHandler(diets));
router.post('/plan/diets', asyncHandler(addDiet));

module.exports = router;
