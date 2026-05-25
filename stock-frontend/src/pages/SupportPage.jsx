import { useState } from 'react';
import { Link } from 'react-router-dom';
import './SupportPage.css';

const DEPOSIT_FAQS = [
  {
    id: 'bank_delay',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>,
    title: 'Nạp tiền ngân hàng bị chậm',
    desc: 'Tôi đã chuyển khoản ngân hàng nhưng tài khoản chưa được cộng tiền.',
    message: 'Chào admin, tôi đã chuyển khoản ngân hàng nhưng tài khoản chưa được cộng số dư. Xin hỗ trợ kiểm tra giao dịch này giúp tôi!'
  },
  {
    id: 'crypto_network',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"/></svg>,
    title: 'Nạp Crypto sai mạng lưới / thiếu TAG',
    desc: 'Nạp sai địa chỉ mạng lưới, quên điền Memo/Tag của giao dịch.',
    message: 'Chào admin, tôi nạp tiền crypto nhưng bị sai mạng lưới hoặc quên điền Memo/Tag. Xin hỗ trợ tôi tìm lại tài sản với!'
  },
  {
    id: 'limits_fees',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    title: 'Hạn mức & Biểu phí nạp tiền',
    desc: 'Xem chi tiết hạn mức nạp tối thiểu/tối đa và các mức phí áp dụng.',
    message: 'Chào admin, tôi muốn tìm hiểu về hạn mức nạp tiền tối thiểu/tối đa và phí nạp tiền đối với các phương thức nạp là bao nhiêu?'
  },
  {
    id: 'failed_transaction',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    title: 'Giao dịch nạp tiền bị từ chối',
    desc: 'Hệ thống báo nạp tiền thất bại hoặc bị từ chối do lỗi kỹ thuật.',
    message: 'Chào admin, lệnh nạp tiền của tôi báo thất bại hoặc bị từ chối. Xin hãy kiểm tra trạng thái giao dịch giúp tôi!'
  },
  {
    id: 'supported_methods',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    title: 'Các phương thức nạp nhanh nhất',
    desc: 'Tìm hiểu các hình thức nạp khả dụng và tốc độ xử lý của từng kênh.',
    message: 'Chào admin, tôi nên chọn phương thức nạp tiền nào nhanh nhất và mất bao lâu để tiền được cộng vào ví của tôi?'
  },
  {
    id: 'other_issue',
    icon: <svg width="28" height="28" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    title: 'Sự cố nạp tiền khác',
    desc: 'Gặp các vấn đề phát sinh khác liên quan đến việc nạp/rút tiền.',
    message: 'Chào admin, tôi đang gặp một sự cố nạp tiền khác cần được hỗ trợ trực tiếp. Xin hãy kết nối với tôi!'
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = DEPOSIT_FAQS.filter(faq =>
    faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTriggerChat = (message) => {
    // Dispatch custom event to open ChatWidget and send the message
    window.dispatchEvent(new CustomEvent('open-chat', {
      detail: { message }
    }));
  };

  return (
    <div className="support-page">
      {/* Navigation Header */}
      <header className="support-header">
        <div className="support-header-container">
          <Link to="/" className="support-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B"/>
              <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B"/>
              <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B"/>
            </svg>
            <span className="support-logo-text">KUCOIN</span>
            <span className="support-badge">Trung Tâm Hỗ Trợ</span>
          </Link>
          <Link to="/" className="support-back-home">
            Quay lại sàn giao dịch ➔
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="support-hero">
        <div className="support-hero-content">
          <h1>Hỗ Trợ Nạp Tiền & Tài Sản</h1>
          <p>Tìm giải pháp nhanh chóng cho các sự cố nạp tiền hoặc kết nối trực tiếp với Đội ngũ hỗ trợ 24/7</p>
          
          <div className="support-search-wrap">
            <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm (ngân hàng, crypto, mạng lưới...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Grid of Suggestions */}
      <section className="support-main-content">
        <div className="support-container">
          <div className="section-title-wrap">
            <h2>Gợi ý giải quyết sự cố nạp tiền</h2>
            <p>Chọn một vấn đề dưới đây để kết nối và trò chuyện ngay với Hỗ trợ viên</p>
          </div>

          <div className="faq-grid">
            {filteredFaqs.map(faq => (
              <div 
                key={faq.id} 
                className="faq-card"
                onClick={() => handleTriggerChat(faq.message)}
              >
                <div className="faq-card-icon">{faq.icon}</div>
                <h3>{faq.title}</h3>
                <p>{faq.desc}</p>
                <div className="faq-card-action">
                  <span>Chat hỗ trợ ngay</span>
                  <span className="arrow">➔</span>
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="faq-empty-state">
                <p>Không tìm thấy kết quả phù hợp. Hãy nhắn tin trực tiếp với Hỗ trợ viên để được giải quyết nhanh nhất.</p>
                <button 
                  className="support-direct-chat-btn"
                  onClick={() => handleTriggerChat('Chào admin, tôi cần hỗ trợ trực tiếp về vấn đề nạp tiền của tôi.')}
                >
                  💬 Trò chuyện trực tiếp với Admin
                </button>
              </div>
            )}
          </div>

          {/* Quick Notice */}
          <div className="support-notice-card">
            <div className="notice-icon">⚠️</div>
            <div className="notice-text">
              <h4>Lưu ý bảo mật quan trọng</h4>
              <p>Nhân viên hỗ trợ của chúng tôi sẽ <strong>KHÔNG BAO GIỜ</strong> yêu cầu bạn cung cấp Mật khẩu, mã OTP hoặc chuyển khoản vào các tài khoản cá nhân lạ ngoài hệ thống. Mọi giao dịch nạp tiền cần được xác minh qua kênh Chat chính thức này.</p>
            </div>
          </div>

          {/* Direct Support Button */}
          <div className="support-footer-cta">
            <p>Không tìm thấy câu trả lời bạn cần?</p>
            <button 
              className="support-direct-chat-btn-lg"
              onClick={() => handleTriggerChat('Chào hỗ trợ viên, tôi có câu hỏi về nạp tiền cần tư vấn.')}
            >
              💬 Bắt đầu Chat trực tiếp (Phản hồi trong 1 phút)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
