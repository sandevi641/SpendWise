import { Router } from 'express';
import multer from 'multer';
import { OcrController } from '../controllers/ocrController';
import { authenticateToken } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = Router();

router.use(authenticateToken);

router.post('/scan', upload.single('receiptImage'), OcrController.scanReceipt);

export default router;
