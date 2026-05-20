import express from 'express';
import { getAuditLogs } from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit-logs', getAuditLogs);

export default router;
