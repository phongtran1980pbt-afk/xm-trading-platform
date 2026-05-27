import express from 'express';
import { register, login, getBalance, checkUserExists, getProfile, updateKyc, changePassword, getLoginHistory } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "test@gmail.com" }
 *               password: { type: string, example: "Password123!" }
 *               fullName: { type: string, example: "Nguyen Van A" }
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "test@gmail.com" }
 *               password: { type: string, example: "Password123!" }
 */
router.post('/login', login);

router.post('/check-user', checkUserExists);

router.get('/balance/:id', getBalance);
router.get('/profile/:id', getProfile);
router.post('/profile/:id/update-kyc', updateKyc);
router.post('/profile/:id/change-password', changePassword);
router.get('/profile/:id/login-history', getLoginHistory);

export default router;
