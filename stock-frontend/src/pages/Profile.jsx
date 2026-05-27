import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCCCD, setShowCCCD] = useState(false);

  // Authenticate user
  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem('user');
      if (loggedInUser && loggedInUser !== 'undefined') {
        const parsed = JSON.parse(loggedInUser);
        setUser(parsed);
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.error('Lỗi parse user:', e);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch latest profile & balance
  const fetchProfile = async (silent = false) => {
    if (!user || !user.id) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${user.id}`);
      setProfileData(res.data);

      // Keep localStorage synchronized
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          email: res.data.Email,
          fullName: res.data.FullName,
          accountCode: res.data.AccountCode,
          balance: res.data.Balance
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Lỗi lấy thông tin profile:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchProfile();
      // Polling balance/profile every 4 seconds to catch administrative adjustments
      const interval = setInterval(() => {
        fetchProfile(true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const maskCCCD = (num) => {
    if (!num) return 'Chưa cung cấp';
    if (num.length <= 4) return num;
    return num.slice(0, 3) + '******' + num.slice(-3);
  };

  if (loading) {
    return (
      <div className="k-profile-loading">
        <div className="k-profile-spinner"></div>
        <p>Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  const data = profileData || {};

  return (
    <div className="k-profile-page">
      {/* Header bar */}
      <header className="k-profile-header">
        <div className="k-profile-header-container">
          <Link to="/" className="k-profile-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B"/>
              <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B"/>
              <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B"/>
            </svg>
            <span>KUCOIN</span>
          </Link>
          <Link to="/" className="k-profile-back-link">
            Quay lại sàn giao dịch ➔
          </Link>
        </div>
      </header>

      {/* Main Area */}
      <div className="k-profile-container">
        {/* Left navigation sidebar */}
        <aside className="k-profile-sidebar">
          <div className="k-profile-sidebar-user">
            <div className="k-profile-sidebar-avatar">
              {(data.FullName || data.Email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="k-profile-sidebar-meta">
              <h4>{data.FullName || 'NHÀ GIAO DỊCH KANET'}</h4>
              <p>{data.Email}</p>
            </div>
          </div>

          <nav className="k-profile-sidebar-nav">
            <div className="k-profile-nav-item active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Thông tin cá nhân</span>
            </div>

            <Link to="/support/deposit" className="k-profile-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>An toàn & Bảo mật</span>
            </Link>

            <Link to="/support/deposit" className="k-profile-nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Xác thực danh tính</span>
            </Link>

            <button onClick={handleLogout} className="k-profile-nav-item k-profile-logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* Right content page */}
        <main className="k-profile-content">
          <h2 className="k-profile-content-title">Tổng quan tài khoản</h2>

          <div className="k-profile-grid">
            {/* Asset Balance Card */}
            <div className="k-profile-card k-profile-assets-card">
              <div className="k-profile-card-header">
                <span className="card-label">Tài sản hiện có (USDT)</span>
                <button 
                  className={`k-profile-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                  onClick={() => fetchProfile(true)}
                  title="Làm mới tài sản"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </button>
              </div>
              <div className="k-profile-asset-val">
                {typeof data.Balance === 'number' ? data.Balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                <span className="unit">USDT</span>
              </div>
              <div className="k-profile-assets-footer">
                <Link to="/support/deposit" className="k-profile-action-btn">Nạp tiền</Link>
                <Link to="/support/deposit" className="k-profile-action-btn secondary">Rút tiền</Link>
              </div>
            </div>

            {/* Profile Information Card */}
            <div className="k-profile-card">
              <h3 className="k-profile-card-title">Thông tin cá nhân</h3>
              
              <div className="k-profile-info-list">
                <div className="k-profile-info-row">
                  <span className="info-label">Họ và tên</span>
                  <span className="info-value highlight">{data.FullName || 'CHƯA CẬP NHẬT'}</span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">Gmail tài khoản</span>
                  <span className="info-value">{data.Email}</span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">ID tài khoản (UID)</span>
                  <span className="info-value monospace">
                    {data.AccountCode || 'Chưa cấu hình'}
                    {data.AccountCode && (
                      <button 
                        className="k-profile-copy-btn" 
                        onClick={() => {
                          navigator.clipboard.writeText(data.AccountCode);
                          alert('Đã sao chép UID!');
                        }}
                        title="Sao chép UID"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    )}
                  </span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">Số điện thoại</span>
                  <span className="info-value">{data.PhoneNumber || 'Chưa cung cấp'}</span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">Khu vực cư trú</span>
                  <span className="info-value">{data.Country || 'Vietnam'}</span>
                </div>
              </div>
            </div>

            {/* Verification & KYC Card */}
            <div className="k-profile-card">
              <h3 className="k-profile-card-title">Chứng nhận & Xác thực (KYC)</h3>

              <div className="k-profile-info-list">
                <div className="k-profile-info-row">
                  <span className="info-label">Loại giấy tờ</span>
                  <span className="info-value">{data.IdCardType || 'Thẻ căn cước'}</span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">Số chứng minh / CCCD</span>
                  <span className="info-value monospace">
                    {showCCCD ? data.IdNumber : maskCCCD(data.IdNumber)}
                    {data.IdNumber && (
                      <button 
                        className="k-profile-eye-btn" 
                        onClick={() => setShowCCCD(!showCCCD)}
                        title={showCCCD ? "Ẩn số CCCD" : "Hiện số CCCD"}
                      >
                        {showCCCD ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    )}
                  </span>
                </div>

                <div className="k-profile-info-row">
                  <span className="info-label">Trạng thái tài khoản</span>
                  <span className="info-value">
                    <span className="k-profile-kyc-badge">
                      <span className="dot"></span>
                      Đã xác thực danh tính (KYC)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
