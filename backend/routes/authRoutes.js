import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { UserRegistrationSchema, UserLoginSchema } from '../utils/zodSchemas.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(UserRegistrationSchema), register);

// POST /api/auth/login
router.post('/login', validateBody(UserLoginSchema), login);

// GET /api/auth/me
router.get('/me', authenticateToken, getMe);

export default router;

