import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import './XMWeb.css';

function XMWeb() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Fake live trading ticker prices
  const [prices, setPrices] = useState({
    eurusd: 1.0864,
    us500: 5302.25,
    gold: 2415.60,
    coffee: 218.45,
    apple: 189.84,
  });

  const [trends, setTrends] = useState({
    eurusd: '+0.15%',
    us500: '+0.42%',
    gold: '+1.12%',
    coffee: '-0.85%',
    apple: '+1.35%',
  });

  // Small random price updates to look "live"
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const eurusdDiff = (Math.random() - 0.5) * 0.0002;
        const us500Diff = (Math.random() - 0.5) * 1.5;
        const goldDiff = (Math.random() - 0.5) * 0.8;
        const coffeeDiff = (Math.random() - 0.5) * 0.4;
        const appleDiff = (Math.random() - 0.5) * 0.3;

        return {
          eurusd: parseFloat((prev.eurusd + eurusdDiff).toFixed(4)),
          us500: parseFloat((prev.us500 + us500Diff).toFixed(2)),
          gold: parseFloat((prev.gold + goldDiff).toFixed(2)),
          coffee: parseFloat((prev.coffee + coffeeDiff).toFixed(2)),
          apple: parseFloat((prev.apple + appleDiff).toFixed(2)),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="xm-web-page">
      {/* ===== DOUBLE-LAYERED HEADER ===== */}
      <div className="xm-header-wrapper">
        <div className="xm-top-bar">
          <div className="xm-top-bar-container">
            <div className="xm-top-bar-right">
              <a href="#" className="xm-top-link">Hợp tác</a>
              <span className="xm-top-divider">|</span>
              <LanguageSelector />
            </div>
          </div>
        </div>

        <header className="xm-main-nav">
          <div className="xm-nav-container">
            <div className="xm-nav-left">
              <Link to="/" className="kucoin-logo" style={{ textDecoration: 'none' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
                  <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
                  <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
                </svg>
                <span className="kucoin-text">KUCOIN</span>
              </Link>
              <nav className="xm-menu-links">
                <div className="xm-menu-item dropdown">
                  <span>Giao dịch</span>
                  <span className="xm-arrow">▼</span>
                </div>
                <div className="xm-menu-item dropdown">
                  <span>Khám phá</span>
                  <span className="xm-arrow">▼</span>
                </div>
                <a href="#" className="xm-menu-item">Khuyến mãi</a>
                <div className="xm-menu-item dropdown">
                  <span>Giới thiệu Công ty</span>
                  <span className="xm-arrow">▼</span>
                </div>
              </nav>
            </div>
            <div className="xm-nav-right">
              <Link to="/login" className="xm-login-txt">Đăng nhập</Link>
              <Link to="/register" className="xm-register-btn">Bắt đầu</Link>
            </div>
          </div>
        </header>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="xm-hero-section">
        <div className="xm-hero-container">
          <p className="xm-hero-badge">Được hơn <strong>20 triệu nhà giao dịch</strong> tin cậy</p>
          <h1 className="xm-hero-title">
            Nhà Môi Giới Đạt Nhiều<br />Giải Thưởng vì một lý do
          </h1>
          <p className="xm-hero-subtitle">
            Chúng tôi cung cấp môi trường giao dịch vượt trội, đặt trader vào vị thế tốt nhất để tạo ra lợi nhuận.
          </p>

          <Link to="/register" className="xm-hero-cta">
            Nhận Thưởng 100% lên đến 100$
          </Link>
          <p className="xm-hero-terms">*Ưu đãi có hạn định</p>

          <p className="xm-hero-assets-title">Dễ dàng tiếp cận hơn 1.400 tài sản toàn cầu</p>

          {/* ===== TICKERS ROW ===== */}
          <div className="xm-tickers-grid">
            {/* EURUSD */}
            <div className="xm-ticker-card">
              <div className="xm-ticker-header">
                <div className="xm-ticker-flag-pair">
                  <div className="xm-flag eu"></div>
                  <div className="xm-flag us"></div>
                </div>
                <div className="xm-ticker-name-pair">
                  <span className="xm-symbol">EURUSD</span>
                  <span className="xm-full-name">Euro vs U.S. Dollar</span>
                </div>
              </div>
              <div className="xm-ticker-data">
                <span className="xm-price">{prices.eurusd}</span>
                <span className={`xm-trend ${trends.eurusd.startsWith('+') ? 'up' : 'down'}`}>
                  {trends.eurusd}
                </span>
              </div>
            </div>

            {/* US500 */}
            <div className="xm-ticker-card">
              <div className="xm-ticker-header">
                <div className="xm-ticker-flag-pair">
                  <div className="xm-flag us"></div>
                </div>
                <div className="xm-ticker-name-pair">
                  <span className="xm-symbol">US500</span>
                  <span className="xm-full-name">S&P 500 (US500)</span>
                </div>
              </div>
              <div className="xm-ticker-data">
                <span className="xm-price">{prices.us500.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className={`xm-trend ${trends.us500.startsWith('+') ? 'up' : 'down'}`}>
                  {trends.us500}
                </span>
              </div>
            </div>

            {/* GOLD */}
            <div className="xm-ticker-card">
              <div className="xm-ticker-header">
                <div className="xm-ticker-flag-pair gold-icon">
                  🏆
                </div>
                <div className="xm-ticker-name-pair">
                  <span className="xm-symbol">GOLD</span>
                  <span className="xm-full-name">Gold</span>
                </div>
              </div>
              <div className="xm-ticker-data">
                <span className="xm-price">{prices.gold.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className={`xm-trend ${trends.gold.startsWith('+') ? 'up' : 'down'}`}>
                  {trends.gold}
                </span>
              </div>
            </div>

            {/* COFFEE */}
            <div className="xm-ticker-card">
              <div className="xm-ticker-header">
                <div className="xm-ticker-flag-pair coffee-icon">
                  ☕
                </div>
                <div className="xm-ticker-name-pair">
                  <span className="xm-symbol">COFFEE</span>
                  <span className="xm-full-name">US Coffee</span>
                </div>
              </div>
              <div className="xm-ticker-data">
                <span className="xm-price">{prices.coffee}</span>
                <span className={`xm-trend ${trends.coffee.startsWith('+') ? 'up' : 'down'}`}>
                  {trends.coffee}
                </span>
              </div>
            </div>

            {/* Apple */}
            <div className="xm-ticker-card">
              <div className="xm-ticker-header">
                <div className="xm-ticker-flag-pair apple-icon">
                  
                </div>
                <div className="xm-ticker-name-pair">
                  <span className="xm-symbol">Apple</span>
                  <span className="xm-full-name">Apple (AAPL.OQ)</span>
                </div>
              </div>
              <div className="xm-ticker-data">
                <span className="xm-price">{prices.apple}</span>
                <span className={`xm-trend ${trends.apple.startsWith('+') ? 'up' : 'down'}`}>
                  {trends.apple}
                </span>
              </div>
            </div>
          </div>

          {/* ===== PARTNERS/AWARDS SECTION ===== */}
          <div className="xm-awards-wrapper">
            <h3 className="xm-awards-title">Đại giải Nhà Môi Giới Xuất Sắc Nhất nhiều năm liền</h3>
            <div className="xm-awards-grid">
              <div className="xm-award-badge">
                <span className="xm-badge-title">CFI.co</span>
                <span className="xm-badge-desc">Best Global Trading Platform</span>
              </div>
              <div className="xm-award-badge">
                <span className="xm-badge-title">SVS Award</span>
                <span className="xm-badge-desc">Best Customer Service Broker</span>
              </div>
              <div className="xm-award-badge">
                <span className="xm-badge-title">Smart Vision</span>
                <span className="xm-badge-desc">Best Forex Broker Middle East</span>
              </div>
              <div className="xm-award-badge">
                <span className="xm-badge-title">Global Forex</span>
                <span className="xm-badge-desc">Most Reliable Broker Worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS SHOWCASE SECTION (WHITE BACKGROUND) ===== */}
      <section className="xm-showcase-section">
        <div className="xm-showcase-container">
          <h2 className="xm-showcase-heading">Khám phá các sản phẩm <span className="xm-accent-blue">được yêu thích nhất</span></h2>
          <p className="xm-showcase-subheading">Tìm hiểu một số sản phẩm tiêu biểu đã giúp chúng tôi giữ chân mọi nhà giao dịch.</p>

          <div className="xm-showcase-grid">
            {/* Card 1: Ứng dụng XM */}
            <div className="xm-product-card dark-bg-card">
              <div className="xm-product-content">
                <h3 className="xm-product-title">Ứng dụng XM</h3>
                <p className="xm-product-desc">
                  Trải nghiệm toàn bộ dịch vụ của XM trên Ứng dụng XM, được đánh giá cao và đạt nhiều giải thưởng.
                </p>
                <div className="xm-rating-stars-wrapper">
                  <div className="xm-store-rating">
                    <span className="xm-stars">★★★★★</span>
                    <span className="xm-score">App Store 4.8</span>
                  </div>
                  <div className="xm-store-rating">
                    <span className="xm-stars">★★★★★</span>
                    <span className="xm-score">Google Play 4.7</span>
                  </div>
                </div>
                <a href="#" className="xm-product-action-link">Tải ứng dụng <span>→</span></a>
              </div>
              <div className="xm-product-visual phone-mockup">
                {/* CSS simulated smart phone frame */}
                <div className="css-phone">
                  <div className="css-phone-notch"></div>
                  <div className="css-phone-screen">
                    <div className="css-phone-header">XM Trade</div>
                    <div className="css-phone-chart">
                      <div className="chart-line"></div>
                      <div className="chart-dot"></div>
                    </div>
                    <div className="css-phone-actions">
                      <span className="btn buy">BUY</span>
                      <span className="btn sell">SELL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Thưởng 100% */}
            <div className="xm-product-card blue-gradient-bg-card">
              <div className="xm-product-content">
                <h3 className="xm-product-title">Thưởng 100%</h3>
                <p className="xm-product-desc">
                  Dùng tiền của chúng tôi để giao dịch nhiều hơn, giảm rủi ro và tăng lợi nhuận.
                </p>
                <div className="xm-promo-highlight">
                  Nhận Thưởng 100%<br />lên đến 100$
                </div>
                <Link to="/register" className="xm-product-action-link light-text">Nhận Thưởng <span>→</span></Link>
              </div>
              <div className="xm-product-visual gift-mockup">
                <div className="css-giftbox">
                  <div className="css-gift-lid"></div>
                  <div className="css-gift-box-body"></div>
                  <div className="css-gift-ribbon-vertical"></div>
                  <div className="css-gift-ribbon-horizontal"></div>
                </div>
              </div>
            </div>

            {/* Card 3: Các cuộc thi XM */}
            <div className="xm-product-card dark-bg-card">
              <div className="xm-product-content">
                <h3 className="xm-product-title">Các cuộc thi XM</h3>
                <p className="xm-product-desc">
                  Vượt lên dẫn đầu và giành phần thưởng trong ~100.000$ thưởng tiền mặt có thể rút được.
                </p>
                <a href="#" className="xm-product-action-link">Tham gia ngay <span>→</span></a>
              </div>
              <div className="xm-product-visual trophy-mockup">
                <div className="css-trophy">
                  <div className="css-trophy-cup"></div>
                  <div className="css-trophy-stem"></div>
                  <div className="css-trophy-base"></div>
                </div>
              </div>
            </div>

            {/* Card 4: Sao chép giao dịch XM */}
            <div className="xm-product-card navy-bg-card">
              <div className="xm-product-content">
                <h3 className="xm-product-title">Sao chép giao dịch XM</h3>
                <p className="xm-product-desc">
                  Gia nhập hàng ngũ hơn 700.000 trader đang sao chép các chiến lược thành công. Hoặc chia sẻ giao dịch của bạn và nhận hoa hồng.
                </p>
                <a href="#" className="xm-product-action-link">Bắt đầu Sao chép giao dịch <span>→</span></a>
              </div>
              <div className="xm-product-visual copy-trading-visual">
                <div className="css-copy-network">
                  <div className="node main-node">📈</div>
                  <div className="node sub-node node1">👤</div>
                  <div className="node sub-node node2">👤</div>
                  <div className="node sub-node node3">👤</div>
                  <div className="line line1"></div>
                  <div className="line line2"></div>
                  <div className="line line3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATISTICS SECTION (DARK BACKGROUND) ===== */}
      <section className="xm-stats-section">
        <div className="xm-stats-container">
          <h2 className="xm-stats-heading">Kết quả của chúng tôi thể hiện qua các con số</h2>
          <p className="xm-stats-subheading">
            Không nhà môi giới nào nỗ lực đem đến cho bạn những gì cần thiết để tối đa hóa tiềm năng giao dịch như chúng tôi.
          </p>

          <div className="xm-numbers-row">
            <div className="xm-num-item">
              <h3 className="xm-num-title">2,4 Tỷ</h3>
              <p className="xm-num-desc">giao dịch đã được thực hiện trên nền tảng XM</p>
            </div>
            <div className="xm-num-item">
              <h3 className="xm-num-title">Không</h3>
              <p className="xm-num-desc">từ chối lệnh hoặc báo giá lại</p>
            </div>
            <div className="xm-num-item">
              <h3 className="xm-num-title">99,8%</h3>
              <p className="xm-num-desc">lệnh rút tiền được phê duyệt tự động</p>
            </div>
          </div>

          <div className="xm-benefits-grid">
            <div className="xm-benefit-card">
              <div className="xm-benefit-icon">📉</div>
              <h4 className="xm-benefit-title">Spread thấp</h4>
              <p className="xm-benefit-desc">Giao dịch với spread thấp chỉ từ 0,6 pip.</p>
            </div>
            <div className="xm-benefit-card">
              <div className="xm-benefit-icon">❌</div>
              <h4 className="xm-benefit-title">Không phí ẩn</h4>
              <p className="xm-benefit-desc">Không phải trả phí swap và hoa hồng.</p>
            </div>
            <div className="xm-benefit-card">
              <div className="xm-benefit-icon">⚡</div>
              <h4 className="xm-benefit-title">Khớp lệnh đỉnh cao</h4>
              <p className="xm-benefit-desc">Tận hưởng giá minh bạch không báo lại, không từ chối lệnh.</p>
            </div>
            <div className="xm-benefit-card">
              <div className="xm-benefit-icon">💰</div>
              <h4 className="xm-benefit-title">Rút tiền tức thì</h4>
              <p className="xm-benefit-desc">Nhận tiền dễ dàng và không mất phí.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="xm-footer">
        <div className="xm-footer-container">
          <div className="xm-footer-top">
            <div className="kucoin-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
                <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
                <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
              </svg>
              <span className="kucoin-text" style={{ fontSize: '18px' }}>KUCOIN</span>
            </div>
            <div className="xm-social-circles">
              <a href="#" className="circle">f</a>
              <a href="#" className="circle">𝕏</a>
              <a href="#" className="circle">▶</a>
              <a href="#" className="circle">in</a>
              <a href="#" className="circle">📸</a>
            </div>
          </div>

          <div className="xm-footer-links-row">
            <a href="#">Chính sách Bảo mật</a>
            <a href="#">Chính sách Cookie</a>
            <a href="#">Chính sách và Lệ Phí</a>
            <a href="#">Tài liệu pháp lý</a>
          </div>

          <div className="xm-footer-legal-copy">
            <p>XM International MU Limited được quản lý bởi Ủy ban Dịch vụ Tài chính (FSC) của Mauritius theo Giấy phép kinh doanh số đầu tư ngày sinh số 28523202006l.</p>
            <p>XM (SC) Limited được quản lý bởi Cơ quan Dịch vụ Tài chính Seychelles (FSA) theo Giấy phép Mua bán Chứng khoán số SD190.</p>
            <p>XM Global Limited được quản lý bởi Ủy ban Dịch vụ Tài chính (FSC) của Belize theo Liệu chứng khoản 2021 (giấy phép số 5667558).</p>
            <p>Cảnh báo đầu tư: Các dịch vụ của chúng tôi khi đăng ký và sử dụng trên toàn bộ vốn đầu tư của bạn. Vui lòng đọc và đảm bảo bạn hiểu đầy đủ nội dung Thông báo Rủi Ro của XM Global.</p>
            <p className="copyright">© 2026 XM. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>

      {/* ===== STICKY DISCLAIMER ===== */}
      {showDisclaimer && (
        <div className="xm-sticky-disclaimer">
          <div className="disclaimer-content">
            <p>
              <strong>Cảnh báo Rủi ro:</strong> Có rủi ro vốn. Các sản phẩm có đòn bẩy có thể không phù hợp với tất cả mọi người. Hãy đọc kỹ <a href="#">Thông báo Rủi ro</a> của chúng tôi.
            </p>
            <button className="close-disclaimer-btn" onClick={() => setShowDisclaimer(false)}>×</button>
          </div>
        </div>
      )}

      {/* ===== FLOATING CHAT BUTTON ===== */}
      <div className="xm-floating-chat">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
      </div>
    </div>
  );
}

export default XMWeb;
