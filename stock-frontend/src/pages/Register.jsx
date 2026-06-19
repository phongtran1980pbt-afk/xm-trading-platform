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
  const [step, setStep] = React.useState(1); // 1: Info, 2: KYC/Verification
  const [regType, setRegType] = React.useState('email'); // 'email' | 'phone'
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

  // KYC & Personal Info States (Step 2)
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [idCardType, setIdCardType] = React.useState("Thẻ căn cước");
  const [idNumber, setIdNumber] = React.useState("");
  const [idFrontPhoto, setIdFrontPhoto] = React.useState("");
  const [idBackPhoto, setIdBackPhoto] = React.useState("");

  const frontInputRef = React.useRef(null);
  const backInputRef = React.useRef(null);

  // ── Nén ảnh trước khi gửi lên server (tránh vượt quá giới hạn 4.5MB của Vercel proxy) ──
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const MAX_SIZE = 800; // max 800px width/height
      const QUALITY = 0.65; // JPEG quality 65%
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height / width) * MAX_SIZE);
              width = MAX_SIZE;
            } else {
              width = Math.round((width / height) * MAX_SIZE);
              height = MAX_SIZE;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e, side) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        if (side === 'front') {
          setIdFrontPhoto(compressed);
        } else {
          setIdBackPhoto(compressed);
        }
      } catch {
        // Fallback: đọc file gốc nếu nén thất bại
        const reader = new FileReader();
        reader.onloadend = () => {
          if (side === 'front') {
            setIdFrontPhoto(reader.result);
          } else {
            setIdBackPhoto(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const isEmailValid = regType === 'email'
    ? (email.length > 10 && email.toLowerCase().endsWith('@gmail.com'))
    : (email.length >= 10 && email.length <= 11 && /^0\d+$/.test(email));
  const isEmailError = email.length > 0 && !isEmailValid;

  
  const pwReq1 = password.length >= 10 && password.length <= 15;
  const pwReq2 = /\d/.test(password);
  const pwReq3 = /[a-z]/.test(password);
  const pwReq4 = /[A-Z]/.test(password);
  const pwReq5 = /[#\[\]()@$&*!?:;.\-_=+^~,<>\\]/.test(password);

  const isPasswordValid = pwReq1 && pwReq2 && pwReq3 && pwReq4 && pwReq5;
  const isPasswordError = isPasswordTouched && password.length > 0 && !isPasswordValid;
  const isFormValid = isEmailValid && isPasswordValid && isTermsChecked;

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setServerError('');
    try {
      const checkRes = await axios.post(`${API_BASE_URL}/api/auth/check-user`, { email });
      if (checkRes.status === 200) {
        setServerError(regType === 'email'
          ? 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.'
          : 'Số điện thoại này đã được đăng ký. Vui lòng dùng số khác hoặc đăng nhập.'
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // 404 = user chưa tồn tại → tiếp tục bình thường
      if (err.response && err.response.status !== 404) {
        setServerError(err.response.data?.message || 'Có lỗi xảy ra khi kiểm tra tài khoản!');
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(false);
    if (regType === 'phone') setPhoneNumber(email);
    setStep(2);
  };

  const handleIdNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 12) setIdNumber(val);
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!fullName.trim()) {
      setServerError('⚠️ Vui lòng nhập họ và tên đầy đủ của bạn!');
      return;
    }
    if (!selectedCountry.trim()) {
      setServerError('⚠️ Vui lòng nhập khu vực cư trú!');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      setServerError('⚠️ Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 chữ số)!');
      return;
    }
    if (idNumber.length !== 12) {
      setServerError('⚠️ Số CCCD/hộ chiếu phải nhập đúng 12 chữ số!');
      return;
    }
    if (!idFrontPhoto) {
      setServerError('⚠️ Vui lòng tải lên ảnh mặt trước CCCD/hộ chiếu!');
      return;
    }
    if (!idBackPhoto) {
      setServerError('⚠️ Vui lòng tải lên ảnh mặt sau CCCD/hộ chiếu!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
        fullName: fullName.toUpperCase(),
        country: selectedCountry,
        idCardType,
        idNumber,
        idFrontPhoto,
        idBackPhoto,
        phoneNumber
      }, { timeout: 30000 });

      if (response.status === 201) {
        setStep(3); // Hiển thị màn hình thành công
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const msg = error.response?.data?.message;
      const code = error.response?.status;

      if (error.code === 'ECONNABORTED') {
        setServerError('❌ Hết thời gian chờ (30s). Vui lòng thử lại!');
      } else if (!error.response) {
        setServerError('❌ Không thể kết nối tới máy chủ. Kiểm tra lại internet!');
      } else if (code === 400 && msg && (msg.includes('đã') || msg.includes('tồn tại') || msg.includes('đăng ký'))) {
        setServerError('❌ ' + msg + ' Sẽ tự động quay lại bước 1...');
        setTimeout(() => setStep(1), 3000);
      } else {
        setServerError('❌ ' + (msg || 'Đăng ký thất bại. Vui lòng thử lại!'));
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="k-login-wrapper">
      {/* Invisible file inputs for KYC uploads */}
      <input
        type="file"
        ref={frontInputRef}
        onChange={(e) => handlePhotoUpload(e, 'front')}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={backInputRef}
        onChange={(e) => handlePhotoUpload(e, 'back')}
        accept="image/*"
        style={{ display: 'none' }}
      />

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

            {step === 1 ? (
              <>
                <h2 style={{ marginBottom: '8px' }}>Hãy đăng ký!</h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '20px' }}>
                  Bạn đã có tài khoản? <Link to="/login" style={{ color: '#24DB9B', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>

                {/* Tab selector for Email / Phone */}
                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px', paddingBottom: '8px' }}>
                  <div 
                    onClick={() => { setRegType('email'); setEmail(''); setServerError(''); }}
                    style={{ 
                      color: regType === 'email' ? '#24DB9B' : '#848e9c', 
                      fontWeight: 600, 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      borderBottom: regType === 'email' ? '2px solid #24DB9B' : 'none',
                      paddingBottom: '8px',
                      marginBottom: '-10px'
                    }}
                  >
                    Email
                  </div>
                  <div 
                    onClick={() => { setRegType('phone'); setEmail(''); setServerError(''); }}
                    style={{ 
                      color: regType === 'phone' ? '#24DB9B' : '#848e9c', 
                      fontWeight: 600, 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      borderBottom: regType === 'phone' ? '2px solid #24DB9B' : 'none',
                      paddingBottom: '8px',
                      marginBottom: '-10px'
                    }}
                  >
                    Số điện thoại
                  </div>
                </div>

                <form onSubmit={handleNextStep}>
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

                   {/* Email or Phone Input */}
                   <div className="k-input-group">
                     <label style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>
                       {regType === 'email' ? 'Email' : 'Số điện thoại'}
                     </label>
                     <input 
                        type={regType === 'email' ? 'email' : 'tel'} 
                        placeholder={regType === 'email' ? 'Email' : 'Số điện thoại'} 
                        value={email}
                        onChange={(e) => {
                          if (regType === 'phone') {
                            setEmail(e.target.value.replace(/\D/g, ''));
                          } else {
                            setEmail(e.target.value);
                          }
                        }}
                        style={{ borderColor: isEmailError ? '#d32f2f' : '' }}
                     />
                     {isEmailError && (
                       <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '6px' }}>
                         {regType === 'email' ? 'Email phải có đuôi @gmail.com' : 'Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và có 10-11 chữ số)'}
                       </div>
                     )}
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
                        Vui lòng hoàn thành tất cả yêu cầu ({regType === 'email' ? 'Email' : 'Số điện thoại'}, Mật khẩu, Đồng ý điều khoản) để tiếp tục.
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
              </>
            ) : step === 3 ? (
              // Step 3: Đăng ký thành công!
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #24DB9B, #1aaf7a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', boxShadow: '0 0 40px rgba(36,219,155,0.4)'
                }}>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 style={{ color: '#24DB9B', marginBottom: '12px', fontSize: '22px' }}>Đăng ký thành công!</h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '8px' }}>Tài khoản của bạn đã được tạo và xác thực KYC.</p>
                <p style={{ color: '#848e9c', fontSize: '13px' }}>Đang chuyển hướng đến trang đăng nhập...</p>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%', background: '#24DB9B',
                      animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`
                    }}/>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    marginTop: '28px', padding: '12px 32px', borderRadius: '8px',
                    background: '#24DB9B', color: '#0d1117', fontWeight: '700',
                    border: 'none', cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <div className="k-kyc-form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Xác thực tài khoản</h3>
                  <button 
                    onClick={() => setStep(1)} 
                    style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '12px', cursor: 'pointer', padding: '4px' }}
                  >
                    ← Quay lại
                  </button>
                </div>

                <form onSubmit={handleFinalRegister}>
                  {/* Họ tên input (forced to uppercase) */}
                  <div className="k-input-group" style={{ marginBottom: '16px' }}>
                    <label className="k-kyc-label">Họ và tên (Viết hoa toàn bộ)</label>
                    <input 
                      type="text" 
                      placeholder="VUI LÒNG NHẬP HỌ TÊN VIẾT HOA"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  {/* Selected region display (Editable) */}
                  <div className="k-input-group" style={{ marginBottom: '16px' }}>
                    <span className="k-kyc-label">Khu vực cư trú</span>
                    <input 
                      type="text"
                      placeholder="Nhập khu vực cư trú của bạn"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      required
                    />
                  </div>

                  {/* Phone number input */}
                  <div className="k-input-group" style={{ marginBottom: '16px' }}>
                    <label className="k-kyc-label">Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="Vui lòng nhập số điện thoại của bạn"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  {/* ID Card Type select */}
                  <div className="k-input-group" style={{ marginBottom: '16px' }}>
                    <label className="k-kyc-label">Xác định loại</label>
                    <select 
                      className="k-kyc-select"
                      value={idCardType}
                      onChange={(e) => setIdCardType(e.target.value)}
                    >
                      <option value="Thẻ căn cước">Thẻ căn cước</option>
                      <option value="Hộ chiếu">Hộ chiếu</option>
                      <option value="Bằng lái xe">Bằng lái xe</option>
                    </select>
                  </div>

                  {/* ID Card Number Input (strict 12 digits for CCCD) */}
                  <div className="k-input-group" style={{ marginBottom: '20px' }}>
                    <label className="k-kyc-label">Số chứng chỉ/hộ chiếu (đúng 12 số cho CCCD)</label>
                    <div className="k-kyc-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Vui lòng nhập số ID/hộ chiếu của bạn (12 số)"
                        value={idNumber}
                        onChange={handleIdNumberChange}
                        style={{ paddingRight: '48px' }}
                        required
                      />
                      {idNumber && (
                        <button 
                          type="button" 
                          className="k-kyc-input-clear"
                          onClick={() => setIdNumber('')}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Photos */}
                  <div className="k-kyc-label">Ảnh chứng nhận/Tải lên hộ chiếu</div>
                  <div className="k-kyc-upload-container">
                    
                    {/* Front side upload box */}
                    <div className="k-kyc-upload-item">
                      <div 
                        className="k-kyc-upload-box"
                        onClick={() => frontInputRef.current.click()}
                      >
                        {idFrontPhoto ? (
                          <div className="k-kyc-preview-overlay">
                            <img src={idFrontPhoto} className="k-kyc-preview-img" alt="Front ID Preview" />
                            <button 
                              type="button" 
                              className="k-kyc-preview-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIdFrontPhoto('');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                        )}
                      </div>
                      <span className="k-kyc-upload-subtext">Mặt trận thông tin xác thực</span>
                    </div>

                    {/* Back side upload box */}
                    <div className="k-kyc-upload-item">
                      <div 
                        className="k-kyc-upload-box"
                        onClick={() => backInputRef.current.click()}
                      >
                        {idBackPhoto ? (
                          <div className="k-kyc-preview-overlay">
                            <img src={idBackPhoto} className="k-kyc-preview-img" alt="Back ID Preview" />
                            <button 
                              type="button" 
                              className="k-kyc-preview-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIdBackPhoto('');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                        )}
                      </div>
                      <span className="k-kyc-upload-subtext">Mặt trái của chứng chỉ</span>
                    </div>

                  </div>

                  {/* Examples Section */}
                  <div className="k-kyc-examples">
                    <div className="k-kyc-examples-title">Ví dụ chụp</div>
                    <div className="k-kyc-examples-container">
                      
                      {/* Front example card */}
                      <div className="k-kyc-example-card">
                        <div style={{ width: '100%', height: '100%', background: '#f5f7fa', borderRadius: '4px', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px', color: '#000' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ width: '22px', height: '26px', background: '#0088ff', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ height: '3px', width: '100%', background: '#ffaa66', borderRadius: '1px' }}></div>
                              <div style={{ height: '3px', width: '80%', background: '#ffaa66', borderRadius: '1px' }}></div>
                              <div style={{ height: '3px', width: '90%', background: '#ffaa66', borderRadius: '1px' }}></div>
                            </div>
                          </div>
                          <div style={{ height: '3px', width: '100%', background: '#ffaa66', borderRadius: '1px' }}></div>
                        </div>
                      </div>

                      {/* Back example card */}
                      <div className="k-kyc-example-card">
                        <div style={{ width: '100%', height: '100%', background: '#f5f7fa', borderRadius: '4px', border: '1px solid #e1e4e8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px', color: '#000', position: 'relative' }}>
                          <div style={{ height: '10px', width: '100%', background: '#7e6c5c', borderRadius: '1px', marginTop: '4px' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2.5px solid #a68b75', display: 'flex', alignItems: 'center', justifyContents: 'center' }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '40px' }}>
                              <div style={{ height: '2px', width: '100%', background: '#ffaa66', borderRadius: '1px' }}></div>
                              <div style={{ height: '2px', width: '70%', background: '#ffaa66', borderRadius: '1px' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {serverError && (
                    <div style={{
                      color: serverError.startsWith('⚠️') ? '#f6a623' : '#ff4d4d',
                      fontSize: '13px', marginBottom: '16px',
                      background: 'rgba(255,77,77,0.08)',
                      border: '1px solid rgba(255,77,77,0.25)',
                      borderRadius: '8px', padding: '10px 14px'
                    }}>{serverError}</div>
                  )}

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="k-kyc-btn-submit"
                    disabled={isLoading}
                    style={{
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký xác thực'}
                  </button>

                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
