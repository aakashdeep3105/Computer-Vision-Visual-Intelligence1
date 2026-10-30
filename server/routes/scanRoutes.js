import { Router } from 'express';
import {
  analyzeScan,
  getScans,
  getScanById,
  deleteScan
} from '../controllers/scanController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { AnalyzeRequestSchema } from '../utils/zodSchemas.js';

const router = Router();

// Apply auth middleware to all scan routes
router.use(authenticateToken);

// POST /api/scans/analyze - Multi-modal vision analysis
router.post('/analyze', validateBody(AnalyzeRequestSchema), analyzeScan);

// GET /api/scans - Paginated scan list for user
router.get('/', getScans);

// GET /api/scans/:id - Details of a single scan + anomalies
router.get('/:id', getScanById);

// DELETE /api/scans/:id - Delete scan and cascade delete anomalies
router.delete('/:id', deleteScan);

export default router;

