import { Router } from 'express';

import { loginUser, authorizeUser, isLoggedIn } from './controllers/authentication.controller';
import { getCurrentCalendarEvents } from './controllers/calendar.controller';
import { authenticate } from './middlewares/authentication.middleware';

const router = Router();

router.get('/auth/login-status', isLoggedIn());
router.get('/auth/login', loginUser());
router.get('/auth/login/callback', authorizeUser());

router.get('/calendar/events', authenticate(), getCurrentCalendarEvents());

export default router;
