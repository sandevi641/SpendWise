import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { authenticateToken } from '../middleware/authMiddleware';
import { createAccountValidator } from '../validators/savingsValidators';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', AccountController.getAccounts);
router.post('/', createAccountValidator, validateRequest, AccountController.createAccount);
router.patch('/:id', AccountController.updateAccount);
router.delete('/:id', AccountController.deleteAccount);

export default router;
