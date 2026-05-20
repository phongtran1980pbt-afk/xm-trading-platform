import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllSessions, getMessages, sendMessage,
  markAdminRead, totalAdminUnread,
} from '../utils/chatStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';

const ADMIN_TEMPLATES = [
  'Xin chào! Tôi có thể giúp gì cho bạn?',
  'Cảm ơn bạn đã liên hệ! Vui lòng chờ một chút.',
  'Vấn đề của bạn đã được ghi nhận, chúng tôi sẽ xử lý sớm.',
  'Để nạp tiền, vui lòng vào mục Nạp tiền > Pháp định.',
  'Phí giao dịch tại sàn là 0.1% cho mỗi lệnh.',
];

function formatTime(ts) {
  const numTs = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (!numTs || isNaN(numTs)) return '';
  return new Date(numTs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  const numTs = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (!numTs || isNaN(numTs)) return '';
  const d = new Date(numTs);
  return d.toLocaleDateString('vi-VN') + ' ' + formatTime(ts);
}

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    // Ding sound frequencies
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.error("Audio error:", err);
  }
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  // Store last message per session for preview
  const [sessionPreviews, setSessionPreviews] = useState({});
  const [text, setText] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [view, setView] = useState('chats'); // 'chats' | 'logs'
  const [auditLogs, setAuditLogs] = useState([]);
  const bottomRef = useRef(null);

  // Poll for updates every 1.5 seconds
  useEffect(() => {
    async function refresh() {
      const all = await getAllSessions();
      setSessions(all);
      setTotalUnread(await totalAdminUnread());

      // Fetch preview (last message) for each session
      const previews = {};
      for (const sid of Object.keys(all)) {
        try {
          const msgs = await getMessages(sid);
          previews[sid] = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        } catch {}
      }
      setSessionPreviews(previews);

      if (activeId && view === 'chats') {
        const msgs = await getMessages(activeId);
        setMessages(msgs);
      }
    }
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [activeId, view]);

  // Poll audit logs to show toast notifications
  useEffect(() => {
    let localLastLogId = null;
    let isFirstLoad = true;

    async function fetchLogs() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const res = await fetch(`${apiUrl}/api/admin/audit-logs`);
        const data = await res.json();
        setAuditLogs(data);

        if (data && data.length > 0) {
          const latestId = data[0].Id;

          if (!isFirstLoad && localLastLogId && latestId > localLastLogId) {
            // Found new logs
            const newLogs = data.filter(log => log.Id > localLastLogId);
            newLogs.forEach(log => {
              if (log.Action === 'Tạo tài khoản') {
                playNotificationSound();
                const dateStr = formatDate(log.CreatedAt);
                toast.success(`Tài khoản mới đăng ký!\n${log.Details}\nThời gian: ${dateStr}`, {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }
            });
          }
          localLastLogId = latestId;
        }
        isFirstLoad = false;
      } catch (err) {
        console.error('Error fetching logs', err);
      }
    }

    fetchLogs();
    const id = setInterval(fetchLogs, 3000);
    return () => clearInterval(id);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openSession(id) {
    setActiveId(id);
    await markAdminRead(id);
    const msgs = await getMessages(id);
    setMessages(msgs);
  }

  async function handleSend(tmpl) {
    const content = (tmpl || text).trim();
    if (!content || !activeId) return;
    setText('');
    await sendMessage(activeId, 'admin', content, 'Admin KuCoin');
    const newMsgs = await getMessages(activeId);
    setMessages(newMsgs);
  }

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
    <div className="admin-page">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B"/>
              <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B"/>
              <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B"/>
            </svg>
          </Link>
          <span className="admin-logo-text">Quản trị viên</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
              onClick={() => setView('logs')}
              title="Nhật ký hệ thống"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            {totalUnread > 0 && (
              <span className="admin-badge-count">{totalUnread} mới</span>
            )}
          </div>
        </div>

        <div className="admin-sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #1e2329' }}>
          <button 
            onClick={() => setView('chats')} 
            style={{ flex: 1, padding: '12px 0', background: view === 'chats' ? '#1e2329' : 'transparent', color: view === 'chats' ? '#24DB9B' : '#848e9c', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            Tin nhắn
          </button>
          <button 
            onClick={() => setView('logs')} 
            style={{ flex: 1, padding: '12px 0', background: view === 'logs' ? '#1e2329' : 'transparent', color: view === 'logs' ? '#24DB9B' : '#848e9c', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            Nhật ký
          </button>
        </div>

        <div className="admin-sidebar-search">
          <svg width="14" height="14" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Tin nhắn khách hàng</span>
        </div>

        <div className="admin-sessions-list">
          {sortedSessions.length === 0 && (
            <div className="admin-sidebar-empty">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Chưa có tin nhắn nào.</p>
              <p>Khách hàng sẽ hiện ở đây khi nhắn.</p>
            </div>
          )}
          {sortedSessions.map(s => {
            const lastMsg = sessionPreviews[s.sessionId];
            const hasUnread = (s.unreadAdmin || 0) > 0;
            const displayName = s.username || 'Khách hàng';
            const initial = displayName[0].toUpperCase();
            return (
              <div
                key={s.sessionId}
                className={`admin-session-item ${activeId === s.sessionId ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                onClick={() => openSession(s.sessionId)}
              >
                <div className="session-avatar">{initial}</div>
                <div className="session-info">
                  <div className="session-row">
                    <span className="session-name">{displayName}</span>
                    <span className="session-time">{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                  </div>
                  <div className="session-preview">
                    {lastMsg
                      ? `${lastMsg.from === 'admin' ? 'Bạn: ' : ''}${lastMsg.text}`
                      : 'Chưa có tin nhắn'}
                  </div>
                </div>
                {hasUnread && <div className="session-unread-badge">{s.unreadAdmin}</div>}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        {view === 'logs' ? (
          <div className="admin-logs-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <h2 style={{ color: '#eaecef', marginBottom: '20px', fontSize: '18px' }}>Nhật ký hệ thống (Audit Logs)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2329', color: '#848e9c', textAlign: 'left' }}>
                  <th style={{ padding: '12px', width: '160px' }}>Thời gian</th>
                  <th style={{ padding: '12px', width: '200px' }}>Hành động</th>
                  <th style={{ padding: '12px' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#5e6673' }}>Chưa có nhật ký nào</td></tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.Id} style={{ borderBottom: '1px solid #1a1e27', color: '#eaecef' }}>
                      <td style={{ padding: '12px', color: '#848e9c' }}>{formatDate(log.CreatedAt)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(36, 219, 155, 0.1)', color: '#24DB9B', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {log.Action}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{log.Details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : !activeId ? (
          <div className="admin-no-convo">
            <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.8" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>Chọn một cuộc trò chuyện</h3>
            <p>Danh sách khách hàng đang nhắn tin sẽ hiện ở cột bên trái</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="admin-chat-header">
              <div className="admin-chat-avatar">
                {(activeSession?.username || 'K')[0].toUpperCase()}
              </div>
              <div>
                <div className="admin-chat-name">{activeSession?.username || 'Khách hàng'}</div>
                <div className="admin-chat-meta">
                  <span className="admin-online-dot"/> Đang hoạt động
                </div>
              </div>
              <div className="admin-chat-session">
                <span>Session: {activeId?.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-messages">
              {messages.length === 0 && (
                <div style={{ color: '#5e6673', textAlign: 'center', marginTop: '32px', fontSize: '13px' }}>
                  Chưa có tin nhắn nào trong cuộc trò chuyện này
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`admin-bubble-wrap ${msg.from === 'admin' ? 'admin-msg' : 'customer'}`}
                >
                  <span className="admin-label">
                    {msg.from === 'admin' ? '🛡️ Bạn (Quản trị viên)' : `👤 ${activeSession?.username || 'Khách hàng'}`}
                  </span>
                  <div className={`admin-bubble ${msg.from === 'admin' ? 'admin-msg' : 'customer'}`}>
                    {msg.text}
                  </div>
                  <span className="admin-time">{formatTime(msg.timestamp)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Template Quick Replies */}
            <div className="admin-templates">
              <span style={{fontSize:'11px', color:'#5e6673', marginRight:'4px'}}>Trả lời nhanh:</span>
              {ADMIN_TEMPLATES.map(t => (
                <button
                  key={t}
                  className="admin-template-btn"
                  onClick={() => handleSend(t)}
                >
                  {t.length > 28 ? t.slice(0, 28) + '…' : t}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="admin-input-area">
              <div className="admin-input-avatar">
                A
              </div>
              <textarea
                className="admin-input"
                placeholder="Nhập phản hồi cho khách hàng... (Enter để gửi)"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
              />
              <button
                className="admin-send-btn"
                onClick={() => handleSend()}
                disabled={!text.trim()}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Gửi
              </button>
            </div>
          </>
        )}
      </div>
      <ToastContainer theme="dark" />
    </div>
  );
}
