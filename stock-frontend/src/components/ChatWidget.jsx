import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import {
  getSessionId, getMessages, sendMessage,
  markUserRead,
} from '../utils/chatStore';
import './ChatWidget.css';

const QUICK_REPLIES = [
  'Tôi muốn nạp tiền',
  'Hỗ trợ giao dịch',
  'Tôi không thể đăng nhập',
  'Hỏi về phí giao dịch',
];

function formatTime(ts) {
  const numTs = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (!numTs || isNaN(numTs)) return '';
  return new Date(numTs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unread, setUnread] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get dynamic session ID
  const getDynamicSessionId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) return `auth_user_${user.id}`;
    } catch (e) {}
    return getSessionId();
  };
  
  const [sessionId, setSessionId] = useState(getDynamicSessionId());

  // Update session ID if localStorage changes (e.g. login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getDynamicSessionId();
      if (current !== sessionId) {
        setSessionId(current);
        setMessages([]); // clear messages on user switch
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Poll for new messages every 2 seconds
  const handleSendRef = useRef(null);
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  useEffect(() => {
    const handleOpenChat = (e) => {
      setOpen(true);
      if (e.detail?.message && handleSendRef.current) {
        handleSendRef.current(e.detail.message);
      }
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    async function refresh() {
      const msgs = await getMessages(sessionId);
      setMessages(msgs);
      if (!open) {
        // Fetch sessions to count unreadUser for this specific session
        // (Since getMessages doesn't return unread count directly, we might need a better way, 
        // but for now we can just rely on marking read when open)
        // A simpler way: we just poll the sessions API, or skip it for now and only show badge if needed.
        // Let's just fetch all sessions (not ideal for perf, but okay for prototype)
        try {
          const res = await fetch(`${API_BASE_URL}/api/chat/sessions`);
          const data = await res.json();
          setUnread(data[sessionId]?.unreadUser || 0);
        } catch (e) {}
      }
    }
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [sessionId, open]);

  // Mark as read when chat is opened
  useEffect(() => {
    if (open) {
      markUserRead(sessionId);
      setUnread(0);
    }
  }, [open, sessionId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function handleSend(msg) {
    const content = (msg || text).trim();
    if (!content) return;
    setText('');
    // Get customer name from localStorage if logged in
    const userStr = localStorage.getItem('user');
    let username = 'Khách hàng';
    try { 
      const u = JSON.parse(userStr);
      let name = u?.fullName || u?.email || 'Khách hàng';
      if (name) {
        name = name
          .replace(/Quáº£n/g, 'Quản')
          .replace(/trá»‹/g, 'trị')
          .replace(/viÃªn/g, 'viên')
          .replace(/HÃ¡»‡/g, 'Hệ')
          .replace(/Há»‡/g, 'Hệ')
          .replace(/thá»‘ng/g, 'thống')
          .replace(/Tá»‘i/g, 'Tối')
          .replace(/TiÃªu/g, 'Tiêu')
          .replace(/chuáº©n/g, 'chuẩn');
      }
      if (u?.accountCode) {
        name = name + ` - UID: ${u.accountCode}`;
      }
      username = name;
    } catch {}
    
    await sendMessage(sessionId, 'customer', content, username);
    
    const newMsgs = await getMessages(sessionId);
    setMessages(newMsgs);
    
    // Simulate admin "typing" then auto-respond if no admin online
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 800);
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleSend(`[IMAGE]:${ev.target.result}`);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className="chat-widget-btn"
        onClick={() => setOpen(o => !o)}
        title="Chăm sóc khách hàng"
      >
        {open ? (
          <svg width="22" height="22" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="badge">{unread}</span>}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-panel-avatar">
              <svg width="20" height="20" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="chat-panel-info">
              <div className="chat-panel-name">Chăm sóc khách hàng KuCoin</div>
              <div className="chat-panel-status">Đang hoạt động</div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Welcome */}
          <div className="chat-welcome">
            <h3>Xin chào! Chúng tôi có thể giúp gì cho bạn?</h3>
            <p>Thời gian phản hồi thường dưới 5 phút</p>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Gửi tin nhắn để bắt đầu trò chuyện</span>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-wrap ${msg.from}`}>
                {msg.from === 'admin' && (
                  <span className="chat-sender-label">Hỗ trợ viên</span>
                )}
                <div className={`chat-bubble ${msg.from}`}>
                  {msg.text.startsWith('[IMAGE]:') ? (
                    <img src={msg.text.substring(8)} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', maxHeight: '200px', objectFit: 'contain' }} />
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="chat-time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-wrap admin">
                <span className="chat-sender-label">Hỗ trợ viên đang gõ...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Replies (only if no messages yet) */}
          {messages.length === 0 && (
            <div className="chat-quick-replies">
              {QUICK_REPLIES.map(q => (
                <button key={q} className="quick-reply-btn" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <button 
              className="chat-attach-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Gửi hình ảnh"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
            >
              <svg width="20" height="20" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <textarea
              className="chat-input"
              placeholder="Nhập tin nhắn..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!text.trim()}
            >
              <svg width="18" height="18" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
