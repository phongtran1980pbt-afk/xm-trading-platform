import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LanguageSelector from '../components/LanguageSelector';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Đăng nhập thành công!');
        navigate('/'); // Chuyển về trang chủ sau khi login
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert(error.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <header className="auth-header">
         <div className="header-left">
           {/* Logo ẩn ở trang login theo hình mẫu hoặc nhỏ gọn */}
         </div>
         <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="support-icon-circle">
               <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            </div>
            <LanguageSelector />
         </div>
      </header>

      <main className="auth-main login-main">
         <div className="auth-card login-card">
            <div className="login-logo-center">
               <span className="logo-x">X</span><span className="logo-m">M</span>
            </div>

            <h1 className="auth-title center-text">Đăng nhập</h1>
            <p className="auth-subtitle center-text">Bạn mới tham gia XM? <Link to="/register" className="auth-link">Mở tài khoản</Link></p>

            <form className="auth-form" onSubmit={handleSubmit}>
               <div className="form-group">
                 <input 
                    type="email" 
                    placeholder="Email" 
                    className="form-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                 />
               </div>

               <div className="form-group" style={{ position: 'relative' }}>
                 <div className="password-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Mật khẩu" 
                      className="form-input" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      )}
                    </span>
                 </div>
               </div>

               <p className="forgot-password-link"><a href="#">Quên mật khẩu?</a></p>

               <button 
                 type="submit" 
                 className={`submit-btn active`} 
                 disabled={isLoading}
               >
                 {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
               </button>
            </form>
         </div>
      </main>

      <footer className="auth-footer">
         <div className="auth-risk">
            Cảnh báo Rủi ro: Có rủi ro vốn. Các sản phẩm có đòn bẩy có thể không phù hợp với tất cả mọi người. Hãy đọc kỹ <a href="#">Thông báo Rủi ro</a> của chúng tôi.
         </div>
      </footer>
    </div>
  );
}

export default Login;
