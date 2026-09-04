import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/authMiddleware';
import { setBudgetValidator, budgetQueryValidator } from '../validators/budgetValidators';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', budgetQueryValidator, validateRequest, BudgetController.getBudgets);
router.post('/', setBudgetValidator, validateRequest, BudgetController.setBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
