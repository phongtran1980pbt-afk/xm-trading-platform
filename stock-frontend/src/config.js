// Cấu hình tập trung cho Frontend
// Khi deploy trên Vercel: để trống để dùng relative path /api/* (Vercel sẽ tự proxy xuống backend)
// Khi dev local: dùng http://localhost:5001
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
