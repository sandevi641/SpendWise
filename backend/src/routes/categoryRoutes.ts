import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', CategoryController.getCategories);
router.post('/', CategoryController.createCategory);
router.patch('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
