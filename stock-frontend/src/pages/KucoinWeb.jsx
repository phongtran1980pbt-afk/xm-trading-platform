import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import { BuyCryptoMenu, TradeMenu, DerivativesMenu, EarnMenu, MoreMenu } from './MegaMenus';
import './KucoinWeb.css';

function KucoinWeb() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem('user');
      if (loggedInUser && loggedInUser !== 'undefined') {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setUser(JSON.parse(loggedInUser));
      }
    } catch (e) {
      console.error('Lỗi parse user:', e);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState('hot');
  const [showQR, setShowQR] = useState(false);

  // Live Crypto Prices
  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: { price: 68420.50, change: '+1.85%', isUp: true, sparkline: [40, 45, 42, 48, 46, 52, 50] },
    ETH: { price: 3550.80, change: '+2.42%', isUp: true, sparkline: [30, 32, 28, 35, 33, 38, 42] },
    KCS: { price: 10.45, change: '+5.12%', isUp: true, sparkline: [10, 11, 10.8, 12, 11.5, 13, 14.5] },
    SOL: { price: 174.20, change: '-0.95%', isUp: false, sparkline: [80, 85, 78, 76, 74, 75, 72] },
    XRP: { price: 0.524, change: '+0.15%', isUp: true, sparkline: [12, 13, 12.8, 13.2, 13, 13.5, 13.8] },
    PEPE: { price: 0.0000142, change: '-4.65%', isUp: false, sparkline: [50, 52, 48, 45, 42, 40, 38] },
  });

  // Dynamic live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          const coin = next[symbol];
          const volatility = symbol === 'PEPE' ? 0.02 : 0.0015;
          const changePercent = (Math.random() - 0.48) * coin.price * volatility;
          const newPrice = parseFloat((coin.price + changePercent).toFixed(symbol === 'PEPE' ? 8 : 2));
          const direction = newPrice >= coin.price;
          const diffPercent = ((newPrice - coin.price) / coin.price * 100).toFixed(2);
          
          // Rotate sparkline data
          const newSparkline = [...coin.sparkline.slice(1), parseFloat((coin.sparkline[coin.sparkline.length - 1] + (Math.random() - 0.5) * 5).toFixed(1))];

          next[symbol] = {
            price: newPrice,
            change: `${direction ? '+' : ''}${diffPercent}%`,
            isUp: direction,
            sparkline: newSparkline,
          };
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleQuickRegister = (e) => {
    e.preventDefault();
    if (emailInput) {
      navigate(`/register?email=${encodeURIComponent(emailInput)}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="kucoin-web-page">
      {/* ===== HEADER NAVIGATION ===== */}
      <header className="k-header">
        <div className="k-header-container">
          <div className="k-header-left">
            <Link to="/" className="k-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
                <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
                <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
              </svg>
              <span className="k-logo-text">KUCOIN</span>
            </Link>

            <div className="k-toggle-pill">
              <span className="pill-item active">Sàn giao dịch</span>
              <span className="pill-item">Web3</span>
            </div>

            <nav className="k-nav-menu">
              <div className="k-nav-item dropdown">
                <span>Mua tiền điện tử</span>
                <span className="k-nav-arrow">▼</span>
                <BuyCryptoMenu />
              </div>
              <a href="#" className="k-nav-item">Thị trường</a>
              <div className="k-nav-item dropdown">
                <span>Giao dịch</span>
                <span className="k-nav-arrow">▼</span>
                <TradeMenu />
              </div>
              <div className="k-nav-item dropdown">
                <span>Phái sinh</span>
                <span className="k-nav-arrow">▼</span>
                <DerivativesMenu />
              </div>
              <div className="k-nav-item dropdown">
                <span>Trung tâm bệ phóng</span>
                <span className="k-nav-arrow">▼</span>
              </div>
              <div className="k-nav-item dropdown">
                <span>Kiếm tiền</span>
                <span className="k-nav-arrow">▼</span>
                <EarnMenu />
              </div>
              <div className="k-nav-item dropdown">
                <span>Tổ chức</span>
                <span className="k-nav-arrow">▼</span>
              </div>
              <div className="k-nav-item dropdown">
                <span>Xem thêm</span>
                <span className="k-nav-arrow">▼</span>
                <MoreMenu />
              </div>
              <div className="k-nav-gift">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V20H4V12H20ZM21 4H3C2.4 4 2 4.4 2 5V9C2 9.6 2.4 10 3 10H21C21.6 10 22 9.6 22 9V5C22 4.4 21.6 4 21 4ZM12 4C13.5 4 15 2 15 2H9C9 2 10.5 4 12 4Z" />
                </svg>
              </div>
            </nav>
          </div>

          <div className="k-header-right">
            <div className="k-util-group">
              <button className="k-util-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              
              <div className="k-util-btn k-app-download-trigger" 
                   onMouseEnter={() => setShowQR(true)}
                   onMouseLeave={() => setShowQR(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                {showQR && (
                  <div className="k-qr-tooltip-header">
                    <div className="k-qr-code"></div>
                    <p>Quét để tải App KuCoin</p>
                  </div>
                )}
              </div>
              
              <button className="k-util-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </button>

              <button className="k-util-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
            </div>

            <div className="k-header-divider"></div>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                  Xin chào, {user.fullName || user.email}
                </span>
                {user.isAdmin && (
                  <Link to="/admin" style={{ color: '#24DB9B', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #24DB9B', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    Quản trị viên
                  </Link>
                )}
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #7e8a9c', color: '#7e8a9c', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="k-login-link">Đăng nhập</Link>
                <Link to="/register" className="k-register-btn-white">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="k-hero">
        <div className="k-hero-container">
          <div className="k-hero-left">
            <div className="k-hero-badge">
              🏆 Sàn Giao Dịch Tiền Điện Tử Số 1
            </div>
            <h1 className="k-hero-title">
              Tìm ngọc ẩn Crypto<br />tại KuCoin
            </h1>
            <p className="k-hero-subtitle">
              Khám phá sàn giao dịch hàng đầu thế giới để mua, bán và tích lũy tiền điện tử an toàn. Tiếp cận hơn 700+ tài sản kỹ thuật số sớm nhất.
            </p>

            <form className="k-hero-form" onSubmit={handleQuickRegister}>
              <input 
                type="text" 
                placeholder="Email / Số điện thoại" 
                className="k-hero-input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button type="submit" className="k-hero-submit">Đăng ký ngay</button>
            </form>

            <div className="k-hero-reward">
              <span className="gift-icon">🎁</span>
              <span>Đăng ký nhận phần thưởng chào mừng người mới lên tới <strong>700 USDT</strong></span>
            </div>
          </div>

          <div className="k-hero-right">
            <div className="k-hero-visual-card">
              <div className="k-visual-glow"></div>
              <div className="k-visual-screen">
                <div className="k-visual-header">
                  <span>Thị trường Coin</span>
                  <span className="live-dot"></span>
                </div>
                <div className="k-visual-item">
                  <span className="v-label">BTC/USDT</span>
                  <span className="v-price">${cryptoPrices.BTC.price.toLocaleString()}</span>
                  <span className="v-change up">{cryptoPrices.BTC.change}</span>
                </div>
                <div className="k-visual-item">
                  <span className="v-label">ETH/USDT</span>
                  <span className="v-price">${cryptoPrices.ETH.price.toLocaleString()}</span>
                  <span className="v-change up">{cryptoPrices.ETH.change}</span>
                </div>
                <div className="k-visual-item">
                  <span className="v-label">KCS/USDT</span>
                  <span className="v-price">${cryptoPrices.KCS.price.toLocaleString()}</span>
                  <span className="v-change up">{cryptoPrices.KCS.change}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="k-stats-bar">
          <div className="k-stats-container">
            <div className="k-stat-item">
              <h3>30 Triệu+</h3>
              <p>Người dùng toàn cầu tin tưởng</p>
            </div>
            <div className="k-stat-item">
              <h3>1,2 Nghìn Tỷ $</h3>
              <p>Khối lượng giao dịch trong 24h</p>
            </div>
            <div className="k-stat-item">
              <h3>700+</h3>
              <p>Tài sản tiền điện tử được niêm yết</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CRYPTO PRICES MARKET SECTION ===== */}
      <section className="k-market">
        <div className="k-market-container">
          <div className="k-market-header">
            <h2>Bảng giá thị trường hôm nay</h2>
            <div className="k-market-tabs">
              <button className={`tab-btn ${activeTab === 'hot' ? 'active' : ''}`} onClick={() => setActiveTab('hot')}>Được chú ý nhiều nhất</button>
              <button className={`tab-btn ${activeTab === 'gainers' ? 'active' : ''}`} onClick={() => setActiveTab('gainers')}>Tăng giá nhiều nhất</button>
              <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>Mới niêm yết</button>
            </div>
          </div>

          <div className="k-market-table-wrapper">
            <table className="k-market-table">
              <thead>
                <tr>
                  <th>Tên tài sản</th>
                  <th>Giá mới nhất</th>
                  <th>Thay đổi 24h</th>
                  <th>Xu hướng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {/* Render Tickers based on activeTab (simulated filtering) */}
                {Object.keys(cryptoPrices).map(symbol => {
                  const coin = cryptoPrices[symbol];
                  return (
                    <tr key={symbol}>
                      <td>
                        <div className="coin-cell">
                          <span className="coin-symbol">{symbol}</span>
                          <span className="coin-name">
                            {symbol === 'BTC' && 'Bitcoin'}
                            {symbol === 'ETH' && 'Ethereum'}
                            {symbol === 'KCS' && 'KuCoin Token'}
                            {symbol === 'SOL' && 'Solana'}
                            {symbol === 'XRP' && 'Ripple'}
                            {symbol === 'PEPE' && 'Pepe'}
                          </span>
                        </div>
                      </td>
                      <td className="price-cell">
                        ${symbol === 'PEPE' ? coin.price.toFixed(8) : coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`change-cell ${coin.isUp ? 'green' : 'red'}`}>
                        {coin.change}
                      </td>
                      <td>
                        {/* CSS simulated Sparkline chart using SVG */}
                        <svg className="sparkline-svg" width="90" height="24">
                          <polyline
                            fill="none"
                            stroke={coin.isUp ? '#24db9b' : '#ff3d00'}
                            strokeWidth="1.5"
                            points={coin.sparkline.map((val, idx) => `${idx * 15}, ${30 - val}`).join(' ')}
                          />
                        </svg>
                      </td>
                      <td>
                        <Link to="/register" className="trade-btn">Giao dịch</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE KUCOIN SECTION ===== */}
      <section className="k-benefits">
        <div className="k-benefits-container">
          <h2 className="k-benefits-heading">Tại sao nên chọn KuCoin?</h2>
          <p className="k-benefits-subheading">Sự lựa chọn ưu tiên của hàng triệu nhà giao dịch tiền điện tử trên toàn thế giới.</p>

          <div className="k-benefits-grid">
            <div className="k-benefit-card">
              <div className="b-icon">🛡️</div>
              <h3>Bảo mật và an toàn tối cao</h3>
              <p>Cung cấp Bằng chứng Dự trữ (Proof of Reserves) 1:1, mã hóa cấp quân sự và ví đa chữ ký để đảm bảo tài sản của bạn luôn được bảo vệ tuyệt đối.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">📞</div>
              <h3>Hỗ trợ đa ngôn ngữ 24/7</h3>
              <p>Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng trợ giúp bạn bất cứ lúc nào, hỗ trợ ngôn ngữ Tiếng Việt và các giải pháp tức thì.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">🤖</div>
              <h3>Công cụ giao dịch đột phá</h3>
              <p>Dễ dàng tiếp cập Spot, Futures, Margin, Copy Trading, và các Bot giao dịch AI miễn phí để tối đa hóa chiến lược đầu tư của bạn.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">⚡</div>
              <h3>Thanh khoản hàng đầu thị trường</h3>
              <p>Hệ thống khớp lệnh siêu tốc độ, trượt giá cực thấp và nạp/rút nhanh chóng để bạn nắm bắt cơ hội thị trường một cách tối ưu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KUCOIN EARN SECTION ===== */}
      <section className="k-earn">
        <div className="k-earn-container">
          <div className="k-earn-content">
            <h2>Gia tăng tài sản với KuCoin Earn</h2>
            <p>Kiếm thu nhập thụ động mỗi ngày từ tài sản của bạn. Lựa chọn linh hoạt giữa gửi tiết kiệm, staking, và các sản phẩm sinh lời cao khác.</p>
            <Link to="/register" className="earn-cta">Bắt đầu kiếm tiền</Link>
          </div>
          <div className="k-earn-cards">
            <div className="earn-card">
              <span className="earn-coin">USDT</span>
              <span className="earn-apr">12.50% APR</span>
              <span className="earn-type">Tiết kiệm linh hoạt</span>
            </div>
            <div className="earn-card">
              <span className="earn-coin">KCS</span>
              <span className="earn-apr">18.24% APR</span>
              <span className="earn-type">Staking KCS</span>
            </div>
            <div className="earn-card">
              <span className="earn-coin">ETH</span>
              <span className="earn-apr">4.85% APR</span>
              <span className="earn-type">Staking ETH 2.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DOWNLOAD APP SECTION ===== */}
      <section className="k-download">
        <div className="k-download-container">
          <div className="k-download-left">
            <h2>Tải xuống ứng dụng KuCoin</h2>
            <p>Giao dịch tiền điện tử mọi lúc, mọi nơi ngay trên ứng dụng di động KuCoin. Hỗ trợ đầy đủ các tính năng biểu đồ, theo dõi lời/lỗ và giao dịch nhanh.</p>
            
            <div className="k-download-platforms">
              <div className="k-qr-badge">
                <div className="qr-mini"></div>
                <span>Quét mã QR để tải về</span>
              </div>
              <div className="platform-buttons">
                <a href="#" className="btn-app">Apple Store</a>
                <a href="#" className="btn-app">Google Play</a>
                <a href="#" className="btn-app">Android APK</a>
                <a href="#" className="btn-app">Windows</a>
                <a href="#" className="btn-app">macOS</a>
              </div>
            </div>
          </div>

          <div className="k-download-right">
            <div className="app-phone-mockup">
              <div className="app-phone-body">
                <div className="app-phone-screen">
                  <div className="app-screen-header">KuCoin App</div>
                  <div className="app-screen-balance">
                    <span className="bal-lbl">Tổng tài sản (USDT)</span>
                    <span className="bal-val">12,485.60</span>
                    <span className="bal-pct">+5.82% Hôm nay</span>
                  </div>
                  <div className="app-mini-list">
                    <div className="mini-item"><span>BTC</span><span className="green">+2.15%</span></div>
                    <div className="mini-item"><span>ETH</span><span className="green">+3.10%</span></div>
                    <div className="mini-item"><span>KCS</span><span className="green">+8.12%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="k-footer">
        <div className="k-footer-container">
          <div className="k-footer-brand-top">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
              <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
              <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
            </svg>
            <span className="k-logo-text">KUCOIN</span>
          </div>

          <div className="k-footer-grid">
            <div className="footer-col">
              <h4>Công ty</h4>
              <a href="#">Giới thiệu</a>
              <a href="#">Việc làm</a>
              <a href="#">Blog</a>
              <a href="#">Tin tức và Thông báo</a>
              <a href="#">Truyền thông</a>
              <a href="#">Hợp tác thương hiệu</a>
              <a href="#">KuCoin Labs</a>
              <a href="#">KuCoin Ventures</a>
              <a href="#">PoR (Bằng chứng dự trữ)</a>
              <a href="#">An toàn</a>
              <a href="#">Điều khoản sử dụng</a>
              <a href="#">Chính sách quyền riêng tư</a>
              <a href="#">Tuyên bố rủi ro</a>
              <a href="#">AML & CFT</a>
              <a href="#">Yêu cầu thực thi luật</a>
            </div>
            
            <div className="footer-col">
              <h4>Sản phẩm</h4>
              <a href="#">Mua tiền điện tử</a>
              <a href="#">Chuyển đổi</a>
              <a href="#">KuCard</a>
              <a href="#">KuCoin Pay</a>
              <a href="#">Giao dịch giao ngay</a>
              <a href="#">Giao dịch giao sau</a>
              <a href="#">Giao dịch ký quỹ</a>
              <a href="#">KuCoin Earn</a>
              <a href="#">Mua với chiết khấu</a>
              <a href="#">KuMining</a>
              <a href="#">GemSPACE</a>
              <a href="#">KuCoin Tìm hiểu</a>
              <a href="#">Chuyển đổi</a>
              <a href="#">Spotlight</a>
              <a href="#">Giao dịch OTC</a>
              <a href="#">Trợ lý AI Kuj</a>
            </div>
            
            <div className="footer-col">
              <h4>Dịch vụ</h4>
              <a href="#">Hướng dẫn cho người mới</a>
              <a href="#">Trung tâm trợ giúp</a>
              <a href="#">Gửi yêu cầu hỗ trợ</a>
              <a href="#">Hỗ trợ kỹ thuật</a>
              <a href="#">Xác minh về</a>
              <a href="#">Trung tâm xác minh chính thức</a>
              <a href="#">P2P & VIP</a>
              <a href="#">Xử lý đặc biệt</a>
              <a href="#">Hủy niêm yết</a>
              <a href="#">Sơ đồ trang web</a>
            </div>
            
            <div className="footer-col">
              <h4>Kinh doanh</h4>
              <a href="#">Chương trình Liên kết</a>
              <a href="#">Nhà môi giới</a>
              <a href="#">Tổ chức</a>
              <a href="#">Dịch vụ API</a>
              <a href="#">Danh sách token</a>
              <a href="#">Đăng ký làm thương gia P2P</a>
              <a href="#">Thương gia KuCoin Pay</a>
            </div>
            
            <div className="footer-col">
              <h4>Giá tiền điện tử</h4>
              <a href="#">Giá Bitcoin (BTC)</a>
              <a href="#">Giá Ethereum (ETH)</a>
              <a href="#">Giá Ripple (XRP)</a>
              <a href="#">Giá KuCoin Token (KCS)</a>
              <a href="#">Giá khác</a>
            </div>
          </div>
          
          <div className="k-footer-bottom-grid">
            <div className="footer-col">
              <h4>Tìm hiểu thêm</h4>
              <a href="#">Mua Bitcoin</a>
              <a href="#">Mua Ethereum</a>
              <a href="#">Mua XRP</a>
              <a href="#">Mua Monero</a>
              <a href="#">Mua Aave</a>
              <a href="#">Mua NEAR Protocol</a>
              <a href="#">Mua Bittensor</a>
            </div>
            <div className="footer-col">
              <h4>Nhà phát triển</h4>
              <a href="#">Tài liệu API</a>
              <a href="#">SDK</a>
              <a href="#">Tải dữ liệu lịch sử</a>
            </div>
            <div className="footer-col">
              <h4>Tải ứng dụng</h4>
              <a href="#">Tải về Android</a>
              <a href="#">Tải về iOS</a>
            </div>
            <div className="footer-col footer-community">
              <h4>Cộng đồng</h4>
              <div className="k-social-icons">
                <a href="#"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.8 5.8 0 0 0-1.649.231c2.421 1.871 3.951 4.688 4.01 7.714.033 1.811-.441 3.542-1.365 5.011-.904 1.442-2.222 2.531-3.791 3.125a7.994 7.994 0 0 1-5.326.059c-1.573-.559-2.92-1.631-3.84-3.064-.919-1.455-1.424-3.178-1.454-4.993-.058-2.997 1.44-5.8 3.82-7.689A12.012 12.012 0 0 0 12 0z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.946 2.4189-2.1568 2.4189Z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm0 18.25a8.25 8.25 0 1 1 0-16.5 8.25 8.25 0 0 1 0 16.5zM12.015 6c-3.3 0-5.975 2.675-5.975 5.975 0 3.3 2.675 5.975 5.975 5.975s5.975-2.675 5.975-5.975C17.99 8.675 15.315 6 12.015 6zm.32 10.15c-1.745 0-2.91-1.135-2.91-2.975 0-1.74 1.165-2.96 2.91-2.96 1.765 0 2.915 1.13 2.935 2.95 0 .045 0 .09-.005.135h-4.3c.095 1.055.935 1.54 1.735 1.54.595 0 1.18-.285 1.395-.8h1.165c-.21.99-1.155 2.11-2.925 2.11zm-.245-4.7c-.63 0-1.175.48-1.285 1.25h2.51c-.08-.75-.545-1.25-1.225-1.25z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg></a>
                <a href="#"><svg viewBox="0 0 24 24"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 4a8 8 0 100 16 8 8 0 000-16zM8 14l6-4-6-4v8z" fill="currentColor"/></svg></a>
              </div>
              <div className="k-social-icons mt-10">
                <a href="#"><svg viewBox="0 0 24 24"><path d="M22.986 6.012a6 6 0 00-6-6h-9.97a6 6 0 00-6 6v9.972a6 6 0 006 6h9.972a6 6 0 006-6V6.012zm-4.484 7.643a1.488 1.488 0 11-1.487-1.487 1.49 1.49 0 011.487 1.487zm-1.487 4.148h-8.03v-7.39h8.03v7.39zm-8.03-9.52v-2.128a.5.5 0 01.501-.5h3.04a.5.5 0 010 1h-2.54v1.628h2.091a.5.5 0 010 1h-2.091v2.164a.5.5 0 01-1 0v-3.164z" fill="currentColor"/></svg></a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating action buttons */}
        <div className="k-floating-actions">
          <button className="k-fab-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
          </button>
          <button className="k-fab-btn" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default KucoinWeb;
