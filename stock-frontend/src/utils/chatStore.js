import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api/chat`;

/** Get or create a session ID for this customer browser tab */
export function getSessionId() {
  let id = sessionStorage.getItem('xm_session_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem('xm_session_id', id);
  }
  return id;
}

/** Return all sessions (for Admin) */
export async function getAllSessions() {
  try {
    const res = await axios.get(`${API_BASE}/sessions`);
    return res.data; // object keyed by sessionId
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return {};
  }
}

/** Return messages for a given session */
export async function getMessages(sessionId) {
  try {
    const res = await axios.get(`${API_BASE}/${sessionId}`);
    return res.data || [];
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

/** Send a message */
export async function sendMessage(sessionId, from, text, username = 'Khách hàng') {
  try {
    const res = await axios.post(`${API_BASE}/${sessionId}`, { from, text, username });
    return res.data;
  } catch (err) {
    console.error('Error sending message:', err);
    return null;
  }
}

/** Mark user messages as read (called when chat is opened by user) */
export async function markUserRead(sessionId) {
  try {
    await axios.post(`${API_BASE}/${sessionId}/read`, { reader: 'customer' });
  } catch (err) {}
}

/** Mark admin messages as read (called when admin opens conversation) */
export async function markAdminRead(sessionId) {
  try {
    await axios.post(`${API_BASE}/${sessionId}/read`, { reader: 'admin' });
  } catch (err) {}
}

/** Total unread for admin badge */
export async function totalAdminUnread() {
  try {
    const res = await axios.get(`${API_BASE}/sessions`);
    const sessions = res.data;
    return Object.values(sessions).reduce((sum, s) => sum + (s.unreadAdmin || 0), 0);
  } catch (err) {
    return 0;
  }
}
