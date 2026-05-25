import express from 'express';
import { getPrices, setTrend, getTrend, getCandles } from '../controllers/priceController.js';

const router = express.Router();

router.get('/', getPrices);
router.get('/candles', getCandles);
router.post('/trend', setTrend);
router.get('/trend', getTrend);

export default router;
