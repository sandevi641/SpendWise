import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  createTransactionValidator,
  updateTransactionValidator,
  transactionQueryValidator,
} from '../validators/transactionValidators';
import { validateRequest } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/suggest-category', TransactionController.suggestCategory);
router.get('/', transactionQueryValidator, validateRequest, TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.post('/', createTransactionValidator, validateRequest, TransactionController.createTransaction);
router.patch('/:id', updateTransactionValidator, validateRequest, TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
