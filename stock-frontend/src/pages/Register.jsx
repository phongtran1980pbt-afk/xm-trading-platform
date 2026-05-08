import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LanguageSelector from '../components/LanguageSelector';

const countries = [
  "Afghanistan", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda",
  "Armenia", "Aruba", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Belarus", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "British Indian Ocean", "British Virgin Islands", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
  "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros",
  "Congo, Democratic Republic of", "Congo, Republic of the", "Cook Islands",
  "Costa Rica", "Croatia", "Curacao", "Czech Republic", "Denmark", "Djibouti",
  "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
  "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
  "Greenland", "Grenada", "Guadeloupe", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hong Kong SAR", "Hungary", "Iceland", "India",
  "Indonesia", "Iraq", "Ireland", "Italy", "Ivory Coast", "Jamaica", "Jordan", "Vietnam"
];

function Register() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = React.useState("Vietnam");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = React.useState(false);
  const [isTermsChecked, setIsTermsChecked] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState('');

  const isEmailValid = email.length > 10 && email.toLowerCase().endsWith('@gmail.com');
  const isEmailError = email.length > 0 && !isEmailValid;
  
  const pwReq1 = password.length >= 10 && password.length <= 15;
  const pwReq2 = /\d/.test(password);
  const pwReq3 = /[a-z]/.test(password);
  const pwReq4 = /[A-Z]/.test(password);
  const pwReq5 = /[#\[\]()@$&*!?:;.\-_=+^~,<>\\]/.test(password);

  const isPasswordValid = pwReq1 && pwReq2 && pwReq3 && pwReq4 && pwReq5;
  const isPasswordError = isPasswordTouched && password.length > 0 && !isPasswordValid;
  const isFormValid = isEmailValid && isPasswordValid && isTermsChecked;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid && !isLoading) {
       setIsLoading(true);
       setServerError('');
       try {
          // Gọi API backend để đăng ký và gửi mail
          const response = await axios.post('http://localhost:5001/api/auth/register', {
             email: email,
             password: password,
             fullName: 'Nhà giao dịch XM'
          });

          if (response.status === 201) {
             navigate('/login');
          }
       } catch (error) {
          console.error('Lỗi đăng ký:', error);
          const msg = error.response?.data?.message;
          if (msg && (msg.includes('đã tồn tại') || msg.includes('đã được đăng ký'))) {
             setServerError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
          } else {
             alert(msg || 'Không thể kết nối tới Server!');
          }
       } finally {
          setIsLoading(false);
       }
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
         <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
           <span className="logo-x">X</span><span className="logo-m">M</span>
         </Link>
         <LanguageSelector />
      </header>

      <main className="auth-main">
         <div className="auth-card">
            <div className="promo-banner">
               <div className="promo-text">Nhận Thưởng 100%<br/>lên đến 100$</div>
               <div className="promo-number">100<span className="percent">%</span></div>
            </div>

            <h1 className="auth-title">Hãy đăng ký!</h1>
            <p className="auth-subtitle">Bạn đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link></p>

            <form className="auth-form" onSubmit={handleSubmit}>
               <div className="form-group">
                 <label>Quốc gia cư trú</label>
                 <div className="custom-dropdown-container">
                    <div className="form-input custom-dropdown-trigger" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}>
                       <span>{selectedCountry}</span>
                       <span className="dropdown-arrow">▼</span>
                    </div>
                    {isCountryDropdownOpen && (
                       <div className="custom-dropdown-menu">
                          {countries.sort().map((country, idx) => (
                             <div 
                                key={idx} 
                                className={`custom-dropdown-item ${selectedCountry === country ? 'selected' : ''}`}
                                onClick={() => {
                                   setSelectedCountry(country);
                                   setIsCountryDropdownOpen(false);
                                }}
                             >
                                {country}
                                {selectedCountry === country && <span className="check-icon">✓</span>}
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
               </div>

               <div className="form-group">
                 <label>Email</label>
                 <input 
                    type="email" 
                    placeholder="Email" 
                    className={`form-input ${isEmailError ? 'input-error' : ''}`} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
                 {isEmailError && <span className="error-text">Email phải có đuôi @gmail.com</span>}
                 {serverError && <span className="error-text" style={{ color: '#d32f2f', fontWeight: 'bold' }}>{serverError}</span>}
               </div>

               <div className="form-group" style={{ position: 'relative' }}>
                 <label>Mật khẩu</label>
                 <div className="password-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Mật khẩu" 
                      className={`form-input ${isPasswordError ? 'input-error' : ''}`} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        setIsPasswordFocused(false);
                        setIsPasswordTouched(true);
                      }}
                    />
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      )}
                    </span>
                 </div>

                 {isPasswordFocused && (
                   <div className="password-requirements-tooltip">
                      <div className="req-header">Các yêu cầu về mật khẩu:</div>
                      <div className="req-subheader">Mật khẩu của bạn nên:</div>
                      <ul className="req-list">
                         <li className={pwReq1 ? 'valid' : 'invalid'}>
                           <span className="icon">{pwReq1 ? '✓' : '×'}</span> Sử dụng 10 - 15 ký tự
                         </li>
                         <li className={pwReq2 ? 'valid' : 'invalid'}>
                           <span className="icon">{pwReq2 ? '✓' : '×'}</span> Sử dụng 1 hoặc nhiều số
                         </li>
                         <li className={pwReq3 ? 'valid' : 'invalid'}>
                           <span className="icon">{pwReq3 ? '✓' : '×'}</span> Sử dụng 1 hoặc nhiều chữ thường kiểu ký tự tiếng Anh
                         </li>
                         <li className={pwReq4 ? 'valid' : 'invalid'}>
                           <span className="icon">{pwReq4 ? '✓' : '×'}</span> Sử dụng 1 hoặc nhiều chữ hoa kiểu ký tự tiếng Anh
                         </li>
                         <li className={pwReq5 ? 'valid' : 'invalid'}>
                           <span className="icon">{pwReq5 ? '✓' : '×'}</span> Sử dụng 1 hoặc nhiều ký tự đặc biệt (#[]()@$&*!?:;.-_=+^~,&lt;&gt;)
                         </li>
                      </ul>
                   </div>
                 )}
               </div>

               <p className="partner-link">Bạn có Mã đối tác? <a href="#">Nhập vào đây</a></p>

               <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(e.target.checked)}
                  />
                  <span className="checkmark-text">Tôi đồng ý nhận các email marketing và cho phép dữ liệu của mình được sử dụng để tối ưu hóa và cá nhân hóa vì mục đích tiếp thị và quảng cáo. Tôi có thể rút lại ý kiến đồng ý này bất cứ lúc nào.</span>
               </label>

               <button 
                 type="submit" 
                 className={`submit-btn ${isFormValid && !isLoading ? 'active' : ''}`} 
                 disabled={!isFormValid || isLoading}
               >
                 {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
               </button>

               <p className="auth-terms">Cùng với việc đăng ký, tôi tuyên bố rằng tôi đã đọc kỹ, hiểu và chấp nhận toàn bộ nội dung của <a href="#">Các văn bản pháp lý</a> và <a href="#">Chính sách bảo mật</a>. Tôi cũng hiểu mình sẽ nhận bản tin, tin tức công ty và cập nhật sản phẩm.</p>
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

export default Register;
