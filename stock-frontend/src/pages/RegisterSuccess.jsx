import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';

function RegisterSuccess() {
  return (
    <div className="auth-page success-page">
      <header className="auth-header">
         <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
           <span className="logo-x">X</span><span className="logo-m">M</span>
         </Link>
         <LanguageSelector />
      </header>

      <main className="success-main">
        <div className="success-content">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="100" height="100" fill="none" stroke="#00b050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 style={{ fontSize: '42px', marginTop: '20px' }}>Đăng ký thành công!</h1>
        </div>
      </main>

      <footer className="auth-footer" style={{ marginTop: 'auto' }}>
         <div className="auth-risk">
            Cảnh báo Rủi ro: Có rủi ro vốn. Các sản phẩm có đòn bẩy có thể không phù hợp với tất cả mọi người. Hãy đọc kỹ <a href="#">Thông báo Rủi ro</a> của chúng tôi.
         </div>
      </footer>
    </div>
  );
}

export default RegisterSuccess;
