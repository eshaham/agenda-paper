import { Router } from 'express';

import { authenticate, verifyToken } from './middlewares/authentication.middleware';
import { loginUser, authorizeUser, associateUser } from './controllers/authentication.controller';
import { getVariables, setupVariables } from './controllers/setup.controller';

const router = Router();

router.get('/setup', getVariables());
router.post('/setup', setupVariables());

router.get('/auth/login', loginUser());
router.get('/auth/login/callback', authorizeUser());
router.post('/auth/associate', associateUser());
router.get('/auth/verify-token', authenticate(), verifyToken());

export default router;
