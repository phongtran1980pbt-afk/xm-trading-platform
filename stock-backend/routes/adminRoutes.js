import express from 'express';
import { getAuditLogs, getUsers, depositUser, depositUserByCode, getTradeStats, toggleUserStatus, withdrawUser } from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.post('/users/deposit-by-code', depositUserByCode);
router.post('/users/:id/deposit', depositUser);
router.post('/users/:id/withdraw', withdrawUser);
router.post('/users/:id/toggle-status', toggleUserStatus);
router.get('/trade-stats', getTradeStats);

export default router;
