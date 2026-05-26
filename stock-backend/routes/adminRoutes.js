import express from 'express';
import { 
  getAuditLogs, getUsers, depositUser, depositUserByCode, 
  getTradeStats, toggleUserStatus, withdrawUser, deleteNonAdminUsers, 
  clearAllChats, deleteUser, clearAuditLogs, deleteChatSession 
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit-logs', getAuditLogs);
router.delete('/audit-logs/cleanup', clearAuditLogs);
router.get('/users', getUsers);
router.post('/users/deposit-by-code', depositUserByCode);
router.post('/users/:id/deposit', depositUser);
router.post('/users/:id/withdraw', withdrawUser);
router.post('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/cleanup', deleteNonAdminUsers);
router.delete('/users/:id', deleteUser);
router.delete('/chat/cleanup', clearAllChats);
router.delete('/chat/session/:sessionId', deleteChatSession);
router.get('/trade-stats', getTradeStats);

export default router;
