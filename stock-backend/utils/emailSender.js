import nodemailer from 'nodemailer';

// Cấu hình Email Transporter
// ĐỂ GỬI ĐƯỢC MAIL THẬT: Bạn cần thay 2 dòng dưới đây
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'volehoangnha2005@gmail.com', // 1. Thay bằng Gmail của bạn
    pass: 'your-app-password'           // 2. Thay bằng "Mật khẩu ứng dụng" (App Password)
  }
});

// HƯỚNG DẪN LẤY APP PASSWORD:
// 1. Vào tài khoản Google -> Bảo mật -> Bật "Xác minh 2 bước"
// 2. Tìm mục "Mật khẩu ứng dụng" (App Password)
// 3. Chọn ứng dụng "Thư" và thiết bị "Máy tính Windows"
// 4. Google sẽ cấp 1 mã 16 ký tự, hãy dán vào dòng 'pass' ở trên.

export const sendWelcomeEmail = async (userEmail, fullName) => {
  const mailOptions = {
    from: '"XM Global" <no-reply@xm.com>',
    to: userEmail,
    subject: 'Xác nhận email của bạn',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px;"><span style="color: #d32f2f;">X</span>M</h1>
        </div>
        <div style="padding: 40px; text-align: center; background-color: #fff;">
          <h2 style="color: #111; font-size: 24px; margin-bottom: 20px;">Chào mừng đến XM!</h2>
          <p style="color: #333; font-size: 16px; text-align: left;">Chào ${fullName},</p>
          <p style="color: #555; font-size: 14px; text-align: left; line-height: 1.6;">
            Nhấp vào nút bên dưới để xác minh địa chỉ email và thiết lập Hồ sơ XM của bạn.
          </p>
          
          <div style="margin: 35px 0;">
            <a href="http://localhost:5173/login" style="background-color: #00b050; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
              Xác nhận email của bạn
            </a>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 25px;">Khi đã đăng nhập, bạn có thể xóa email này.</p>
          
          <div style="text-align: left; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #333; font-size: 14px; font-weight: bold; margin: 0;">Trân trọng!</p>
            <p style="color: #333; font-size: 14px; margin: 5px 0;">Đội ngũ XM</p>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; text-align: center;">
          <p style="font-size: 16px; font-weight: bold; color: #111; margin-bottom: 20px;">Tải về ứng dụng của chúng tôi</p>
          <div style="display: flex; justify-content: center; gap: 15px;">
             <a href="#" style="text-decoration: none;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" height="45" style="border-radius: 6px;">
             </a>
             <a href="#" style="text-decoration: none;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" height="45" style="border-radius: 6px;">
             </a>
          </div>
        </div>
      </div>
    `
  };

  try {
    // Thực hiện gửi mail thật
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi email chào mừng thật tới: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Lỗi gửi email thật:', error);
    return false;
  }
};
