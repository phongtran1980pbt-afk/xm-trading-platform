import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-connect">
        <h2>Kết nối với chúng tôi</h2>
        <div className="social-links-top">
          <a href="#" className="social-icon">f</a>
          <a href="#" className="social-icon">𝕏</a>
          <a href="#" className="social-icon">▶</a>
          <a href="#" className="social-icon">in</a>
          <a href="#" className="social-icon">📸</a>
        </div>
      </div>

      <div className="footer-menus">
        <div className="footer-col">
          <h4>Sản phẩm</h4>
          <a href="#">Ngoại hối</a>
          <a href="#">Chứng khoán</a>
          <a href="#">Hàng hóa</a>
          <a href="#">Chỉ số chứng khoán</a>
          <a href="#">Kim loại quý</a>
          <a href="#">Năng lượng</a>
        </div>
        <div className="footer-col">
          <h4>Loại tài khoản</h4>
          <a href="#">Tài khoản Micro</a>
          <a href="#">Tài khoản Standard</a>
          <a href="#">Tài khoản XM Ultra Low</a>
          <a href="#">Tài khoản Shares</a>
        </div>
        <div className="footer-col">
          <h4>Nền tảng</h4>
          <a href="#">MetaTrader 4</a>
          <a href="#">MetaTrader 5</a>
          <a href="#">XM WebTrader</a>
        </div>
        <div className="footer-col">
          <h4>Công cụ</h4>
          <a href="#">Lịch kinh tế</a>
          <a href="#">Tín hiệu giao dịch</a>
          <a href="#">Công cụ giao dịch</a>
        </div>
        <div className="footer-col">
          <h4>Về XM</h4>
          <a href="#">Hồ sơ công ty</a>
          <a href="#">Tuyển dụng</a>
          <a href="#">Liên hệ</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-partners-custom">
          <div className="partner-item">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>MetaTrader 4</span>
          </div>
          <div className="partner-item">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>MetaTrader 5</span>
          </div>
          <div className="partner-item">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>VERISIGN</span>
          </div>
          <div className="partner-item">
            <div className="unicef-text">
               <span className="unicef-title">unicef</span>
               <span className="unicef-sub">corporate partner</span>
            </div>
          </div>
          <div className="badges">
            <div className="badge-box bg-red"></div>
            <div className="badge-box bg-blue"></div>
            <div className="badge-box bg-green"></div>
            <div className="badge-box bg-cyan"></div>
            <div className="badge-box bg-orange"></div>
          </div>
        </div>

        <div className="footer-links">
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Chính sách Cookie</a>
          <a href="#">Điều khoản và Điều kiện</a>
          <a href="#">Liên hệ chúng tôi</a>
        </div>
        
        <div className="footer-legal">
          <p>Cảnh báo Rủi ro: Giao dịch Ngoại hối và CFDs có mức độ rủi ro cao đối với vốn đầu tư của bạn và bạn chỉ nên giao dịch với số tiền mà bạn có thể cho phép mình mất. Hãy đảm bảo rằng bạn hiểu đầy đủ các rủi ro liên quan và tìm kiếm lời khuyên độc lập nếu cần thiết.</p>
          <p>© 2024 XM là tên giao dịch của Trading Point Holdings Ltd. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
