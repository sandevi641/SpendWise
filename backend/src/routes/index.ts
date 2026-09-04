import { Router } from 'express';
import authRoutes from './authRoutes';
import accountRoutes from './accountRoutes';
import categoryRoutes from './categoryRoutes';
import transactionRoutes from './transactionRoutes';
import budgetRoutes from './budgetRoutes';
import savingsRoutes from './savingsRoutes';
import analyticsRoutes from './analyticsRoutes';
import ocrRoutes from './ocrRoutes';
import statementRoutes from './statementRoutes';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SpendWise API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Modular Feature Routes
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/savings', savingsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ocr', ocrRoutes);
router.use('/statements', statementRoutes);

export default router;
