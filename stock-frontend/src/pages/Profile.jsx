import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCCCD, setShowCCCD] = useState(false);
  
  // Tab control & Form States for KYC
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/kyc' ? 'kyc' : (location.pathname === '/security' ? 'security' : (location.pathname === '/history' ? 'history' : 'info'))
  ); // 'info' | 'kyc' | 'security' | 'history'
  const [fullNameVal, setFullNameVal] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [countryVal, setCountryVal] = useState('Vietnam');
  const [cardTypeVal, setCardTypeVal] = useState('Thẻ căn cước');
  const [idNumVal, setIdNumVal] = useState('');
  const [frontPhotoVal, setFrontPhotoVal] = useState('');
  const [backPhotoVal, setBackPhotoVal] = useState('');
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  // Security Tab States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const frontInputRef = React.useRef(null);
  const backInputRef = React.useRef(null);

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchTransactions = async () => {
    if (!user || !user.id) return;
    setLoadingTransactions(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${user.id}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Lỗi lấy lịch sử giao dịch:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && user && user.id) {
      fetchTransactions();
    }
  }, [activeTab, user]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'info') navigate('/profile');
    else if (tabName === 'security') navigate('/security');
    else if (tabName === 'kyc') navigate('/kyc');
    else if (tabName === 'history') navigate('/history');
  };

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

  // Sync active tab with route path
  useEffect(() => {
    if (location.pathname === '/kyc') {
      setActiveTab('kyc');
    } else if (location.pathname === '/security') {
      setActiveTab('security');
    } else if (location.pathname === '/history') {
      setActiveTab('history');
    } else if (location.pathname === '/profile') {
      setActiveTab('info');
    }
  }, [location.pathname]);


  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) return alert('Vui lòng nhập mật khẩu cũ!');
    if (newPassword.length < 6) return alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
    if (newPassword !== confirmPassword) return alert('Xác nhận mật khẩu mới không khớp!');

    setIsChangingPassword(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/profile/${user.id}/change-password`, {
        oldPassword,
        newPassword
      });

      if (res.data.success) {
        alert('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Fetch latest profile & balance
  const fetchProfile = async (silent = false) => {
    if (!user || !user.id) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${user.id}`);
      setProfileData(res.data);

      // Initialize form values for KYC if they are empty
      setFullNameVal(prev => prev || res.data.FullName || '');
      setPhoneVal(prev => prev || res.data.PhoneNumber || '');
      setCountryVal(prev => prev === 'Vietnam' ? (res.data.Country || 'Vietnam') : prev);
      setCardTypeVal(prev => prev === 'Thẻ căn cước' ? (res.data.IdCardType || 'Thẻ căn cước') : prev);
      setIdNumVal(prev => prev || res.data.IdNumber || '');

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      const pad = (n) => n.toString().padStart(2, '0');
      
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handlePhotoUploadLocal = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontPhotoVal(reader.result);
        } else {
          setBackPhotoVal(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!fullNameVal.trim()) return alert('Vui lòng nhập họ và tên!');
    if (!phoneVal.trim()) return alert('Vui lòng nhập số điện thoại!');
    if (!countryVal.trim()) return alert('Vui lòng nhập khu vực cư trú!');
    if (idNumVal.length !== 12) return alert('Số CCCD bắt buộc phải có đúng 12 chữ số!');
    if (!frontPhotoVal) return alert('Vui lòng tải lên ảnh mặt trước giấy tờ!');
    if (!backPhotoVal) return alert('Vui lòng tải lên ảnh mặt sau giấy tờ!');

    setIsLoadingKyc(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/profile/${user.id}/update-kyc`, {
        fullName: fullNameVal,
        phoneNumber: phoneVal,
        country: countryVal,
        idCardType: cardTypeVal,
        idNumber: idNumVal,
        idFrontPhoto: frontPhotoVal,
        idBackPhoto: backPhotoVal
      });

      if (res.data.success) {
        alert('Tải tài liệu xác thực KYC thành công! Vui lòng chờ phê duyệt.');
        await fetchProfile();
        handleTabChange('info');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật KYC!');
    } finally {
      setIsLoadingKyc(false);
    }
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
      {/* Invisible file inputs for KYC uploads */}
      <input
        type="file"
        ref={frontInputRef}
        onChange={(e) => handlePhotoUploadLocal(e, 'front')}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={(e) => handlePhotoUploadLocal(e, 'back')}
        accept="image/*"
        style={{ display: 'none' }}
      />

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
            <div className={`k-profile-nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => handleTabChange('info')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Thông tin cá nhân</span>
            </div>

            <div className={`k-profile-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => handleTabChange('security')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>An toàn & Bảo mật</span>
            </div>

            <div className={`k-profile-nav-item ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => handleTabChange('kyc')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Xác thực danh tính</span>
            </div>

            <div className={`k-profile-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleTabChange('history')} style={{ cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>Lịch sử giao dịch</span>
            </div>

            <button onClick={handleLogout} className="k-profile-nav-item k-profile-logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* Right content page */}
        {activeTab === 'info' ? (
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
                      {data.HasFrontPhoto === 1 && data.HasBackPhoto === 1 ? (
                        <span className="k-profile-kyc-badge verified" style={{ color: '#00FFA3', backgroundColor: 'rgba(0, 255, 163, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                          <span className="dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00FFA3' }}></span>
                          Đã xác thực danh tính (KYC)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                          <span className="k-profile-kyc-badge unverified" style={{ color: '#F6465D', backgroundColor: 'rgba(246, 70, 93, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                            <span className="dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F6465D' }}></span>
                            Chưa xác thực
                          </span>
                           <button 
                            onClick={() => handleTabChange('kyc')}
                            style={{
                              padding: '4px 12px',
                              background: '#24DB9B',
                              color: '#000',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '11px',
                              marginTop: '4px'
                            }}
                          >
                            Tải ảnh xác thực ngay
                          </button>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : activeTab === 'kyc' ? (
          <main className="k-profile-content">
            <h2 className="k-profile-content-title">Xác thực danh tính (KYC)</h2>

            {data.HasFrontPhoto === 1 && data.HasBackPhoto === 1 ? (
              <div className="k-profile-card" style={{ maxWidth: '640px' }}>
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 255, 163, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                    border: '2px solid #00FFA3'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FFA3" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Tài khoản đã xác thực KYC</h3>
                  <p style={{ color: '#848e9c', fontSize: '13px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                    Thông tin định danh và hình ảnh chứng minh của bạn đã được lưu trữ và kiểm duyệt an toàn bởi bộ phận quản trị viên.
                  </p>

                  <div className="k-profile-info-list" style={{ textAlign: 'left', background: '#11141a', padding: '16px', borderRadius: '12px', border: '1px solid #1e2329' }}>
                    <div className="k-profile-info-row">
                      <span className="info-label">Họ và tên</span>
                      <span className="info-value name-value" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#fff' }}>{data.FullName}</span>
                    </div>
                    <div className="k-profile-info-row">
                      <span className="info-label">Loại giấy tờ</span>
                      <span className="info-value">{data.IdCardType}</span>
                    </div>
                    <div className="k-profile-info-row">
                      <span className="info-label">Số chứng minh / CCCD</span>
                      <span className="info-value monospace">{maskCCCD(data.IdNumber)}</span>
                    </div>
                    <div className="k-profile-info-row">
                      <span className="info-label">Trạng thái</span>
                      <span className="info-value" style={{ color: '#00FFA3', fontWeight: 'bold' }}>ĐÃ DUYỆT (VERIFIED)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="k-profile-card" style={{ maxWidth: '640px' }}>
                <h3 className="k-profile-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Gửi tài liệu xác thực danh tính</span>
                  <span style={{ fontSize: '11px', color: '#F6465D', background: 'rgba(246,70,93,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Chưa xác thực</span>
                </h3>
                <p style={{ color: '#848e9c', fontSize: '13px', margin: '-10px 0 20px 0', lineHeight: 1.5 }}>
                  Vui lòng cung cấp chính xác các thông tin định danh và tải lên hình ảnh chụp hai mặt giấy tờ tùy thân của bạn để tiến hành xác thực tài khoản.
                </p>

                <form onSubmit={handleKycSubmit}>
                  <div className="k-profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="k-input-group" style={{ margin: 0 }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Họ và tên (Viết hoa toàn bộ)</label>
                      <input 
                        type="text" 
                        placeholder="VUI LÒNG NHẬP HỌ TÊN VIẾT HOA"
                        value={fullNameVal}
                        onChange={(e) => setFullNameVal(e.target.value.toUpperCase())}
                        required
                        style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div className="k-input-group" style={{ margin: 0 }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Số điện thoại liên hệ</label>
                      <input 
                        type="tel" 
                        placeholder="Nhập số điện thoại của bạn"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ''))}
                        required
                        style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div className="k-input-group" style={{ margin: 0 }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Khu vực cư trú</label>
                      <input 
                        type="text" 
                        placeholder="Nhập quốc gia / khu vực"
                        value={countryVal}
                        onChange={(e) => setCountryVal(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div className="k-input-group" style={{ margin: 0 }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Loại giấy tờ định danh</label>
                      <select 
                        value={cardTypeVal}
                        onChange={(e) => setCardTypeVal(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      >
                        <option value="Thẻ căn cước">Thẻ căn cước</option>
                        <option value="Hộ chiếu">Hộ chiếu</option>
                        <option value="Bằng lái xe">Bằng lái xe</option>
                      </select>
                    </div>

                    <div className="k-input-group" style={{ margin: 0 }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Số CCCD / Hộ chiếu (12 số)</label>
                      <input 
                        type="text" 
                        placeholder="Nhập đúng 12 chữ số cho thẻ căn cước"
                        value={idNumVal}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 12) setIdNumVal(val);
                        }}
                        required
                        style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '8px', display: 'block' }}>Tải lên ảnh chụp 2 mặt giấy tờ định danh</label>
                      
                      <div className="k-kyc-upload-container" style={{ display: 'flex', gap: '16px' }}>
                        <div className="k-kyc-upload-item" style={{ flex: 1 }}>
                          <div 
                            className="k-kyc-upload-box"
                            onClick={() => frontInputRef.current.click()}
                            style={{ height: '120px', border: '1px dashed #2b3139', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e2329', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                          >
                            {frontPhotoVal ? (
                              <>
                                <img src={frontPhotoVal} alt="Front Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button type="button" onClick={(ev) => { ev.stopPropagation(); setFrontPhotoVal(''); }} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                              </>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#848e9c' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 6px auto', display: 'block' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <span style={{ fontSize: '11px' }}>Mặt trước</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="k-kyc-upload-item" style={{ flex: 1 }}>
                          <div 
                            className="k-kyc-upload-box"
                            onClick={() => backInputRef.current.click()}
                            style={{ height: '120px', border: '1px dashed #2b3139', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e2329', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                          >
                            {backPhotoVal ? (
                              <>
                                <img src={backPhotoVal} alt="Back Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button type="button" onClick={(ev) => { ev.stopPropagation(); setBackPhotoVal(''); }} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                              </>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#848e9c' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 6px auto', display: 'block' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                <span style={{ fontSize: '11px' }}>Mặt sau</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoadingKyc || !frontPhotoVal || !backPhotoVal || idNumVal.length !== 12}
                      style={{
                        padding: '12px',
                        background: '#24DB9B',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: (isLoadingKyc || !frontPhotoVal || !backPhotoVal || idNumVal.length !== 12) ? 'not-allowed' : 'pointer',
                        opacity: (isLoadingKyc || !frontPhotoVal || !backPhotoVal || idNumVal.length !== 12) ? 0.6 : 1,
                        fontSize: '14px',
                        marginTop: '10px',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {isLoadingKyc ? 'Đang gửi tài liệu...' : 'Gửi thông tin xác thực'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        ) : activeTab === 'security' ? (
          <main className="k-profile-content">
            <h2 className="k-profile-content-title">An toàn & Bảo mật</h2>

            <div className="k-profile-card" style={{ maxWidth: '600px' }}>
              <h3 className="k-profile-card-title">Thiết lập mật khẩu</h3>
              <p style={{ color: '#848e9c', fontSize: '13px', margin: '-10px 0 20px 0', lineHeight: 1.5 }}>
                Vui lòng cung cấp mật khẩu hiện tại trước khi tạo mật khẩu đăng nhập mới để đảm bảo tính an toàn.
              </p>
              
              <form onSubmit={handleChangePasswordSubmit}>
                <div className="k-profile-info-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="k-input-group" style={{ margin: 0 }}>
                    <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Mật khẩu cũ</label>
                    <input 
                      type="password" 
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>

                  <div className="k-input-group" style={{ margin: 0 }}>
                    <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>

                  <div className="k-input-group" style={{ margin: 0 }}>
                    <label className="k-kyc-label" style={{ fontSize: '12px', color: '#848e9c', marginBottom: '6px', display: 'block' }}>Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    style={{
                      padding: '12px',
                      background: '#24DB9B',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                      opacity: isChangingPassword ? 0.6 : 1,
                      fontSize: '14px',
                      marginTop: '10px',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        ) : activeTab === 'history' ? (
          <main className="k-profile-content">
            <h2 className="k-profile-content-title">Lịch sử giao dịch</h2>

            <div className="k-profile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="k-profile-card-title" style={{ margin: 0 }}>Giao dịch gần đây</h3>
                <button 
                  className={`k-profile-refresh-btn ${loadingTransactions ? 'spinning' : ''}`}
                  onClick={fetchTransactions}
                  title="Làm mới lịch sử"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </button>
              </div>

              {loadingTransactions ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#848e9c' }}>
                  <div className="k-profile-spinner" style={{ margin: '0 auto 12px auto' }}></div>
                  <p>Đang tải dữ liệu giao dịch...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#848e9c' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p style={{ fontSize: '14px' }}>Không có lịch sử giao dịch nào.</p>
                </div>
              ) : (
                <div className="k-tx-table-container" style={{ overflowX: 'auto' }}>
                  <table className="k-tx-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: 'bold' }}>Thời gian</th>
                        <th style={{ padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: 'bold' }}>Loại giao dịch</th>
                        <th style={{ padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: 'bold' }}>Số tiền (USDT)</th>
                        <th style={{ padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: 'bold' }}>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        let amountColor = '#ffffff';
                        let amountPrefix = '';
                        if (tx.type === 'Thắng cược' || tx.type === 'Nạp tiền') {
                          amountColor = '#24DB9B';
                          amountPrefix = '+ ';
                        } else if (tx.type === 'Thua cược' || tx.type === 'Rút tiền') {
                          amountColor = '#F6465D';
                          amountPrefix = '- ';
                        }

                        let badgeBg = 'rgba(255, 255, 255, 0.05)';
                        let badgeColor = '#ffffff';
                        
                        if (tx.type === 'Nạp tiền' || tx.type === 'Thắng cược') {
                          badgeBg = 'rgba(36, 219, 155, 0.1)';
                          badgeColor = '#24DB9B';
                        } else if (tx.type === 'Rút tiền' || tx.type === 'Thua cược') {
                          badgeBg = 'rgba(246, 70, 93, 0.1)';
                          badgeColor = '#F6465D';
                        } else if (tx.type === 'Hòa cược') {
                          badgeBg = 'rgba(132, 142, 156, 0.1)';
                          badgeColor = '#848e9c';
                        } else if (tx.type === 'Đang chờ') {
                          badgeBg = 'rgba(240, 185, 11, 0.1)';
                          badgeColor = '#F0B90B';
                        }

                        return (
                          <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '16px', fontSize: '13px', color: '#eaecef', whiteSpace: 'nowrap' }}>
                              {formatDate(tx.date)}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                display: 'inline-block', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                fontWeight: 'bold',
                                background: badgeBg,
                                color: badgeColor
                              }}>
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px', fontWeight: 'bold', color: amountColor, fontFamily: 'monospace' }}>
                              {amountPrefix}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '16px', fontSize: '13px', color: '#848e9c', minWidth: '200px' }}>
                              {tx.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
}
