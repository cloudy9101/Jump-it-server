const express = require('express');
const router = express.Router();
const { signUp, signIn } = require('../controllers/users');

router.get('/test', (req, res) => {
  // throw new PermissionDeny("User denied");
});

router.post('/signup', signUp);

router.post('/signin', signIn);

module.exports = router;
