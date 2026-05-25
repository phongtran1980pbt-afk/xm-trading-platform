import React from 'react';
import { Link } from 'react-router-dom';
import './MegaMenu.css';

export function BuyCryptoMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-2" style={{ gap: '60px' }}>
        <div>
          <h3 className="mega-title">Mua tiền điện tử</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <a href="#" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>Giao dịch P2P</h4>
                <p>Tiền sao thương gia đã được xác minh, sử dụng nhiều phương thức thanh toán nội địa</p>
              </div>
            </a>
            <Link to="/support/deposit" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              </div>
              <div className="mega-link-text">
                <h4>Nạp tiền pháp định</h4>
                <p>Nạp tiền vào số dư tiền pháp định thông qua chuyển khoản ngân hàng</p>
              </div>
            </Link>
            <a href="#" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>Bên thứ ba</h4>
                <p>Banxa, Simplex, BTC Direct, Onramp</p>
              </div>
            </a>
          </div>

          <h3 className="mega-title" style={{ marginTop: '24px' }}>Chi tiêu tiền điện tử</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Pay</h4>
              <p>Khám phá các giải pháp thanh toán và thương mại mới cho cá nhân và doanh nghiệp</p>
            </div>
          </a>
        </div>
        
        <div>
          <h3 className="mega-title">Chi tiêu tiền điện tử</h3>
          <div className="kucard-banner">
            <img src="https://assets.staticimg.com/kucard/banner_kucard_new.png" alt="KuCard" />
            <h4>KuCard</h4>
            <p>Dùng KuCard để thanh toán và nhận tiền hoàn lại</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TradeMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-3">
        {/* Col 1 */}
        <div className="trade-alpha-box">
          <h3>Bảng xếp hạng các coin Alpha<br/>tiềm năng</h3>
          <p>Hãy là người đầu tiên nắm bắt các tài sản chất lượng cao trên chuỗi.</p>
          <Link to="/markets/alpha" className="mega-btn-white">Xem</Link>

          {/* Article links */}
          <div className="mega-article-links">
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/giao-dich-giao-ngay" className="mega-article-link">
              📈 Giao dịch giao ngay toàn diện
            </Link>
            <Link to="/articles/giao-dich-ky-quy" className="mega-article-link">
              ⚡ Giao dịch ký quỹ và đòn bẩy
            </Link>
            <Link to="/articles/bot-giao-dich" className="mega-article-link">
              🤖 Bot giao dịch tự động 24/7
            </Link>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h3 className="mega-title">Giao dịch</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
            <Link to="/articles/giao-dich-giao-ngay" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>Giao dịch giao ngay</h4>
                <p>Giao dịch tiền điện tử với các công cụ toàn diện</p>
              </div>
            </Link>
            <Link to="/articles/giao-dich-ky-quy" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="mega-link-text">
                <h4>Giao dịch ký quỹ</h4>
                <p>Tăng cường lợi nhuận bằng đòn bẩy</p>
              </div>
            </Link>
            <Link to="/articles/bot-giao-dich" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>Bot giao dịch</h4>
                <p>Tự động hóa giao dịch của bạn với sự trợ giúp của thuật toán</p>
              </div>
            </Link>
            <a href="#" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>Chuyển đổi</h4>
                <p>Cách đơn giản nhất để giao dịch</p>
              </div>
            </a>
            <a href="#" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="mega-link-text">
                <h4>Giao dịch sao chép</h4>
                <p>Tăng lợi nhuận của bạn với các nhà giao dịch hàng đầu</p>
              </div>
            </a>
            <a href="#" className="mega-link-block">
              <div className="mega-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 4-4 4M8 12h8"></path></svg>
              </div>
              <div className="mega-link-text">
                <h4>KuCoin Alpha</h4>
                <p>Nắm bắt sớm các cơ hội trên chuỗi</p>
              </div>
            </a>
          </div>
        </div>

        {/* Col 3 */}
        <div>
          <div className="mega-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Tìm kiếm" />
          </div>
          <div className="mega-tabs">
            <div className="mega-tab active">Majors</div>
            <div className="mega-tab">New</div>
            <div className="mega-tab">TON</div>
            <div className="mega-tab">Thêm ▾</div>
          </div>
          <div>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#F7931A', color: '#fff' }}>B</div>
                  <div>
                    <span className="mega-coin-name">BTC</span><span className="mega-coin-pair">/USDT</span> <span className="mega-coin-badge">10X</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">77.613,8</div>
                  <div className="mega-coin-change green">+0,91%</div>
               </div>
            </a>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#627EEA', color: '#fff' }}>E</div>
                  <div>
                    <span className="mega-coin-name">ETH</span><span className="mega-coin-pair">/USDT</span> <span className="mega-coin-badge">10X</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">2.185,27</div>
                  <div className="mega-coin-change red">-0,7%</div>
               </div>
            </a>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#23292F', color: '#fff' }}>X</div>
                  <div>
                    <span className="mega-coin-name">XRP</span><span className="mega-coin-pair">/USDT</span> <span className="mega-coin-badge">10X</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">1,3735</div>
                  <div className="mega-coin-change red">-0,14%</div>
               </div>
            </a>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#00FFA3', color: '#000' }}>S</div>
                  <div>
                    <span className="mega-coin-name">SOL</span><span className="mega-coin-pair">/USDT</span> <span className="mega-coin-badge">10X</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">85,07</div>
                  <div className="mega-coin-change green">+0,41%</div>
               </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DerivativesMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-3">
        <div className="trade-alpha-box">
          <h3>Chế độ Phòng vệ giá<br/>Giao sau</h3>
          <p>Đồng thời nắm giữ các vị thế mua/long và bán/short giúp phòng ngừa rủi ro và khóa lợi nhuận</p>
          <a href="#" className="mega-btn-white">Giao dịch giao sau</a>

          <div className="mega-article-links">
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/hop-dong-tuong-lai" className="mega-article-link">
              🔮 Hợp đồng tương lai tiền điện tử
            </Link>
            <Link to="/articles/phai-sinh-option" className="mega-article-link">
              🛡️ Quyền chọn (Options) nâng cao
            </Link>
          </div>
        </div>
        
        <div>
          <h3 className="mega-title">Giao sau</h3>
          <Link to="/articles/hop-dong-tuong-lai" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <div className="mega-link-text">
              <h4>Tổng quan về Giao sau</h4>
              <p>Duyệt qua tất cả các công cụ phái sinh tiền điện tử</p>
            </div>
          </Link>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Hợp đồng ký quỹ bằng USDT</h4>
              <p>Hợp đồng tuyến tính thanh toán bằng USDT</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Hợp đồng ký quỹ bằng coin</h4>
              <p>Hợp đồng nghịch đảo thanh toán bằng coin</p>
            </div>
          </a>
          <Link to="/articles/phai-sinh-option" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Đặc quyền giao sau</h4>
              <p>Khám phá các sự kiện thú vị và đặc quyền độc quyền</p>
            </div>
          </Link>
        </div>

        <div>
          <div className="mega-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Tìm kiếm" />
          </div>
          <div className="mega-tabs">
            <div className="mega-tab active">ALL</div>
            <div className="mega-tab">USDT-M</div>
            <div className="mega-tab">USDC-M</div>
          </div>
          <div>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#F7931A', color: '#fff' }}>B</div>
                  <div>
                     <span className="mega-coin-name">BTCUSDT</span><span className="mega-coin-pair"> Vĩnh cửu</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">77.612,4</div>
                  <div className="mega-coin-change green">+0,91%</div>
               </div>
            </a>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#627EEA', color: '#fff' }}>E</div>
                  <div>
                     <span className="mega-coin-name">ETHUSDT</span><span className="mega-coin-pair"> Vĩnh cửu</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">2.185,11</div>
                  <div className="mega-coin-change green">+0,68%</div>
               </div>
            </a>
            <a href="#" className="mega-coin-item">
               <div className="mega-coin-left">
                  <div className="mega-coin-icon" style={{ backgroundColor: '#00FFA3', color: '#000' }}>S</div>
                  <div>
                     <span className="mega-coin-name">SOLUSDT</span><span className="mega-coin-pair"> Vĩnh cửu</span>
                  </div>
               </div>
               <div className="mega-coin-right">
                  <div className="mega-coin-price">85,068</div>
                  <div className="mega-coin-change red">-0,4%</div>
               </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LaunchpadMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-3">
        {/* Col 1: Promo box */}
        <div className="trade-alpha-box">
          <h3>🚀 Trung Tâm<br/>Bệ Phóng</h3>
          <p>Tham gia sớm vào các dự án blockchain tiềm năng trước khi niêm yết chính thức trên thị trường.</p>
          <Link to="/articles/category/launchpad" className="mega-btn-white">Xem tất cả</Link>

          <div className="mega-article-links">
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/launchpad-la-gi" className="mega-article-link">
              🚀 KuCoin Launchpad là gì?
            </Link>
            <Link to="/articles/ido-ieo-ico" className="mega-article-link">
              💎 IDO, IEO, ICO khác nhau thế nào?
            </Link>
          </div>
        </div>

        {/* Col 2: Services */}
        <div>
          <h3 className="mega-title">Dịch vụ bệ phóng</h3>
          <Link to="/articles/launchpad-la-gi" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"></path><path d="M22 2L15 22 11 13 2 9l20-7z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Launchpad</h4>
              <p>Tham gia IEO độc quyền của các dự án hàng đầu với giá ưu đãi</p>
            </div>
          </Link>
          <Link to="/articles/ido-ieo-ico" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Spotlight</h4>
              <p>Phân bổ token công bằng theo lượng KCS nắm giữ</p>
            </div>
          </Link>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div className="mega-link-text">
              <h4>Burnpad</h4>
              <p>Đốt KCS để nhận token mới theo cơ chế công bằng</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>PoolX</h4>
              <p>Staking để nhận token của các dự án mới</p>
            </div>
          </a>
        </div>

        {/* Col 3: Upcoming projects */}
        <div>
          <h3 className="mega-title">Dự án sắp ra mắt</h3>
          <div className="mega-launchpad-project">
            <div className="mlp-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>🔥</div>
            <div className="mlp-info">
              <div className="mlp-name">DeFi Protocol X</div>
              <div className="mlp-status upcoming">Sắp ra mắt</div>
              <div className="mlp-date">01/06/2026</div>
            </div>
          </div>
          <div className="mega-launchpad-project">
            <div className="mlp-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>⚡</div>
            <div className="mlp-info">
              <div className="mlp-name">Layer2 Chain</div>
              <div className="mlp-status live">Đang diễn ra</div>
              <div className="mlp-date">25/05 – 28/05/2026</div>
            </div>
          </div>
          <div className="mega-launchpad-project">
            <div className="mlp-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>🌐</div>
            <div className="mlp-info">
              <div className="mlp-name">Web3 GameFi</div>
              <div className="mlp-status ended">Đã kết thúc</div>
              <div className="mlp-date">10/05/2026</div>
            </div>
          </div>
          <Link to="/articles/category/launchpad" className="mega-view-all-link">
            Xem tất cả dự án →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function EarnMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-4">
        <div>
          <h3 className="mega-title">Tổng quan</h3>
          <Link to="/articles/staking-la-gi" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Earn</h4>
              <p>Một loạt các sản phẩm lợi suất giúp bạn gia tăng tiền điện tử một cách ổn định</p>
            </div>
          </Link>

          <h3 className="mega-title" style={{ marginTop: '24px' }}>Ổn định</h3>
          <Link to="/articles/staking-la-gi" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="mega-link-text">
              <h4>Earn đơn giản</h4>
              <p>Nạp hoặc rút tiền bất cứ lúc nào, nhận phần thưởng hằng ngày</p>
            </div>
          </Link>
          <Link to="/articles/staking-la-gi" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Nắm giữ để kiếm tiền</h4>
              <p>Kiếm phần thưởng bằng cách nắm giữ tài sản</p>
            </div>
          </Link>
          <Link to="/articles/staking-la-gi" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div className="mega-link-text">
              <h4>Staking</h4>
              <p>Mở khóa phần thưởng trên chuỗi hấp dẫn</p>
            </div>
          </Link>
        </div>

        <div>
          <h3 className="mega-title">Nâng cao</h3>
          <Link to="/articles/yield-farming" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div className="mega-link-text">
              <h4>Đầu tư kép</h4>
              <p>Mua thấp bán cao để thu được lợi nhuận hằng năm đáng kể</p>
            </div>
          </Link>
          <Link to="/articles/yield-farming" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuMining</h4>
              <p>Đào dễ dàng, kiếm lời thông minh</p>
            </div>
          </Link>
          <Link to="/articles/yield-farming" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Shark Fin <span style={{ color: '#24DB9B', fontSize: '10px', background: 'rgba(36,219,155,0.1)', padding: '2px 4px', borderRadius: '4px' }}>HOT</span></h4>
              <p>Sản phẩm đầu tư lợi suất cao được bảo vệ vốn</p>
            </div>
          </Link>

          <h3 className="mega-title" style={{ marginTop: '24px' }}>Wealth</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Wealth</h4>
              <p>Khám phá giá trị tương lai và bắt đầu hành trình đầu tư thông minh</p>
            </div>
          </a>
        </div>

        <div>
          <h3 className="mega-title">Trung tâm KCS</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Quyền lợi KCS</h4>
              <p>Nắm giữ và stake KCS để nhận chiết khấu phí, phần thưởng tăng cường</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>KCS Staking</h4>
              <p>Tham gia quản trị KCS trên chuỗi và nhận phần thưởng ổn định</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div className="mega-link-text">
              <h4>KCS Loyalty</h4>
              <p>Stake KCS và tận hưởng những lợi ích đặc quyền</p>
            </div>
          </a>

          {/* Article links */}
          <div className="mega-article-links" style={{ marginTop: '12px' }}>
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/staking-la-gi" className="mega-article-link">💰 Staking: để tiền làm việc</Link>
            <Link to="/articles/yield-farming" className="mega-article-link">🌾 Yield Farming DeFi</Link>
          </div>
        </div>
        
        <div></div>
      </div>
    </div>
  );
}

export function InstitutionalMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-3">
        {/* Col 1: Promo */}
        <div className="trade-alpha-box">
          <h3>🏦 Giải Pháp<br/>Tổ Chức</h3>
          <p>Nền tảng giao dịch cấp tổ chức với thanh khoản sâu, bảo mật tuyệt đối và hỗ trợ chuyên nghiệp 24/7.</p>
          <Link to="/articles/to-chuc-crypto" className="mega-btn-white">Tìm hiểu thêm</Link>

          <div className="mega-article-links">
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/to-chuc-crypto" className="mega-article-link">
              🏦 Đầu tư crypto tổ chức 2026
            </Link>
            <Link to="/articles/otc-giao-dich-lon" className="mega-article-link">
              🤝 Giao dịch OTC khối lượng lớn
            </Link>
          </div>
        </div>

        {/* Col 2: Services */}
        <div>
          <h3 className="mega-title">Dịch vụ tổ chức</h3>
          <Link to="/articles/otc-giao-dich-lon" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Giao dịch OTC</h4>
              <p>Mua bán khối lượng lớn không slippage, giá tốt nhất thị trường</p>
            </div>
          </Link>
          <Link to="/articles/to-chuc-crypto" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <div className="mega-link-text">
              <h4>API Trading</h4>
              <p>REST & WebSocket API tốc độ cao cho thuật toán giao dịch chuyên nghiệp</p>
            </div>
          </Link>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Lưu ký tài sản</h4>
              <p>Custodian solution bảo mật tài sản cấp ngân hàng, bảo hiểm đầy đủ</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div className="mega-link-text">
              <h4>Báo cáo & Tuân thủ</h4>
              <p>Hỗ trợ báo cáo thuế, AML/KYC và tuân thủ pháp lý đa quốc gia</p>
            </div>
          </a>
        </div>

        {/* Col 3: Stats */}
        <div>
          <h3 className="mega-title">Tại sao chọn KuCoin?</h3>
          <div className="mega-inst-stats">
            <div className="mega-inst-stat">
              <div className="mis-value">$2T+</div>
              <div className="mis-label">Khối lượng giao dịch hàng tháng</div>
            </div>
            <div className="mega-inst-stat">
              <div className="mis-value">700+</div>
              <div className="mis-label">Đối tác tổ chức toàn cầu</div>
            </div>
            <div className="mega-inst-stat">
              <div className="mis-value">99.9%</div>
              <div className="mis-label">Uptime API đảm bảo</div>
            </div>
            <div className="mega-inst-stat">
              <div className="mis-value">24/7</div>
              <div className="mis-label">Hỗ trợ khách hàng VIP</div>
            </div>
          </div>
          <Link to="/articles/category/to-chuc" className="mega-view-all-link" style={{ marginTop: '16px' }}>
            Xem tất cả giải pháp →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MoreMenu() {
  return (
    <div className="k-mega-menu">
      <div className="mega-container mega-grid-4">
        <div>
          <h3 className="mega-title">Khuyến mãi</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="mega-link-text">
              <h4>Trung tâm Sự kiện</h4>
              <p>Phần thưởng lớn và sự kiện mới - chỉ độc quyền</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Trung tâm Phần thưởng</h4>
              <p>Thường xuyên kiểm tra để nhận phần thưởng</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Chương trình giới thiệu</h4>
              <p>Giới thiệu bạn bè để hưởng hoa hồng 20%</p>
            </div>
          </a>
        </div>

        <div>
          <h3 className="mega-title">Thông tin</h3>
          <Link to="/articles/hoc-ve-blockchain" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>KuCoin Tìm hiểu</h4>
              <p>Nơi tốt nhất để tìm hiểu về tiền điện tử và Web3</p>
            </div>
          </Link>
          <Link to="/articles/hoc-ve-blockchain" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Cơ sở kiến thức</h4>
              <p>Nhận các thông tin chuyên sâu rõ ràng</p>
            </div>
          </Link>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Thông báo</h4>
              <p>Các cập nhật quan trọng và tin tức chính thức</p>
            </div>
          </a>
        </div>

        <div>
          <h3 className="mega-title">Ứng dụng</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Trợ lý AI Kuj</h4>
              <p>Trợ lý thông minh cá nhân của bạn</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Cộng đồng</h4>
              <p>Chia sẻ, kết nối và thảo luận giao dịch</p>
            </div>
          </a>
          <Link to="/articles/bao-mat-tai-khoan" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Bảo mật</h4>
              <p>Giữ tài sản của bạn an toàn với công cụ bảo mật</p>
            </div>
          </Link>

          {/* Article links */}
          <div className="mega-article-links" style={{ marginTop: '8px' }}>
            <div className="mega-article-label">📚 Bài viết liên quan</div>
            <Link to="/articles/bao-mat-tai-khoan" className="mega-article-link">🔐 10 thói quen bảo mật tài khoản</Link>
            <Link to="/articles/hoc-ve-blockchain" className="mega-article-link">⛓️ Blockchain từ cơ bản đến nâng cao</Link>
          </div>
        </div>

        <div>
          <h3 className="mega-title">Khác</h3>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Hợp tác thương hiệu</h4>
              <p>Gặp gỡ Adam Scott và trải nghiệm Tomorrowland</p>
            </div>
          </a>
          <a href="#" className="mega-link-block">
            <div className="mega-link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <div className="mega-link-text">
              <h4>Tìm hiểu và kiếm tiền</h4>
              <p>Nhận phần thưởng khi bạn tìm hiểu về tiền điện tử</p>
            </div>
          </a>
          <Link to="/articles/category/xem-them" className="mega-view-all-link" style={{ marginTop: '16px' }}>
            Xem tất cả bài viết →
          </Link>
        </div>
      </div>
    </div>
  );
}
