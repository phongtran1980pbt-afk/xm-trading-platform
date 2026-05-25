import { useState, useEffect, useRef } from 'react';
import {
  getAllSessions, getMessages, sendMessage,
  markAdminRead,
} from '../utils/chatStore';
import './AdminChatPanel.css';

const TEMPLATES = [
  'Xin chào! Tôi có thể giúp gì cho bạn?',
  'Vui lòng chờ một chút.',
  'Vấn đề đã được ghi nhận.',
  'Hãy thanh toán trước khi giao dịch',
  'Phí giao dịch là 0.1% mỗi lệnh.',
];

function formatTime(ts) {
  const n = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (!n || isNaN(n)) return '';
  return new Date(n).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminChatPanel() {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState({});
  const [previews, setPreviews] = useState({}); // last msg per session
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Poll mỗi 2 giây
  useEffect(() => {
    async function refresh() {
      try {
        const all = await getAllSessions();
        setSessions(all);

        // Tổng tin chưa đọc
        const unread = Object.values(all).reduce((s, x) => s + (x.unreadAdmin || 0), 0);
        setTotalUnread(unread);

        // Lấy tin nhắn cuối cùng của mỗi session để preview
        const prev = {};
        for (const sid of Object.keys(all)) {
          const msgs = await getMessages(sid);
          prev[sid] = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        }
        setPreviews(prev);

        // Nếu đang mở 1 cuộc trò chuyện thì cũng cập nhật tin nhắn
        if (activeId) {
          const msgs = await getMessages(activeId);
          setMessages(msgs);
        }
      } catch (e) {}
    }
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [activeId]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openSession(sid) {
    setActiveId(sid);
    await markAdminRead(sid);
    const msgs = await getMessages(sid);
    setMessages(msgs);
  }

  async function handleSend(tmpl) {
    const content = (tmpl || text).trim();
    if (!content || !activeId) return;
    setText('');
    await sendMessage(activeId, 'admin', content, 'Admin KuCoin');
    const msgs = await getMessages(activeId);
    setMessages(msgs);
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

  const sortedSessions = Object.values(sessions).sort(
    (a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0)
  );
  const activeSession = sessions[activeId];

  return (
    <>
      {/* ── Nút FAB admin ── */}
      <button
        className={`admin-panel-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Mở bảng quản trị viên"
      >
        {open ? (
          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="fab-text">ADMIN</span>
          </>
        )}
        {!open && totalUnread > 0 && (
          <span className="fab-badge">{totalUnread}</span>
        )}
      </button>

      {/* ── Panel nổi ── */}
      {open && (
        <div className={`admin-float-panel ${activeId ? 'has-active-chat' : ''}`}>

          {/* Sidebar danh sách khách */}
          <aside className="afp-sidebar">
            <div className="afp-sidebar-header">
              <div className="afp-sidebar-title">
                <svg width="14" height="14" fill="none" stroke="#F6465D" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                </svg>
                Quản trị viên
                <span className="afp-admin-tag">ADMIN</span>
              </div>
              <div className="afp-subtitle">
                {sortedSessions.length} cuộc trò chuyện {totalUnread > 0 ? `• ${totalUnread} chưa đọc` : ''}
              </div>
            </div>

            <div className="afp-sessions">
              {sortedSessions.length === 0 ? (
                <div className="afp-empty">
                  <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <br/>Chưa có tin nhắn nào.<br/>Khách hàng sẽ hiện ở đây khi nhắn.
                </div>
              ) : sortedSessions.map(s => {
                const lastMsg = previews[s.sessionId];
                const hasUnread = (s.unreadAdmin || 0) > 0;
                const name = s.username || 'Khách hàng';
                return (
                  <div
                    key={s.sessionId}
                    className={`afp-session-item ${activeId === s.sessionId ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                    onClick={() => openSession(s.sessionId)}
                  >
                    <div className="afp-avatar">{name[0].toUpperCase()}</div>
                    <div className="afp-sinfo">
                      <div className="afp-srow">
                        <span className="afp-sname">{name}</span>
                        <span className="afp-stime">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                      </div>
                      <div className="afp-spreview">
                        {lastMsg
                          ? `${lastMsg.from === 'admin' ? 'Bạn: ' : ''}${lastMsg.text}`
                          : 'Chưa có tin nhắn'}
                      </div>
                    </div>
                    {hasUnread && <div className="afp-unread-badge">{s.unreadAdmin}</div>}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Khu vực chat chính */}
          <div className="afp-main">
            {!activeId ? (
              <div className="afp-no-convo">
                <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="0.8" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <h4>Chọn một cuộc trò chuyện</h4>
                <p>Bấm vào tên khách ở bên trái để xem và trả lời tin nhắn</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="afp-chat-header">
                  <button 
                    className="afp-back-btn" 
                    onClick={() => setActiveId(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#848e9c',
                      marginRight: '8px',
                      cursor: 'pointer',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    title="Quay lại"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>

                  <div className="afp-chat-avatar">
                    {(activeSession?.username || 'K')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="afp-chat-name">{activeSession?.username || 'Khách hàng'}</div>
                    <div className="afp-online">Đang hoạt động</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#5e6673' }}>
                    Session: {activeId?.slice(0, 16)}...
                  </div>
                </div>

                {/* Tin nhắn */}
                <div className="afp-messages">
                  {messages.length === 0 && (
                    <div style={{ color: '#5e6673', textAlign: 'center', marginTop: '32px', fontSize: '12px' }}>
                      Chưa có tin nhắn trong cuộc trò chuyện này
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`afp-bubble-wrap ${msg.from === 'admin' ? 'admin' : 'customer'}`}>
                      <span className="afp-label">
                        {msg.from === 'admin'
                          ? 'Bạn (Quản trị viên)'
                          : `${activeSession?.username || 'Khách hàng'}`}
                      </span>
                      <div className={`afp-bubble ${msg.from === 'admin' ? 'admin' : 'customer'}`}>
                        {msg.text.startsWith('[IMAGE]:') ? (
                          <img src={msg.text.substring(8)} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', maxHeight: '200px', objectFit: 'contain' }} />
                        ) : (
                          msg.text
                        )}
                      </div>
                      <span className="afp-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Trả lời nhanh */}
                <div className="afp-templates">
                  <span style={{ fontSize: '10px', color: '#5e6673', marginRight: '4px', flexShrink: 0 }}>Nhanh:</span>
                  {TEMPLATES.map(t => (
                    <button key={t} className="afp-tmpl-btn" onClick={() => handleSend(t)}>
                      {t.length > 25 ? t.slice(0, 25) + '…' : t}
                    </button>
                  ))}
                </div>

                {/* Input gửi tin */}
                <div className="afp-input-area" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                  />
                  <button 
                    className="afp-attach-btn" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Gửi hình ảnh"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
                  >
                    <svg width="20" height="20" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  <textarea
                    className="afp-input"
                    placeholder="Nhập phản hồi... (Enter để gửi)"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    rows={2}
                  />
                  <button
                    className="afp-send-btn"
                    onClick={() => handleSend()}
                    disabled={!text.trim()}
                  >
                    Gửi ›
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </>
  );
}
