const express = require('express');
const router = express.Router();
const { signUp, signIn } = require('../controllers/users');
const asyncHandler = require('../utils/asyncHandler');

router.get('/test', (req, res) => {
  // throw new PermissionDeny("User denied");
});

router.post('/signup', asyncHandler(signUp));

router.post('/signin', asyncHandler(signIn));

module.exports = router;
