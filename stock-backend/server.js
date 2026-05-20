import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import { items } from './config/db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

// Cấu hình Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Backend API',
      version: '1.0.0',
      description: 'API Documentation for Stock App',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
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

// Items Route (Tạm thời để đây cho nhanh)
app.get('/api/items', (req, res) => res.json(items));

// Kiểm tra Server có sống không
app.get('/api/health', (req, res) => res.json({ status: 'Server đang chạy bình thường!' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs: http://localhost:${PORT}/swagger\n`);
});
