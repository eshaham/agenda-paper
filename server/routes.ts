import { Router } from 'express';

import { authenticate, verifyToken } from './middlewares/authentication.middleware';
import { loginUser, authorizeUser } from './controllers/authentication.controller';

const router = Router();

router.get('/auth/login', loginUser());
router.get('/auth/login/callback', authorizeUser());
router.get('/auth/verify-token', authenticate(), verifyToken());

export default router;
