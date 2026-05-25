# Hướng Dẫn Cài Đặt và Sử Dụng Code Mua Bán Tiền Ảo

Chào mừng bạn đến với mã nguồn của dự án giao dịch tiền ảo! Dưới đây là hướng dẫn chi tiết để bạn có thể tải về, cài đặt và chạy thử trên máy cá nhân, hoặc chuẩn bị đưa lên máy chủ thực tế (Deploy).

Dự án này bao gồm hai phần chính:
- **Frontend (Giao diện người dùng):** Viết bằng React/Vite.
- **Backend (Máy chủ xử lý):** Viết bằng Node.js / Express.

---

## 1. Yêu cầu hệ thống (Prerequisites)
Trước khi cài đặt, máy tính của bạn cần phải có sẵn:
- **Node.js** (Phiên bản 18 trở lên): Tải tại [nodejs.org](https://nodejs.org/).
- **NPM** (hoặc Yarn/pnpm): Thường cài kèm khi cài đặt Node.js.
- **Cơ sở dữ liệu (Database)** (Nếu dự án có yêu cầu, ví dụ: MongoDB hoặc MySQL).
- Trình soạn thảo code: Khuyên dùng **Visual Studio Code**.

---

## 2. Hướng dẫn cài đặt Backend (Máy chủ)

Backend là phần xử lý logic, quản lý user, và giá cả coin.

1. Mở Terminal (Command Prompt / PowerShell) và di chuyển vào thư mục backend:
   ```bash
   cd stock-backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình file biến môi trường (`.env`):
   - Tạo một file tên là `.env` (Nếu đã có file `.env.example`, bạn hãy copy nội dung của nó sang file `.env`).
   - Sửa các thông số trong file `.env` (Như DB_URL, PORT, JWT_SECRET...) cho phù hợp với máy tính của bạn.
4. Chạy server:
   ```bash
   npm start
   # hoặc nếu đang code bạn có thể chạy: npm run dev
   ```
   *Lúc này backend thường sẽ chạy ở địa chỉ: `http://localhost:5000` (hoặc một port bạn đã cấu hình).*

---

## 3. Hướng dẫn cài đặt Frontend (Giao diện)

Frontend là giao diện mà người dùng thao tác trực tiếp trên trình duyệt.

1. Mở một Terminal MỚI và di chuyển vào thư mục frontend:
   ```bash
   cd stock-frontend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình API cho Frontend:
   - Nếu trong thư mục `stock-frontend` có file `.env`, hãy đảm bảo biến `VITE_API_URL` hoặc `REACT_APP_API_URL` trỏ tới địa chỉ backend của bạn (thường là `http://localhost:5000/api`).
4. Chạy frontend:
   ```bash
   npm run dev
   ```
   *Trình duyệt sẽ hiển thị đường link (ví dụ: `http://localhost:5173`). Bạn bấm vào đó để xem website.*

---

## 4. Hướng dẫn đưa lên web thật (Deploy)

Khi bạn muốn chạy website cho mọi người trên mạng truy cập:

1. **Chuẩn bị file `.env`:** Điền API Keys thực, kết nối tới Database thực. Không chia sẻ file `.env` thực tế lên GitHub.
2. **Build Frontend:**
   Chạy lệnh `npm run build` trong thư mục `stock-frontend`. Lệnh này sẽ tạo ra một thư mục `dist` (hoặc `build`). Bạn mang thư mục này up lên các hosting (Vercel, Netlify, hoặc Nginx trên VPS).
3. **Chạy Backend trên máy chủ (VPS):**
   Bạn copy toàn bộ thư mục `stock-backend` lên VPS, chạy `npm install`. Sau đó, thay vì dùng `npm start`, hãy dùng **PM2** để chạy ngầm và tự động khởi động lại nếu bị lỗi:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "stock-api"
   ```
4. **Cài đặt Tên miền (Domain) và SSL (HTTPS):**
   - Trỏ DNS tên miền về IP của VPS.
   - Cài đặt Nginx làm Reverse Proxy để trỏ tên miền vào cổng đang chạy Backend/Frontend.
   - Sử dụng Certbot (Let's Encrypt) để lấy chứng chỉ SSL giúp web có chữ "Bảo mật (HTTPS)".

Chúc bạn thành công! Nếu bạn cần thay đổi logic, hãy kiểm tra mã nguồn tại các file tương ứng trong `src/pages/` của frontend hoặc `routes/` của backend.
