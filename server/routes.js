const { Router } = require('express');

const { authenticate, verifyToken } = require('./middlewares/authentication.middleware');
const { loginUser, authorizeUser } = require('./controllers/authentication.controller');

const router = Router();

router.get('/auth/login', loginUser());
router.get('/auth/login/callback', authorizeUser());
router.get('/auth/verify-token', authenticate(), verifyToken());

module.exports = router;
