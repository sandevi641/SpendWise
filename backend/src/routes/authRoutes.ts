import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/authValidators';
import { validateRequest } from '../middleware/validationMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, registerValidator, validateRequest, AuthController.register);
router.post('/login', authRateLimiter, loginValidator, validateRequest, AuthController.login);
router.get('/me', authenticateToken, AuthController.getProfile);
router.patch('/me', authenticateToken, updateProfileValidator, validateRequest, AuthController.updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidator, validateRequest, AuthController.changePassword);

export default router;
