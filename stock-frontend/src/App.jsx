import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import Login from './pages/Login';
import XMWeb from './pages/XMWeb';
import KucoinWeb from './pages/KucoinWeb';
import AlphaMarkets from './pages/AlphaMarkets';
import AllMarkets from './pages/AllMarkets';
import TradePage from './pages/TradePage';
import AdminDashboard from './pages/AdminDashboard';
import ChatWidget from './components/ChatWidget';
import AdminChatPanel from './components/AdminChatPanel';
import { PriceProvider } from './contexts/PriceContext';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: '#fff' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component kiểm tra user và chọn widget phù hợp
function ChatOrAdmin() {
  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  const isAdmin = user?.isAdmin === true || user?.role === 'Admin';

  // Không hiện widget nào trên trang login/register
  const location = useLocation();
  const hideOn = ['/login', '/register', '/register-success', '/admin'];
  if (hideOn.includes(location.pathname)) return null;

  if (isAdmin) {
    return <AdminChatPanel />;
  }
  return <ChatWidget />;
}

function App() {
  return (
    <ErrorBoundary>
      <PriceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<KucoinWeb />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/markets/alpha" element={<AlphaMarkets />} />
            <Route path="/markets/all" element={<AllMarkets />} />
            <Route path="/trade/:symbol" element={<TradePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          {/* Tự động chọn: Admin Panel hoặc Chat Widget dựa theo tài khoản */}
          <ChatOrAdmin />
        </Router>
      </PriceProvider>
    </ErrorBoundary>
  );
}

export default App;