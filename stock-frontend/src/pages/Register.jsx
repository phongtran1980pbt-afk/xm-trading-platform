import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Login.css'; // Tận dụng CSS của trang Login cho layout split-screen

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
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
             email: email,
             password: password,
             fullName: 'Nhà giao dịch KUCOIN'
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
      <div className="k-login-right" style={{ overflowY: 'auto' }}>
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

        <div className="k-login-form-wrapper" style={{ padding: '20px 40px' }}>
          <div className="k-login-form-container" style={{ maxWidth: '420px' }}>
            
            {/* Promo Banner Adjusted for Dark Theme */}
            <div style={{ backgroundColor: '#1f242e', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', lineHeight: '1.4' }}>Nhận Thưởng 100%<br/>lên đến 100$</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>100<span style={{ fontSize: '16px' }}>%</span></div>
            </div>

            <h2 style={{ marginBottom: '8px' }}>Hãy đăng ký!</h2>
            <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '32px' }}>Bạn đã có tài khoản? <Link to="/login" style={{ color: '#24DB9B', textDecoration: 'none' }}>Đăng nhập</Link></p>

            <form onSubmit={handleSubmit}>
               {/* Country Dropdown */}
               <div className="k-input-group" style={{ position: 'relative' }}>
                 <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>Quốc gia cư trú</label>
                 <div 
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    style={{
                      width: '100%', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px', padding: '14px 16px', color: '#ffffff', fontSize: '14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                    }}
                 >
                    <span>{selectedCountry}</span>
                    <span style={{ fontSize: '10px' }}>▼</span>
                 </div>
                 {isCountryDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1f242e',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '4px',
                      maxHeight: '200px', overflowY: 'auto', zIndex: 100
                    }}>
                       {countries.sort().map((country, idx) => (
                          <div 
                             key={idx} 
                             onClick={() => {
                                setSelectedCountry(country);
                                setIsCountryDropdownOpen(false);
                             }}
                             style={{
                               padding: '12px 16px', fontSize: '14px', cursor: 'pointer',
                               backgroundColor: selectedCountry === country ? 'rgba(36,219,155,0.1)' : 'transparent',
                               color: selectedCountry === country ? '#24DB9B' : '#fff'
                             }}
                          >
                             {country}
                          </div>
                       ))}
                    </div>
                 )}
               </div>

               {/* Email */}
               <div className="k-input-group">
                 <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>Email</label>
                 <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderColor: isEmailError ? '#d32f2f' : '' }}
                 />
                 {isEmailError && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px' }}>Email phải có đuôi @gmail.com</div>}
                 {serverError && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px' }}>{serverError}</div>}
               </div>

               {/* Password */}
               <div className="k-input-group" style={{ position: 'relative' }}>
                 <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>Mật khẩu</label>
                 <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Mật khẩu" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        setIsPasswordFocused(false);
                        setIsPasswordTouched(true);
                      }}
                      style={{ borderColor: isPasswordError ? '#d32f2f' : '' }}
                    />
                    <span 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a0a0a0' }}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      )}
                    </span>
                 </div>

                 {isPasswordFocused && (
                   <div style={{
                     position: 'absolute', bottom: '100%', left: 0, width: '100%', backgroundColor: '#1f242e',
                     border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px',
                     marginBottom: '8px', zIndex: 100, fontSize: '12px', color: '#a0a0a0',
                     boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                   }}>
                      <div style={{ color: '#fff', fontWeight: '600', marginBottom: '8px' }}>Các yêu cầu về mật khẩu:</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                         <li style={{ color: pwReq1 ? '#24DB9B' : '#a0a0a0', marginBottom: '4px' }}>{pwReq1 ? '✓' : '×'} Sử dụng 10 - 15 ký tự</li>
                         <li style={{ color: pwReq2 ? '#24DB9B' : '#a0a0a0', marginBottom: '4px' }}>{pwReq2 ? '✓' : '×'} Sử dụng 1 hoặc nhiều số</li>
                         <li style={{ color: pwReq3 ? '#24DB9B' : '#a0a0a0', marginBottom: '4px' }}>{pwReq3 ? '✓' : '×'} Sử dụng chữ thường</li>
                         <li style={{ color: pwReq4 ? '#24DB9B' : '#a0a0a0', marginBottom: '4px' }}>{pwReq4 ? '✓' : '×'} Sử dụng chữ hoa</li>
                         <li style={{ color: pwReq5 ? '#24DB9B' : '#a0a0a0' }}>{pwReq5 ? '✓' : '×'} Ký tự đặc biệt (#[]()@$&*!?:;.-_=+^~,&lt;&gt;)</li>
                      </ul>
                   </div>
                 )}
               </div>

               <p style={{ fontSize: '13px', color: '#a0a0a0', marginBottom: '24px' }}>Bạn có Mã đối tác? <a href="#" style={{ color: '#24DB9B', textDecoration: 'none' }}>Nhập vào đây</a></p>

               <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(e.target.checked)}
                    style={{ marginTop: '4px', accentColor: '#24DB9B' }}
                  />
                  <span style={{ fontSize: '12px', color: (!isTermsChecked && isPasswordTouched) ? '#d32f2f' : '#a0a0a0', lineHeight: '1.5' }}>
                    Tôi đồng ý nhận các email marketing và cho phép dữ liệu của mình được sử dụng để tối ưu hóa và cá nhân hóa vì mục đích tiếp thị và quảng cáo.
                  </span>
               </label>

               {(!isFormValid && isPasswordTouched) && (
                 <div style={{ color: '#d32f2f', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
                    Vui lòng hoàn thành tất cả yêu cầu (Email, Mật khẩu, Đồng ý điều khoản) để tiếp tục.
                 </div>
               )}

               <button 
                 type="submit" 
                 className="k-btn-primary" 
                 disabled={!isFormValid || isLoading}
                 style={{
                   opacity: isFormValid ? 1 : 0.5,
                   cursor: isFormValid ? 'pointer' : 'not-allowed',
                   marginBottom: '16px'
                 }}
               >
                 {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
               </button>

               <div style={{ fontSize: '11px', color: '#7e8a9c', textAlign: 'center', lineHeight: '1.5' }}>
                 Cùng với việc đăng ký, tôi tuyên bố rằng tôi đã đọc kỹ, hiểu và chấp nhận toàn bộ nội dung của <a href="#" style={{ color: '#a0a0a0' }}>Các văn bản pháp lý</a> và <a href="#" style={{ color: '#a0a0a0' }}>Chính sách bảo mật</a>.
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
