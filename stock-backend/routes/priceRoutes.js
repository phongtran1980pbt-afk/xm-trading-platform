import express from 'express';
import { getPrices, setTrend, getTrend } from '../controllers/priceController.js';

const router = express.Router();

router.get('/', getPrices);
router.post('/trend', setTrend);
router.get('/trend', getTrend);

export default router;
