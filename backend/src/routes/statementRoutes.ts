import { Router } from 'express';
import { StatementController } from '../controllers/statementController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/export-pdf', StatementController.exportPdf);

export default router;
