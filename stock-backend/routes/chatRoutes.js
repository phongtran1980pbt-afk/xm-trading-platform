import express from 'express';
import {
  getAllSessions,
  getMessagesBySession,
  sendMessage,
  markAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// GET /api/chat/sessions
router.get('/sessions', getAllSessions);

// GET /api/chat/:sessionId
router.get('/:sessionId', getMessagesBySession);

// POST /api/chat/:sessionId
router.post('/:sessionId', sendMessage);

// POST /api/chat/:sessionId/read
router.post('/:sessionId/read', markAsRead);

export default router;
