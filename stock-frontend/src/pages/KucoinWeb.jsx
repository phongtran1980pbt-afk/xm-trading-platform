import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import LanguageSelector from '../components/LanguageSelector';
import { BuyCryptoMenu, TradeMenu, DerivativesMenu, EarnMenu, MoreMenu, LaunchpadMenu, InstitutionalMenu } from './MegaMenus';
import './KucoinWeb.css';

function KucoinWeb() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem('user');
      if (loggedInUser && loggedInUser !== 'undefined') {
        let parsed = JSON.parse(loggedInUser);
        if (parsed && parsed.fullName) {
          const original = parsed.fullName;
          parsed.fullName = parsed.fullName
            .replace(/Quáº£n/g, 'Quản')
            .replace(/trá»‹/g, 'trị')
            .replace(/viÃªn/g, 'viên')
            .replace(/HÃ¡»‡/g, 'Hệ')
            .replace(/Há»‡/g, 'Hệ')
            .replace(/thá»‘ng/g, 'thống')
            .replace(/Tá»‘i/g, 'Tối')
            .replace(/TiÃªu/g, 'Tiêu')
            .replace(/chuáº©n/g, 'chuẩn');
          
          if (parsed.fullName !== original) {
            localStorage.setItem('user', JSON.stringify(parsed));
          }
        }
        setUser(parsed);
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

  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const prevLatestId = useRef(null);
  const toastTimerRef = useRef(null);
  
  // Fetch notifications
  useEffect(() => {
    let intervalId;
    function fetchNotifications() {
      if (user && user.id) {
        fetch(`${API_BASE_URL}/api/notifications/${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setNotifications(data);
              
              if (data.length > 0) {
                const latestId = data[0].Id;
                if (prevLatestId.current !== null && latestId !== prevLatestId.current) {
                  // Mới có thông báo mới!
                  setToastMsg(data[0].Message);
                  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                  toastTimerRef.current = setTimeout(() => {
                    setToastMsg(null);
                  }, 5000); // 5 seconds
                }
                prevLatestId.current = latestId;
              }
            }
          })
          .catch(console.error);
      }
    }
    
    if (user && user.id) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 5000);
    }
    return () => clearInterval(intervalId);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0 && user && user.id) {
      // Mark as read
      fetch(`${API_BASE_URL}/api/notifications/${user.id}/read`, { method: 'POST' })
        .then(() => {
          setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
        })
        .catch(console.error);
    }
  };

  const [profileData, setProfileData] = useState(null);

  // Poll for real-time profile (includes balance and KYC status)
  useEffect(() => {
    let intervalId;
    
    function fetchProfile() {
      if (user && user.id) {
        fetch(`${API_BASE_URL}/api/auth/profile/${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.Email) {
              setProfileData(data);
              if (typeof data.Balance === 'number') {
                setBalance(data.Balance);
              }
            }
          })
          .catch(console.error);
      }
    }

    if (user && user.id) {
      fetchProfile();
      intervalId = setInterval(fetchProfile, 4000);
    }
    
    return () => clearInterval(intervalId);
  }, [user]);

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
            <button className="k-hamburger-btn" onClick={() => setShowMobileMenu(!showMobileMenu)} aria-label="Menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>

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
                <LaunchpadMenu />
              </div>
              <div className="k-nav-item dropdown">
                <span>Kiếm tiền</span>
                <span className="k-nav-arrow">▼</span>
                <EarnMenu />
              </div>
              <div className="k-nav-item dropdown">
                <span>Tổ chức</span>
                <span className="k-nav-arrow">▼</span>
                <InstitutionalMenu />
              </div>
            </nav>
          </div>

          <div className="k-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="k-util-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="k-util-btn" title="Tìm kiếm">
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

              <div style={{ position: 'relative' }}>
                <button className="k-util-btn" title="Thông báo" onClick={handleOpenNotifications}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '0', right: '0', background: 'red', color: 'white', fontSize: '10px', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="k-notifications-dropdown" style={{ position: 'absolute', top: '40px', right: '-80px', width: '320px', background: '#1e2329', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 100, border: '1px solid #2b3139', padding: '10px 0' }}>
                    <div style={{ padding: '10px 20px', fontWeight: 'bold', borderBottom: '1px solid #2b3139', color: '#eaecef' }}>Thông báo</div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#848e9c', fontSize: '14px' }}>Không có thông báo nào</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.Id} style={{ padding: '15px 20px', borderBottom: '1px solid #2b3139', color: n.IsRead ? '#848e9c' : '#eaecef', background: n.IsRead ? 'transparent' : 'rgba(0, 255, 163, 0.05)', fontSize: '13px' }}>
                            <div style={{ marginBottom: '5px', lineHeight: '1.4' }}>{n.Message}</div>
                            <div style={{ fontSize: '11px', color: '#848e9c' }}>{new Date(n.CreatedAt.replace('Z', '')).toLocaleString('vi-VN')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button className="k-util-btn" title="Ngôn ngữ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </button>

              <button className="k-util-btn" title="Chế độ tối">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
            </div>

            <div className="k-header-divider" style={{ width: '1px', height: '14px', background: '#2b3139', margin: '0 4px' }}></div>
            
            {user ? (
              <div className="k-user-menu">
                {/* Avatar trigger (always visible) */}
                <div className="k-user-trigger">
                  <div className="k-user-avatar-wrap">
                    <div className="k-user-avatar-circle">
                      {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                {/* Dropdown (visible on hover) */}
                <div className="k-user-dropdown">
                  {/* Profile header */}
                  <div className="k-udrop-profile">
                    <div className="k-udrop-avatar">
                      {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="k-udrop-info">
                      <div className="k-udrop-title" style={{ textTransform: 'uppercase' }}>
                        {profileData?.FullName || 'Nhà giao dịch KANET'}
                      </div>
                      <div className="k-udrop-email">
                        {profileData?.Email || profileData?.PhoneNumber || user.email}
                      </div>
                      {user.accountCode && (
                        <div className="k-udrop-uid">
                          <span>UID: {user.accountCode}</span>
                          <button
                            className="k-udrop-copy-btn"
                            title="Copy UID"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(user.accountCode);
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="k-user-dropdown-divider" />

                  {/* Menu items */}
                  <div className="k-udrop-menu">
                    <Link to="/profile" className="k-udrop-menu-item">
                      <span className="k-udrop-menu-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <span>Thông tin cá nhân</span>
                      <svg className="k-udrop-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>

                    <Link to="/security" className="k-udrop-menu-item">
                      <span className="k-udrop-menu-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </span>
                      <span>An toàn</span>
                      <svg className="k-udrop-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>

                    <Link to="/kyc" className="k-udrop-menu-item">
                      <span className="k-udrop-menu-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, marginRight: '8px' }}>
                        <span>Xác thực</span>
                        {profileData && profileData.HasFrontPhoto === 1 && profileData.HasBackPhoto === 1 ? (
                          <span style={{ fontSize: '10px', color: '#00FFA3', background: 'rgba(0, 255, 163, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Đã xác thực</span>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#F6465D', background: 'rgba(246, 70, 93, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Chưa xác thực</span>
                        )}
                      </div>
                      <svg className="k-udrop-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>

                    <Link to="/history" className="k-udrop-menu-item">
                      <span className="k-udrop-menu-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      </span>
                      <span>Lịch sử giao dịch</span>
                      <svg className="k-udrop-menu-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </div>

                  <div className="k-user-dropdown-divider" />

                  {user.isAdmin && (
                    <Link to="/admin" className="k-user-dropdown-item k-user-dropdown-admin">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      Quản trị viên
                    </Link>
                  )}

                  <button onClick={handleLogout} className="k-user-dropdown-item k-user-dropdown-logout">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="k-login-link">Đăng nhập</Link>
                <Link to="/register" className="k-register-link">Đăng ký</Link>
              </>
            )}

            <div className="k-header-assets-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/support/deposit" className="k-deposit-btn" style={{ textDecoration: 'none' }}>↓ Thêm tiền</Link>
              <div className="k-dropdown-wrapper">
                <span>Tài sản ▾</span>
                <div className="k-assets-dropdown">
                  <div className="k-assets-header">
                    <span>Tổng quan</span>
                  </div>
                  <div className="k-assets-balance" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="k-currency" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '******'}
                    </span>
                    <svg onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBalance(!showBalance); }} style={{ cursor: 'pointer', marginTop: '2px' }} width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24">
                      {showBalance ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="k-assets-divider" />
                  <a href="#"><svg width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Tài khoản tài trợ</a>
                  <a href="#"><svg width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Tài khoản giao dịch</a>
                  <a href="#"><svg width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>Tài khoản Futures</a>
                  <a href="#"><svg width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>Tài khoản Ký quỹ</a>
                  <a href="#"><svg width="16" height="16" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Tài khoản tài chính</a>
                </div>
              </div>
              <div className="k-dropdown-wrapper">
                <span>Lệnh ▾</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div className="k-mobile-menu-drawer">
          <div className="k-mobile-menu-body">
            <div className="k-mobile-nav-item"><Link to="/" onClick={() => setShowMobileMenu(false)}>Trang chủ</Link></div>
            <div className="k-mobile-nav-item"><Link to="/markets/alpha" onClick={() => setShowMobileMenu(false)}>Thị trường</Link></div>
            <div className="k-mobile-nav-item"><Link to="/markets/alpha" onClick={() => setShowMobileMenu(false)}>Giao dịch</Link></div>
            <div className="k-mobile-nav-item"><Link to="/support/deposit" onClick={() => setShowMobileMenu(false)}>↓ Thêm tiền</Link></div>
            
            <div className="k-mobile-divider" />
            
            {user ? (
              <>
                <div className="k-mobile-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                  <div className="k-user-avatar">
                    {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{user.username || user.fullName || user.email}</div>
                    {user.accountCode && <div style={{ color: '#00FFA3', fontSize: '12px', marginTop: '2px' }}>UID: {user.accountCode}</div>}
                  </div>
                </div>
                {user.isAdmin && (
                  <div className="k-mobile-nav-item">
                    <Link to="/admin" onClick={() => setShowMobileMenu(false)} style={{ color: '#24DB9B' }}>Quản trị viên</Link>
                  </div>
                )}
                <div className="k-mobile-nav-item">
                  <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="k-mobile-logout-btn" style={{ background: 'none', border: 'none', color: '#ff6b7e', fontSize: '14px', fontWeight: 600, padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="k-mobile-auth-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <Link to="/login" className="k-mobile-login-btn" onClick={() => setShowMobileMenu(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#1e2329', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập</Link>
                <Link to="/register" className="k-mobile-register-btn" onClick={() => setShowMobileMenu(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#fff', color: '#000', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="k-hero">
        <div className="k-hero-container">
          <div className="k-hero-left">
            <div className="k-hero-badge">
              🏆 Sàn Giao Dịch Tiền Điện Tử Số 1
            </div>
            <h1 className="k-hero-title">
              Tìm ngọc ẩn Crypto<br />tại Kanet
            </h1>
            <p className="k-hero-subtitle">
              Khám phá sàn giao dịch hàng đầu thế giới để mua, bán và tích lũy tiền điện tử an toàn. Tiếp cận hơn 700+ tài sản kỹ thuật số sớm nhất.
            </p>

            {user ? (
              <div className="k-hero-logged-in" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '15px', color: '#eaecef', lineHeight: '1.6', background: 'rgba(36, 219, 155, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(36, 219, 155, 0.1)', maxWidth: '480px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>👋</span>
                    <span style={{ color: '#848e9c' }}>Chào mừng trở lại,</span>
                    <strong style={{ color: '#24DB9B', fontSize: '14px' }}>{user.username || user.fullName || user.email}</strong>
                  </div>
                  <span style={{ color: '#848e9c', fontSize: '13px' }}>Bắt đầu phân tích thị trường và thực hiện các giao dịch BO sinh lời ngay hôm nay.</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '480px' }}>
                  <Link to="/trade/BTC-USDT" className="k-hero-submit" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 200px', padding: '15px 30px', fontWeight: 'bold' }}>
                    Giao dịch ngay
                  </Link>
                  <Link to="/support/deposit" className="k-hero-submit" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '1 1 200px', padding: '15px 30px', background: '#1e2329', border: '1px solid #2b3139', color: '#eaecef', fontWeight: 'bold' }}>
                    Nạp tiền nhanh
                  </Link>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
              <div className="b-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Bảo mật và an toàn tối cao</h3>
              <p>Cung cấp Bằng chứng Dự trữ (Proof of Reserves) 1:1, mã hóa cấp quân sự và ví đa chữ ký để đảm bảo tài sản của bạn luôn được bảo vệ tuyệt đối.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h3>Hỗ trợ đa ngôn ngữ 24/7</h3>
              <p>Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng trợ giúp bạn bất cứ lúc nào, hỗ trợ ngôn ngữ Tiếng Việt và các giải pháp tức thì.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
              </div>
              <h3>Công cụ giao dịch đột phá</h3>
              <p>Dễ dàng tiếp cập Spot, Futures, Margin, Copy Trading, và các Bot giao dịch AI miễn phí để tối đa hóa chiến lược đầu tư của bạn.</p>
            </div>
            <div className="k-benefit-card">
              <div className="b-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
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
            <Link to="/trade/BTC-USDT" className="earn-cta">Bắt đầu kiếm tiền</Link>
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
              <Link to="/support/deposit">Trung tâm trợ giúp</Link>
              <Link to="/support/deposit">Gửi yêu cầu hỗ trợ</Link>
              <Link to="/support/deposit">Hỗ trợ kỹ thuật</Link>
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

      {/* ===== TOAST NOTIFICATION ===== */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(36, 219, 155, 0.95)',
          color: '#000',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default KucoinWeb;
