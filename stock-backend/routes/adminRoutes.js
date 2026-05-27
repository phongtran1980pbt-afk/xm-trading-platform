import express from 'express';
import { 
  getAuditLogs, getUsers, depositUser, depositUserByCode, 
  getTradeStats, toggleUserStatus, withdrawUser, deleteNonAdminUsers, 
  clearAllChats, deleteUser, clearAuditLogs, deleteChatSession, deleteAuditLog,
  getAdminWithdrawRequests, approveWithdrawRequest, rejectWithdrawRequest, deleteWithdrawRequest
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit-logs', getAuditLogs);
router.delete('/audit-logs/cleanup', clearAuditLogs);
router.delete('/audit-logs/:id', deleteAuditLog);
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

router.get('/withdraw-requests', getAdminWithdrawRequests);
router.post('/withdraw-requests/:id/approve', approveWithdrawRequest);
router.post('/withdraw-requests/:id/reject', rejectWithdrawRequest);
router.delete('/withdraw-requests/:id', deleteWithdrawRequest);

export default router;
