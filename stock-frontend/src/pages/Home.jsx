import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="home-page">
      <Header />
      
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <p className="hero-badge">NỀN TẢNG ĐẠT GIẢI THƯỞNG</p>
            <h1 className="hero-title">
              Lựa chọn đúng để giao dịch tài sản toàn cầu thông minh hơn
            </h1>
            <p className="hero-description">
              Nhận Thưởng Nạp Tiền hơn <span className="highlight-green">5.000$</span> và giao dịch tài sản toàn cầu mạnh mẽ hơn.*
            </p>
            <Link to="/register" className="cta-button primary-btn">
              Bắt đầu giao dịch
            </Link>
            <p className="hero-note">
              *Thưởng không rút được, nhưng lợi nhuận thì được. Áp dụng Đ.khoản&amp;ĐK.
            </p>
          </div>
          <div className="hero-image-container">
            <img src="/images/hero-pedestal.png" alt="Trading Assets" className="hero-main-image" />
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="trust-bar">
        <div className="trust-item">
          <svg className="trust-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Không hoa hồng
        </div>
        <div className="trust-item">
          <svg className="trust-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Không báo giá lại
        </div>
        <div className="trust-item">
          <svg className="trust-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Khớp lệnh nhanh
        </div>
      </section>

      {/* ===== APP DOWNLOAD SECTION ===== */}
      <section className="app-download-section">
        <div className="app-download-container">
          <div className="app-download-content">
            <h2 className="app-download-title">Tải xuống ứng dụng được đánh giá cao của chúng tôi</h2>
            <div className="app-badges">
              <a href="#" className="app-badge">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" height="40" />
              </a>
              <a href="#" className="app-badge">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" height="40" />
              </a>
            </div>
            <div className="app-ratings">
              <div className="rating-group">
                <span className="stars">★★★★★</span>
                <span className="rating-score">4.7/5</span>
              </div>
              <div className="rating-group">
                <span className="stars">★★★★★</span>
                <span className="rating-score">4.5/5</span>
              </div>
            </div>
          </div>
          <div className="app-download-image">
            <img src="/images/trading-app.png" alt="XM Trading App" />
          </div>
        </div>
      </section>

      {/* ===== GLOBAL TRADING SECTION ===== */}
      <section className="global-section">
        <h2 className="global-title">Giao dịch tài sản toàn cầu với<br/>nhà môi giới uy tín quốc tế</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#333" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3>Rút tiền tức thì</h3>
            <p>Rút tiền nhanh, an toàn, không tốn phí, 24/7, kể cả cuối tuần.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#333" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h3>Cộng đồng hơn 20 triệu nhà giao dịch</h3>
            <p>Gia nhập cộng đồng giao dịch toàn cầu và đưa ra quyết định tài chính thông minh hơn.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#333" strokeWidth="1.5"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <h3>Trải nghiệm giao dịch đạt nhiều giải thưởng</h3>
            <p>Trải nghiệm giao dịch khác biệt cùng dịch vụ vượt trội và điều kiện tốt nhất.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#333" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>An toàn và bảo mật</h3>
            <p>Yên tâm giao dịch với broker được cấp phép và tiền của bạn luôn được bảo vệ ở các ngân hàng cấp 1.</p>
          </div>
        </div>
      </section>

      {/* ===== STEPS SECTION ===== */}
      <section className="steps-section">
        <h2 className="steps-title">Bắt đầu giao dịch ngay!</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-image">
              <img src="/images/step-register.png" alt="Đăng ký" />
            </div>
            <h3>Đăng ký</h3>
            <p>Mở tài khoản dễ dàng.</p>
          </div>
          <div className="step-card">
            <div className="step-image">
              <img src="/images/step-deposit.png" alt="Nạp tiền" />
            </div>
            <h3>Nạp tiền</h3>
            <p>Nạp và rút nhanh chóng với đại diện thanh toán địa phương.</p>
          </div>
          <div className="step-card">
            <div className="step-image">
              <img src="/images/step-trade.png" alt="Giao dịch" />
            </div>
            <h3>Giao dịch</h3>
            <p>Tham gia cộng đồng hơn 20 triệu nhà giao dịch.</p>
          </div>
        </div>
        <div className="steps-cta">
          <Link to="/register" className="cta-button primary-btn">Bắt đầu giao dịch</Link>
        </div>
        <p className="steps-warning">Cảnh báo rủi ro: Các dịch vụ của chúng tôi có rủi ro cao và có thể dẫn đến mất một phần hoặc toàn bộ vốn đầu tư của bạn.</p>
      </section>

      {/* ===== FOOTER SECTION ===== */}
      <section className="footer-top-section">
        <div className="footer-top-container">
          <div className="footer-logo-area">
            <span className="footer-logo"><span className="logo-x">X</span><span className="logo-m">M</span></span>
          </div>
          <div className="footer-social-icons">
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.35z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="#fff" strokeWidth="1.5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#fff" strokeWidth="2"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8" stroke="#fff" strokeWidth="2"/></svg></a>
            <a href="#" className="social-circle"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3h0m12 5v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22"/></svg></a>
          </div>
        </div>
        <div className="footer-legal-links">
          <a href="#">Chính sách Bảo mật</a>
          <a href="#">Chính sách Cookie</a>
          <a href="#">Chính sách và Lệ Phí</a>
          <a href="#">Tài liệu pháp lý</a>
        </div>
        <div className="footer-legal-text">
          <p>XM International MU Limited được quản lý bởi Ủy ban Dịch vụ Tài chính (FSC) của Mauritius theo Giấy phép kinh doanh số đầu tư ngày sinh số 28523202006l.</p>
          <p>XM (SC) Limited được quản lý bởi Cơ quan Dịch vụ Tài chính Seychelles (FSA) theo Giấy phép Mua bán Chứng khoán số SD190.</p>
          <p>XM Global Limited được quản lý bởi Ủy ban Dịch vụ Tài chính (FSC) của Belize theo Liệu chứng khoản 2021 (giấy phép số 5667558).</p>
          <p>Cảnh báo đầu tư: Các dịch vụ của chúng tôi khi đăng ký và sử dụng trên toàn bộ vốn đầu tư của bạn. Vui lòng đọc và đảm bảo bạn hiểu đầy đủ nội dung Thông báo Rủi Ro của XM Global.</p>
          <p className="footer-copyright">© 2024 XM. Bảo lưu mọi quyền.</p>
        </div>
      </section>

      {/* Chat Button */}
      <div className="chat-bubble">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
    </div>
  );
}

export default Home;
