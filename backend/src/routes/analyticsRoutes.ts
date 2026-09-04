import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/', AnalyticsController.getAnalytics);
router.get('/insights', AnalyticsController.getInsights);

export default router;
