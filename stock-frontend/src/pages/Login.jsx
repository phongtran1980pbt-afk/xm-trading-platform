import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Mới tạo file CSS riêng cho Login

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [step, setStep] = React.useState(1);
  const [password, setPassword] = React.useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    if (identifier) setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email: identifier,
        password: password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/'); // Redirect to homepage
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="k-login-wrapper">
      {/* Left Panel */}
      <div className="k-login-left">
        <Link to="/" className="k-login-brand">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
            <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
            <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
          </svg>
          <span>KUCOIN</span>
        </Link>
        
        <div className="k-login-left-content">
          <h1>Tiên tin tưởng. Hậu giao dịch.</h1>
          <p>Cứ 4 người nắm giữ tiền điện tử trên thế giới thì 1 người đang sử dụng KuCoin</p>
        </div>

        <div className="k-shield-container">
          <div className="k-shield">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-1 14H8.5v-8H11v8zm3.5 0h-2.5v-8h2.5v8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="k-login-right">
        <div className="k-login-header">
          <button className="k-login-util-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          
          <button className="k-login-util-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>

          <button className="k-login-util-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>

        <div className="k-login-form-wrapper">
          <div className="k-login-form-container">
            <h2>Đăng nhập</h2>
            
            <div className="k-login-tabs">
              <div className="k-login-tab">Email/Số điện thoại</div>
            </div>

            <form onSubmit={step === 1 ? handleNextStep : handleLogin}>
              {step === 1 ? (
                <div className="k-input-group">
                  <input 
                    type="text" 
                    placeholder="Email/Số điện thoại (không có mã quốc gia)" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="k-input-group">
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="k-btn-primary" disabled={isLoading}>
                {isLoading ? 'Đang tải...' : (step === 1 ? 'Tiếp theo' : 'Đăng nhập')}
              </button>
            </form>

            <div className="k-login-divider">
              <span>Hoặc tiếp tục với</span>
            </div>

            <button className="k-btn-passkey">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Đăng nhập bằng khóa mật khẩu
            </button>

            <div className="k-login-footer">
              Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
