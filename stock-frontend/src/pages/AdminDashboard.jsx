import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
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
  'Hãy thanh toán trước khi giao dịch',
  'Phí giao dịch tại sàn là 0.1% cho mỗi lệnh.',
];

function formatTime(ts) {
  const numTs = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (!numTs || isNaN(numTs)) return '';
  return new Date(numTs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  if (!ts) return '';
  let d;
  if (typeof ts === 'string' && ts.includes('T')) {
    d = new Date(ts.replace('Z', ''));
  } else {
    const numTs = typeof ts === 'string' ? parseInt(ts, 10) : ts;
    d = new Date(numTs);
  }
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN');
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
  const [view, setView] = useState('chats'); // 'chats' | 'logs' | 'deposit'
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logTab, setLogTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [uidInput, setUidInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [tradeStats, setTradeStats] = useState({ upUsers: 0, upAmount: 0, downUsers: 0, downAmount: 0 });
  const [trend, setTrend] = useState('neutral');
  const [selectedUserForView, setSelectedUserForView] = useState(null);
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
        const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs`);
        const data = await res.json();
        setAuditLogs(data);

        if (data && data.length > 0) {
          const latestId = Number(data[0].Id);

          if (!isFirstLoad && localLastLogId && latestId > localLastLogId) {
            // Found new logs
            const newLogs = data.filter(log => Number(log.Id) > localLastLogId);
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

  // Fetch & Poll Users when view is 'deposit' or 'trade'
  useEffect(() => {
    if (view === 'deposit' || view === 'trade') {
      const fetchUsers = () => {
        fetch(`${API_BASE_URL}/api/admin/users`)
          .then(res => res.json())
          .then(data => setUsers(data))
          .catch(console.error);
      };
      fetchUsers();
      const id = setInterval(fetchUsers, 5000);
      return () => clearInterval(id);
    }
  }, [view]);

  // Poll Trade Stats and Trend
  useEffect(() => {
    if (view === 'chart') {
      const fetchTradeData = async () => {
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/admin/trade-stats`);
          if (statsRes.ok) {
            const stats = await statsRes.json();
            setTradeStats(stats);
          }
          const trendRes = await fetch(`${API_BASE_URL}/api/prices/trend`);
          if (trendRes.ok) {
            const trendData = await trendRes.json();
            setTrend(trendData.trend);
          }
        } catch (e) { console.error('Error fetching trade data', e); }
      };
      fetchTradeData();
      const id = setInterval(fetchTradeData, 2000);
      return () => clearInterval(id);
    }
  }, [view]);

  async function handleSetTrend(newTrend) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/prices/trend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend: newTrend })
      });
      if (res.ok) {
        setTrend(newTrend);
        toast.success(`Đã đổi xu hướng thành: ${newTrend === 'up' ? 'TĂNG' : newTrend === 'down' ? 'GIẢM' : 'NGẪU NHIÊN'}`);
      }
    } catch (e) {
      toast.error('Lỗi khi đổi xu hướng');
    }
  }

  async function handleDeposit(userId, currentBalance) {
    const amountStr = window.prompt(`Nhập số lượng $ muốn nạp:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền không hợp lệ!');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Refresh users
        const updatedRes = await fetch(`${API_BASE_URL}/api/admin/users`);
        const updatedData = await updatedRes.json();
        setUsers(updatedData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi nạp tiền');
    }
  }

  async function handleConfirmTransfer() {
    if (!activeId) return;
    if (!activeId.startsWith('auth_user_')) {
      toast.error('Cuộc trò chuyện này thuộc khách vãng lai, không thể rút tiền!');
      return;
    }
    
    const amountStr = window.prompt('Nhập số tiền đã chuyển (Rút từ tài khoản khách hàng) ($):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền không hợp lệ!');
      return;
    }
    
    const userId = activeId.replace('auth_user_', '');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Tự động gửi tin nhắn xác nhận vào chat
        await sendMessage(activeId, 'admin', `Hệ thống: Xác nhận đã chuyển tiền thành công số tiền $${amount}.`);
        // Refresh tin nhắn
        const newMsgs = await getMessages(activeId);
        setMessages(newMsgs);
        // Refresh danh sách users nếu cần
        if (view === 'deposit' || view === 'trade') {
          const updatedRes = await fetch(`${API_BASE_URL}/api/admin/users`);
          const updatedData = await updatedRes.json();
          setUsers(updatedData);
        }
      } else {
        toast.error(data.message || 'Lỗi khi thực hiện rút tiền');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thực hiện rút tiền');
    }
  }

  async function handleFastDeposit(e) {
    e.preventDefault();
    if (!uidInput) return toast.error('Vui lòng nhập mã UID!');
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) return toast.error('Số tiền không hợp lệ!');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/deposit-by-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountCode: uidInput, amount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setUidInput('');
        setAmountInput('');
        // Refresh users
        const updatedRes = await fetch(`${API_BASE_URL}/api/admin/users`);
        const updatedData = await updatedRes.json();
        setUsers(updatedData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi nạp tiền bằng UID');
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản thành công!');
        setUsers(prev => prev.map(u => u.Id === userId ? { ...u, IsActive: data.isActive } : u));
      } else {
        toast.error(data.message || 'Lỗi khi thay đổi trạng thái tài khoản');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tài khoản này không? Tất cả lịch sử giao dịch và tin nhắn của user này sẽ bị xoá vĩnh viễn!')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Đã xoá tài khoản thành công!');
        setUsers(prev => prev.filter(u => u.Id !== userId));
      } else {
        toast.error(data.message || 'Lỗi khi xoá tài khoản');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const handleCleanupUsers = async () => {
    if (!window.confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xoá TẤT CẢ tài khoản khách (chỉ giữ lại Admin) không? Hành động này không thể hoàn tác!')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/cleanup`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Đã dọn dẹp danh sách tài khoản khách!');
        const updatedRes = await fetch(`${API_BASE_URL}/api/admin/users`);
        const updatedData = await updatedRes.json();
        setUsers(updatedData);
      } else {
        toast.error(data.message || 'Lỗi khi dọn dẹp tài khoản');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const handleClearChats = async () => {
    if (!window.confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xoá TOÀN BỘ lịch sử tin nhắn và hội thoại không? Hành động này không thể hoàn tác!')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/chat/cleanup`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Đã xoá toàn bộ lịch sử tin nhắn thành công!');
        setSessions({});
        setMessages([]);
        setActiveId(null);
      } else {
        toast.error(data.message || 'Lỗi khi xoá lịch sử tin nhắn');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const handleDeleteActiveChat = async () => {
    if (!activeId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xoá lịch sử tin nhắn của cuộc trò chuyện này không?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/chat/session/${activeId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Đã xoá lịch sử cuộc trò chuyện!');
        setActiveId(null);
        setMessages([]);
        // Refresh sessions list
        const all = await getAllSessions();
        setSessions(all);
      } else {
        toast.error(data.message || 'Lỗi khi xoá cuộc trò chuyện');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const handleDeleteSingleLog = async (logId) => {
    if (!window.confirm('Xoá nhật ký này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs/${logId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Đã xoá nhật ký!');
        setAuditLogs(prev => prev.filter(l => l.Id !== logId));
      } else {
        toast.error(data.message || 'Lỗi khi xoá nhật ký');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server');
    }
  };

  const prevMessagesLength = useRef(0);
  const prevActiveId = useRef(null);

  useEffect(() => {
    if (activeId !== prevActiveId.current || messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevActiveId.current = activeId;
    prevMessagesLength.current = messages.length;
  }, [messages, activeId]);

  async function openSession(id) {
    setActiveId(id);
    setShowSidebarMobile(false);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 190 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 190MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      handleSend(`[IMAGE]:${ev.target.result}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    <div className={`admin-page ${showSidebarMobile ? 'show-sidebar-mobile' : 'hide-sidebar-mobile'}`}>
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
              onClick={() => { setView('logs'); setShowSidebarMobile(false); }}
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

        <div className="admin-sidebar-menu">
          <button className={`admin-menu-item ${view === 'chats' ? 'active' : ''}`} onClick={() => { setView('chats'); setShowSidebarMobile(true); }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Tin nhắn khách hàng
          </button>
          <button className={`admin-menu-item ${view === 'trade' ? 'active' : ''}`} onClick={() => { setView('trade'); setShowSidebarMobile(false); }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Quản lý người dùng
          </button>
          <button className={`admin-menu-item ${view === 'chart' ? 'active' : ''}`} onClick={() => { setView('chart'); setShowSidebarMobile(false); }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            Điều khiển xu hướng
          </button>
          <button className={`admin-menu-item ${view === 'deposit' ? 'active' : ''}`} onClick={() => { setView('deposit'); setShowSidebarMobile(false); }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            Nạp tiền tài khoản
          </button>
          <button className={`admin-menu-item ${view === 'logs' ? 'active' : ''}`} onClick={() => { setView('logs'); setShowSidebarMobile(false); }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{marginRight: '8px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Nhật ký hệ thống
          </button>
        </div>

        {view === 'chats' && (
          <>
            <div className="admin-sidebar-search">
              <svg width="14" height="14" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>Tìm kiếm tin nhắn...</span>
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
                const rawName = s.username || 'Khách hàng';
                const nameParts = rawName.split(' - UID: ');
                const displayName = nameParts[0];
                const uid = nameParts[1] || '';
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
                      {uid && <div style={{ fontSize: '11px', color: '#00FFA3', marginBottom: '2px', userSelect: 'all', cursor: 'copy' }} title="Click to copy">UID: {uid}</div>}
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
          </>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        {view === 'trade' ? (
          <div className="admin-users-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button 
                className="admin-mobile-back-btn" 
                onClick={() => setShowSidebarMobile(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#848e9c',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                title="Quay lại"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h2 style={{ color: '#eaecef', margin: 0, fontSize: '18px' }}>Quản lý người dùng (Danh sách User)</h2>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(246, 70, 93, 0.08) 0%, rgba(17, 20, 26, 0.95) 100%)', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid rgba(246, 70, 93, 0.3)', 
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(246, 70, 93, 0.08)'
            }}>
              <h3 style={{ color: '#F6465D', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginTop: 0 }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Dọn dẹp hệ thống & Reset dữ liệu
              </h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleCleanupUsers}
                  style={{ 
                    padding: '8px 16px', 
                    background: 'rgba(246, 70, 93, 0.12)', 
                    color: '#F6465D', 
                    border: '1px solid rgba(246, 70, 93, 0.4)', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F6465D'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(246, 70, 93, 0.12)'; e.currentTarget.style.color = '#F6465D'; }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Xóa tất cả tài khoản khách (Reset người dùng)
                </button>
                <button 
                  onClick={handleClearChats}
                  style={{ 
                    padding: '8px 16px', 
                    background: 'rgba(246, 70, 93, 0.12)', 
                    color: '#F6465D', 
                    border: '1px solid rgba(246, 70, 93, 0.4)', 
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F6465D'; e.currentTarget.style.color = '#000'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(246, 70, 93, 0.12)'; e.currentTarget.style.color = '#F6465D'; }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Xóa toàn bộ lịch sử tin nhắn & chat
                </button>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2329', color: '#848e9c', textAlign: 'left' }}>
                  <th style={{ padding: '12px', width: '60px' }}>ID</th>
                  <th style={{ padding: '12px', width: '100px' }}>Mã UID</th>
                  <th style={{ padding: '12px' }}>Tên người dùng</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Số dư ($)</th>
                  <th style={{ padding: '12px', width: '150px' }}>Trạng thái</th>
                  <th style={{ padding: '12px', width: '280px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#5e6673' }}>Chưa có người dùng nào</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.Id} style={{ borderBottom: '1px solid #1a1e27', color: '#eaecef' }}>
                      <td style={{ padding: '12px', color: '#848e9c' }}>#{user.Id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(0, 255, 163, 0.1)', color: '#00FFA3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {user.AccountCode || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{user.FullName}</td>
                      <td style={{ padding: '12px', color: '#848e9c' }}>{user.Email}</td>
                      <td style={{ padding: '12px', color: '#24DB9B', fontWeight: 700 }}>
                        ${Number(user.Balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {user.IsAdmin === 1 ? (
                          <span style={{ background: 'rgba(36, 219, 155, 0.15)', color: '#24DB9B', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Quản trị viên
                          </span>
                        ) : user.IsActive ? (
                          <span style={{ background: 'rgba(0, 255, 163, 0.1)', color: '#00FFA3', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Đang hoạt động
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            Bị khóa
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedUserForView(user)}
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(0, 255, 163, 0.1)',
                              color: '#00FFA3',
                              border: '1px solid #00FFA3',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              width: '110px',
                              textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#00FFA3';
                              e.target.style.color = '#000';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = 'rgba(0, 255, 163, 0.1)';
                              e.target.style.color = '#00FFA3';
                            }}
                          >
                            Xem thông tin
                          </button>
                          
                          {user.IsAdmin === 1 ? (
                            <span style={{ color: '#848e9c', fontSize: '12px', fontWeight: 600, alignSelf: 'center', minWidth: '144px', textAlign: 'center' }}>Hệ thống</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleStatus(user.Id)}
                                style={{
                                  padding: '6px 10px',
                                  background: user.IsActive ? 'rgba(246, 70, 93, 0.1)' : 'rgba(0, 255, 163, 0.1)',
                                  color: user.IsActive ? '#F6465D' : '#00FFA3',
                                  border: `1px solid ${user.IsActive ? '#F6465D' : '#00FFA3'}`,
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  width: '80px',
                                  textAlign: 'center'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = user.IsActive ? '#F6465D' : '#00FFA3';
                                  e.target.style.color = '#000';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = user.IsActive ? 'rgba(246, 70, 93, 0.1)' : 'rgba(0, 255, 163, 0.1)';
                                  e.target.style.color = user.IsActive ? '#F6465D' : '#00FFA3';
                                }}
                              >
                                {user.IsActive ? 'Khóa' : 'Mở khóa'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.Id)}
                                style={{
                                  padding: '6px 10px',
                                  background: 'rgba(246, 70, 93, 0.15)',
                                  color: '#F6465D',
                                  border: '1px solid rgba(246, 70, 93, 0.4)',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  width: '56px',
                                  textAlign: 'center'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = '#F6465D';
                                  e.target.style.color = '#000';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'rgba(246, 70, 93, 0.15)';
                                  e.target.style.color = '#F6465D';
                                }}
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : view === 'chart' ? (
          <div className="admin-chart-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button 
                className="admin-mobile-back-btn" 
                onClick={() => setShowSidebarMobile(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#848e9c',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                title="Quay lại"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h2 style={{ color: '#eaecef', margin: 0, fontSize: '18px' }}>Điều khiển xu hướng biểu đồ</h2>
            </div>

            {/* ═══ TRADE CONTROL PANEL ═══ */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(17,20,26,0.98) 0%, rgba(26,31,43,0.98) 100%)',
              border: '1px solid #2b3139',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
            }}>
              <h3 style={{ color: '#eaecef', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="none" stroke="#00FFA3" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                Điều khiển xu hướng biểu đồ
              </h3>

              {/* Current trend indicator */}
              <div style={{ marginBottom: '12px', fontSize: '12px', color: '#848e9c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Xu hướng hiện tại:
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '12px',
                  background: trend === 'up' ? 'rgba(0,255,163,0.15)' : trend === 'down' ? 'rgba(246,70,93,0.15)' : 'rgba(234,236,239,0.1)',
                  color: trend === 'up' ? '#00FFA3' : trend === 'down' ? '#F6465D' : '#eaecef',
                  border: `1px solid ${trend === 'up' ? '#00FFA3' : trend === 'down' ? '#F6465D' : '#5e6673'}`
                }}>
                  {trend === 'up' ? '▲ TĂNG' : trend === 'down' ? '▼ GIẢM' : '⟳ NGẪU NHIÊN'}
                </span>
              </div>

              {/* Control buttons - điều khiển hướng chạy biểu đồ */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleSetTrend('up')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    background: trend === 'up' ? 'linear-gradient(135deg,#00FFA3,#00c87a)' : 'rgba(0,255,163,0.08)',
                    color: trend === 'up' ? '#000' : '#00FFA3',
                    border: `1px solid ${trend === 'up' ? '#00FFA3' : 'rgba(0,255,163,0.3)'}`,
                    boxShadow: trend === 'up' ? '0 4px 16px rgba(0,255,163,0.3)' : 'none'
                  }}
                >▲ Tăng biểu đồ</button>
                <button
                  onClick={() => handleSetTrend('down')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    background: trend === 'down' ? 'linear-gradient(135deg,#F6465D,#d43a4e)' : 'rgba(246,70,93,0.08)',
                    color: trend === 'down' ? '#fff' : '#F6465D',
                    border: `1px solid ${trend === 'down' ? '#F6465D' : 'rgba(246,70,93,0.3)'}`,
                    boxShadow: trend === 'down' ? '0 4px 16px rgba(246,70,93,0.3)' : 'none'
                  }}
                >▼ Giảm biểu đồ</button>
                <button
                  onClick={() => handleSetTrend('neutral')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                    background: trend === 'neutral' ? '#eaecef' : 'rgba(234,236,239,0.06)',
                    color: trend === 'neutral' ? '#000' : '#eaecef',
                    border: `1px solid ${trend === 'neutral' ? '#eaecef' : 'rgba(234,236,239,0.2)'}`,
                    boxShadow: trend === 'neutral' ? '0 4px 16px rgba(234,236,239,0.15)' : 'none'
                  }}
                >⟳ Chạy ngẫu nhiên</button>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#5e6673', fontStyle: 'italic' }}>
                ⚠ Các nút trên điều chỉnh hướng biểu đồ, không phải kết quả đặt cược.
              </div>

              {/* Thống kê lệnh cược hiện tại */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ background: 'rgba(0,255,163,0.06)', border: '1px solid rgba(0,255,163,0.2)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ color: '#00FFA3', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>▲ Người đặt MUA LÊN</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#848e9c' }}>Số lệnh: <strong style={{ color: '#eaecef' }}>{tradeStats.upUsers}</strong></span>
                    <span style={{ color: '#00FFA3', fontWeight: 700 }}>${Number(tradeStats.upAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(246,70,93,0.06)', border: '1px solid rgba(246,70,93,0.2)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ color: '#F6465D', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>▼ Người đặt MUA XUỐNG</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#848e9c' }}>Số lệnh: <strong style={{ color: '#eaecef' }}>{tradeStats.downUsers}</strong></span>
                    <span style={{ color: '#F6465D', fontWeight: 700 }}>${Number(tradeStats.downAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Live active betters list */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ color: '#eaecef', fontSize: '12px', margin: '0 0 10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#00FFA3' }}></span>
                  Danh sách lệnh đang chờ kết toán
                </h4>
                <div style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #1e2329' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#11141a', color: '#848e9c', borderBottom: '1px solid #1e2329' }}>
                        <th style={{ padding: '7px 10px' }}>UID</th>
                        <th style={{ padding: '7px 10px' }}>Tên</th>
                        <th style={{ padding: '7px 10px' }}>Cặp</th>
                        <th style={{ padding: '7px 10px' }}>Lệnh</th>
                        <th style={{ padding: '7px 10px' }}>Tiền</th>
                        <th style={{ padding: '7px 10px' }}>Còn lại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!tradeStats.activeBets || tradeStats.activeBets.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '14px', textAlign: 'center', color: '#5e6673' }}>
                            Chưa có lệnh nào đang chờ kết toán.
                          </td>
                        </tr>
                      ) : (
                        tradeStats.activeBets.map((bet) => {
                          const isUp = bet.BetType === 'UP';
                          const timeRemaining = Math.max(0, Math.round((new Date(bet.EndTime) - new Date()) / 1000));
                          return (
                            <tr key={bet.Id} style={{ borderBottom: '1px solid #1a1e27' }}>
                              <td style={{ padding: '7px 10px', color: '#00FFA3', fontWeight: 600 }}>{bet.AccountCode || 'N/A'}</td>
                              <td style={{ padding: '7px 10px', color: '#eaecef' }}>{bet.FullName}</td>
                              <td style={{ padding: '7px 10px', color: '#848e9c' }}>{bet.Symbol}</td>
                              <td style={{ padding: '7px 10px', color: isUp ? '#00FFA3' : '#F6465D', fontWeight: 700 }}>
                                {isUp ? '▲ Mua lên' : '▼ Mua xuống'}
                              </td>
                              <td style={{ padding: '7px 10px', color: '#24DB9B', fontWeight: 700 }}>
                                ${Number(bet.BetAmount || 0).toLocaleString('en-US')}
                              </td>
                              <td style={{ padding: '7px 10px', color: timeRemaining <= 30 ? '#FCD535' : '#848e9c', fontWeight: timeRemaining <= 30 ? 700 : 400 }}>
                                {timeRemaining > 0 ? `${timeRemaining}s` : 'Hết giờ'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'logs' ? (
          <div className="admin-logs-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="admin-mobile-back-btn" 
                  onClick={() => setShowSidebarMobile(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#848e9c',
                    cursor: 'pointer',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title="Quay lại"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h2 style={{ color: '#eaecef', margin: 0, fontSize: '18px' }}>Nhật ký hệ thống</h2>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="admin-logs-tabs">
              <button 
                className={`admin-log-tab-btn ${logTab === 'all' ? 'active' : ''}`}
                onClick={() => setLogTab('all')}
              >
                Tất cả
              </button>
              <button 
                className={`admin-log-tab-btn ${logTab === 'register' ? 'active' : ''}`}
                onClick={() => setLogTab('register')}
              >
                Tạo tài khoản
              </button>
              <button 
                className={`admin-log-tab-btn ${logTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setLogTab('deposit')}
              >
                Nạp tiền
              </button>
              <button 
                className={`admin-log-tab-btn ${logTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setLogTab('withdraw')}
              >
                Rút tiền
              </button>
              <button 
                className={`admin-log-tab-btn ${logTab === 'other' ? 'active' : ''}`}
                onClick={() => setLogTab('other')}
              >
                Khác
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2329', color: '#848e9c', textAlign: 'left' }}>
                  <th style={{ padding: '12px', width: '160px' }}>Thời gian</th>
                  <th style={{ padding: '12px', width: '200px' }}>Hành động</th>
                  <th style={{ padding: '12px' }}>Chi tiết</th>
                  <th style={{ padding: '12px', width: '52px' }}></th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.filter(log => {
                  if (logTab === 'all') return true;
                  if (logTab === 'register') return log.Action === 'Tạo tài khoản';
                  if (logTab === 'deposit') return log.Action === 'Nạp tiền' || log.Action === 'Nạp tiền (UID)';
                  if (logTab === 'withdraw') return log.Action === 'Rút tiền';
                  if (logTab === 'other') {
                    return log.Action !== 'Tạo tài khoản' && 
                           log.Action !== 'Nạp tiền' && 
                           log.Action !== 'Nạp tiền (UID)' && 
                           log.Action !== 'Rút tiền';
                  }
                  return true;
                }).length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#5e6673' }}>Chưa có nhật ký nào</td></tr>
                ) : (
                  auditLogs.filter(log => {
                    if (logTab === 'all') return true;
                    if (logTab === 'register') return log.Action === 'Tạo tài khoản';
                    if (logTab === 'deposit') return log.Action === 'Nạp tiền' || log.Action === 'Nạp tiền (UID)';
                    if (logTab === 'withdraw') return log.Action === 'Rút tiền';
                    if (logTab === 'other') {
                      return log.Action !== 'Tạo tài khoản' && 
                             log.Action !== 'Nạp tiền' && 
                             log.Action !== 'Nạp tiền (UID)' && 
                             log.Action !== 'Rút tiền';
                    }
                    return true;
                  }).map(log => (
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
        ) : view === 'deposit' ? (
          <div className="admin-deposit-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button 
                className="admin-mobile-back-btn" 
                onClick={() => setShowSidebarMobile(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#848e9c',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                title="Quay lại"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <h2 style={{ color: '#eaecef', margin: 0, fontSize: '18px' }}>Quản lý Tài sản (Nạp tiền)</h2>
            </div>
            
            {/* Quick Deposit Form */}
            <div style={{ background: '#11141a', padding: '20px', borderRadius: '12px', border: '1px solid #1e2329', marginBottom: '24px' }}>
              <h3 style={{ color: '#24DB9B', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Nạp tiền nhanh bằng mã UID
              </h3>
              <form style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }} onSubmit={handleFastDeposit}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#848e9c', fontWeight: 600 }}>Mã tài khoản khách hàng (UID)</label>
                  <input type="text" value={uidInput} onChange={e => setUidInput(e.target.value)} placeholder="Nhập mã UID..." style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#eaecef', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#848e9c', fontWeight: 600 }}>Số lượng ($)</label>
                  <input type="number" value={amountInput} onChange={e => setAmountInput(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 14px', background: '#1e2329', border: '1px solid #2b3139', borderRadius: '8px', color: '#eaecef', outline: 'none' }} />
                </div>
                <button type="submit" style={{ padding: '10px 24px', background: '#24DB9B', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', height: '41px', transition: 'opacity 0.2s' }}>
                  Nạp ngay
                </button>
              </form>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2329', color: '#848e9c', textAlign: 'left' }}>
                  <th style={{ padding: '12px', width: '60px' }}>ID</th>
                  <th style={{ padding: '12px', width: '100px' }}>Mã UID</th>
                  <th style={{ padding: '12px' }}>Tên người dùng</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Số dư ($)</th>
                  <th style={{ padding: '12px', width: '120px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#5e6673' }}>Chưa có người dùng nào</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.Id} style={{ borderBottom: '1px solid #1a1e27', color: '#eaecef' }}>
                      <td style={{ padding: '12px', color: '#848e9c' }}>#{user.Id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(0, 255, 163, 0.1)', color: '#00FFA3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {user.AccountCode || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{user.FullName}</td>
                      <td style={{ padding: '12px', color: '#848e9c' }}>{user.Email}</td>
                      <td style={{ padding: '12px', color: '#24DB9B', fontWeight: 700 }}>
                        ${Number(user.Balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeposit(user.Id, user.Balance)}
                          className="admin-deposit-btn"
                        >
                          Nạp tiền
                        </button>
                      </td>
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
              <button 
                className="admin-chat-back-btn" 
                onClick={() => { setActiveId(null); setShowSidebarMobile(true); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#848e9c',
                  marginRight: '12px',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                title="Quay lại"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>

              <div className="admin-chat-avatar">
                {((activeSession?.username || 'K').split(' - UID: ')[0])[0].toUpperCase()}
              </div>
              <div>
                <div className="admin-chat-name">{activeSession?.username?.split(' - UID: ')[0] || 'Khách hàng'}</div>
                {activeSession?.username?.includes(' - UID: ') && (
                  <div style={{ fontSize: '12px', color: '#00FFA3', fontWeight: 600, userSelect: 'all', cursor: 'copy', display: 'inline-block', background: 'rgba(0,255,163,0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px' }} title="Click to copy">
                    UID: {activeSession.username.split(' - UID: ')[1]}
                  </div>
                )}
                <div className="admin-chat-meta" style={{ marginTop: '2px' }}>
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
                    {msg.from === 'admin' ? 'Bạn (Quản trị viên)' : `${activeSession?.username || 'Khách hàng'}`}
                  </span>
                  <div className={`admin-bubble ${msg.from === 'admin' ? 'admin-msg' : 'customer'}`}>
                    {msg.text.startsWith('[IMAGE]:') ? (
                      <img src={msg.text.replace('[IMAGE]:', '')} alt="attachment" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                    ) : (
                      msg.text
                    )}
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

             {/* Quick Actions Panel */}
            <div className="admin-chat-actions" style={{ padding: '8px 16px', background: '#11141a', borderTop: '1px solid #1e2329', display: 'flex', alignItems: 'center', gap: '12px' }}>


              <button
                className="admin-action-delete-chat-btn"
                onClick={handleDeleteActiveChat}
                style={{
                  background: 'rgba(246, 70, 93, 0.1)',
                  color: '#F6465D',
                  border: '1px solid #F6465D',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#F6465D';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(246, 70, 93, 0.1)';
                  e.currentTarget.style.color = '#F6465D';
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa lịch sử tin nhắn
              </button>
            </div>

            {/* Input */}
            <div className="admin-input-area">
              <div className="admin-input-avatar">
                A
              </div>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', color: '#848e9c', transition: 'color 0.2s' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </label>
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

      {/* ── User Details Modal ── */}
      {selectedUserForView && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUserForView(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Thông tin chi tiết người dùng</h3>
              <button className="admin-modal-close" onClick={() => setSelectedUserForView(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-details-grid">
                <div className="admin-details-item">
                  <span className="details-label">ID hệ thống:</span>
                  <span className="details-value">#{selectedUserForView.Id}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Mã UID:</span>
                  <span className="details-value highlight-uid">{selectedUserForView.AccountCode || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Họ và tên:</span>
                  <span className="details-value name-value">{selectedUserForView.FullName || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Email / Gmail:</span>
                  <span className="details-value">{selectedUserForView.Email || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Số điện thoại:</span>
                  <span className="details-value">{selectedUserForView.PhoneNumber || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Khu vực / Quốc gia:</span>
                  <span className="details-value">{selectedUserForView.Country || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Loại giấy tờ:</span>
                  <span className="details-value">{selectedUserForView.IdCardType || 'CCCD'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Số CCCD (12 số):</span>
                  <span className="details-value">{selectedUserForView.IdNumber || 'N/A'}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Số dư hiện tại:</span>
                  <span className="details-value balance-value">${Number(selectedUserForView.Balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="admin-details-item">
                  <span className="details-label">Trạng thái:</span>
                  <span className="details-value">
                    {selectedUserForView.IsAdmin === 1 ? (
                      <span className="status-badge admin">Quản trị viên</span>
                    ) : selectedUserForView.IsActive ? (
                      <span className="status-badge active">Đang hoạt động</span>
                    ) : (
                      <span className="status-badge locked">Bị khóa</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="admin-photos-section">
                <h4>Ảnh giấy tờ xác thực KYC</h4>
                <div className="photos-row">
                  <div className="photo-box">
                    <span className="photo-label">Mặt trước giấy tờ:</span>
                    {selectedUserForView.IdFrontPhoto ? (
                      <a href={selectedUserForView.IdFrontPhoto} target="_blank" rel="noopener noreferrer" title="Click để xem ảnh gốc">
                        <img src={selectedUserForView.IdFrontPhoto} alt="Mặt trước" className="kyc-preview-img" />
                        <span className="zoom-hint">🔍 Phóng to</span>
                      </a>
                    ) : (
                      <div className="no-photo">Chưa tải lên ảnh mặt trước</div>
                    )}
                  </div>

                  <div className="photo-box">
                    <span className="photo-label">Mặt sau giấy tờ:</span>
                    {selectedUserForView.IdBackPhoto ? (
                      <a href={selectedUserForView.IdBackPhoto} target="_blank" rel="noopener noreferrer" title="Click để xem ảnh gốc">
                        <img src={selectedUserForView.IdBackPhoto} alt="Mặt sau" className="kyc-preview-img" />
                        <span className="zoom-hint">🔍 Phóng to</span>
                      </a>
                    ) : (
                      <div className="no-photo">Chưa tải lên ảnh mặt sau</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-close-modal" onClick={() => setSelectedUserForView(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}
