import { Router } from 'express';
import { SavingsController } from '../controllers/savingsController';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createSavingsGoalValidator,
  updateSavingsGoalValidator,
  addContributionValidator,
} from '../validators/savingsValidators';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', SavingsController.getGoals);
router.post('/', createSavingsGoalValidator, validateRequest, SavingsController.createGoal);
router.patch('/:id', updateSavingsGoalValidator, validateRequest, SavingsController.updateGoal);
router.post('/:id/contribute', addContributionValidator, validateRequest, SavingsController.addContribution);
router.delete('/:id', SavingsController.deleteGoal);

export default router;
