import express from 'express';
import { placeOrder, getHistory } from '../controllers/binaryOrderController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/place', verifyToken, placeOrder);
router.get('/history', verifyToken, getHistory);

export default router;
