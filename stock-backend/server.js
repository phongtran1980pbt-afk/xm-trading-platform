import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import binaryRoutes from './routes/binaryRoutes.js';
import { items } from './config/db.js';
import { syncTime } from './timeService.js';
import { startBinaryOrderJob } from './services/binaryOrderJob.js';

const app = express();
app.use(cors({
  origin: [
    'https://kucoin.io.vn',
    'https://www.kucoin.io.vn',
    /\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
const PORT = process.env.PORT || 5001;

// Cấu hình Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Backend API',
      version: '1.0.0',
      description: 'API Documentation for Stock App',
    },
    servers: [
      { url: process.env.BACKEND_URL || `http://localhost:${PORT}` }
    ],
  },
  apis: ['./routes/*.js'], // Quét routes để tạo docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Sử dụng Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/binary', binaryRoutes);

// Items Route (Tạm thời để đây cho nhanh)
app.get('/api/items', (req, res) => res.json(items));

// Kiểm tra Server có sống không
app.get('/api/health', (req, res) => res.json({ status: 'Server đang chạy bình thường!' }));

app.listen(PORT, async () => {
  console.log(`\n🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs: http://localhost:${PORT}/swagger\n`);
  await syncTime();
  startBinaryOrderJob();
});
