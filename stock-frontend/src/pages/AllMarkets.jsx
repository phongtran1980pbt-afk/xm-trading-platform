import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrices } from '../contexts/PriceContext';
import './AlphaMarkets.css';

// Mock data for the different tabs
const ALL_MARKETS_DATA = {
  meme: [
    { id: 1, name: 'SHIB', sub: 'SHIBA INU', price: 0.00000574, change: 0.51, isUp: true, cap: '$3.38 T', vol: '$8.25 Tr' },
    { id: 2, name: 'DOGE', sub: 'Dogecoin', price: 0.10386562, change: -0.28, isUp: false, cap: '$15.98 T', vol: '$2.97 Tr' },
    { id: 3, name: 'PEPE', sub: 'Pepe', price: 0.0000036899, change: 0.96, isUp: true, cap: '$1.52 T', vol: '$1.01 Tr' },
    { id: 4, name: 'WIF', sub: 'dogwifhat', price: 0.19288759, change: 1.26, isUp: true, cap: '$192.41 Tr', vol: '$688.864,06' },
    { id: 5, name: 'BONK', sub: 'BONK', price: 0.00000602, change: 1.28, isUp: true, cap: '$530.6 Tr', vol: '$362.705,34' },
    { id: 6, name: 'FLOKI', sub: 'FLOKI', price: 0.00003021, change: 0.93, isUp: true, cap: '$287.32 Tr', vol: '$182.204,11' },
    { id: 7, name: 'BRETT', sub: 'BRETT', price: 0.00755767, change: -1.32, isUp: false, cap: '$1.21 T', vol: '$131.108,99' }
  ],
  storage: [
    { id: 1, name: 'FIL', sub: 'Filecoin', price: 0.95315038, change: 0.08, isUp: true, cap: '$745.03 Tr', vol: '$732.465,12' },
    { id: 2, name: 'STORJ', sub: 'Storj', price: 0.11257603, change: -7.09, isUp: false, cap: '$47.8 Tr', vol: '$105.032,2' },
    { id: 3, name: 'AR', sub: 'Arweave', price: 2.16, change: 2.56, isUp: true, cap: '$141.56 Tr', vol: '$104.901,05' },
    { id: 4, name: 'DATA', sub: 'Streamr', price: 0.00062571, change: -7.43, isUp: false, cap: '$789.507,62', vol: '$81.012,7' },
    { id: 5, name: 'SKL', sub: 'SKALE Network', price: 0.00607331, change: 0.82, isUp: true, cap: '$37.55 Tr', vol: '$31.279,63' },
    { id: 6, name: 'ELA', sub: 'Elastos', price: 0.45340071, change: 0.84, isUp: true, cap: '$13.47 Tr', vol: '$22.393,16' },
    { id: 7, name: 'ALEPH', sub: 'Aleph.im', price: 0.01628207, change: 0.93, isUp: true, cap: '$4.03 Tr', vol: '$6.563,74' }
  ],
  supply: [
    { id: 1, name: 'VET', sub: 'VeChain', price: 0.00659373, change: -1.40, isUp: false, cap: '$565.62 Tr', vol: '$246.518,22' }
  ],
  media: [
    { id: 1, name: 'THETA', sub: 'THETA', price: 0.19828165, change: 0.20, isUp: true, cap: '$198.7 Tr', vol: '$186.894,15' },
    { id: 2, name: 'AIOZ', sub: 'AIOZ Network', price: 0.06672652, change: -0.67, isUp: false, cap: '$83.83 Tr', vol: '$56.073,4' },
    { id: 3, name: 'KIN', sub: 'Kin (new)', price: 0.00506442, change: 76.89, isUp: true, cap: '$790.308,56', vol: '$15.988,83' },
    { id: 4, name: 'WAXP', sub: 'WAX', price: 0.00619318, change: -1.80, isUp: false, cap: '$28.6 Tr', vol: '$8.593,07' },
    { id: 5, name: 'TFUEL', sub: 'Theta Fuel', price: 0.01058834, change: 0.38, isUp: true, cap: '$77.64 Tr', vol: '$5.952,53' }
  ],
  all: [
    { id: 1, name: 'BTC', sub: 'Bitcoin', price: 77390.98, change: 0.64, isUp: true, cap: '$1.55 NT', vol: '$156.85 Tr' },
    { id: 2, name: 'ETH', sub: 'Ethereum', price: 2127.08, change: 0.57, isUp: true, cap: '$256.33 T', vol: '$135.03 Tr' },
    { id: 3, name: 'ZEC', sub: 'Zcash', price: 582.76, change: 4.39, isUp: true, cap: '$9.72 T', vol: '$84.18 Tr' },
    { id: 4, name: 'XMR', sub: 'Monero', price: 338.20, change: 1.88, isUp: true, cap: '$7.32 T', vol: '$51 Tr' },
    { id: 5, name: 'AAVE', sub: 'Aave', price: 87.68, change: -0.83, isUp: false, cap: '$1.35 T', vol: '$46.45 Tr' },
    { id: 6, name: 'NEAR', sub: 'NEAR Protocol', price: 1.65, change: 2.58, isUp: true, cap: '$2.14 T', vol: '$44.54 Tr' },
    { id: 7, name: 'TAO', sub: 'Bittensor', price: 263.06, change: 1.80, isUp: true, cap: '$2.87 T', vol: '$34.69 Tr' },
    { id: 8, name: 'UNI', sub: 'Uniswap', price: 8.6, change: 2.05, isUp: true, cap: '$6.2 T', vol: '$22.1 Tr' }
  ]
};

function formatPrice(val) {
  let str = val.toString();
  if (str.includes('e')) {
    str = val.toFixed(10).replace(/0+$/, '');
  }
  return '$' + str.replace('.', ',');
}

// Helper to draw random sparkline SVG
const Sparkline = ({ isUp }) => {
  const points = [];
  let y = 10;
  for (let x = 0; x <= 50; x += 10) {
    points.push(`${x},${y}`);
    y += (Math.random() * 10 - 5);
  }
  // Ensure the trend matches the color
  if (isUp) {
    points[points.length - 1] = `50,2`; // end high
  } else {
    points[points.length - 1] = `50,18`; // end low
  }
  
  return (
    <svg width="60" height="24" viewBox="0 0 60 24">
      <polyline 
        fill="none" 
        stroke={isUp ? "#00FFA3" : "#F6465D"} 
        strokeWidth="1.5" 
        points={points.join(' ')} 
      />
    </svg>
  );
};

function AllMarkets() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('all');
  const globalPrices = usePrices();

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'meme', label: 'Meme' },
    { key: 'storage', label: 'Bộ nhớ lưu trữ' },
    { key: 'supply', label: 'Chuỗi cung ứng' },
    { key: 'media', label: 'Media' },
    { key: 'privacy', label: 'Quyền riêng tư' },
    { key: 'entertainment', label: 'Giải trí' },
    { key: 'other', label: 'Khác ▾' }
  ];

  // Merge live global prices into each coin row
  const currentData = (ALL_MARKETS_DATA[activeSubTab] || []).map(coin => {
    const live = globalPrices?.[coin.name];
    if (!live) return coin;
    return { ...coin, price: live.price, change: live.change, isUp: live.isUp };
  });

  return (
    <div className="alpha-markets-page">
      {/* HEADER */}
      <header className="alpha-header">
        <Link to="/" className="alpha-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
            <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
            <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
          </svg>
          <span className="alpha-logo-text">KUCOIN</span>
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <div className="alpha-main-container">
        
        {/* TOP LEVEL TABS */}
        <div className="alpha-tabs-container" style={{marginTop: '24px'}}>
          <div className="alpha-tab">Yêu thích</div>
          <Link to="/markets/all" className="alpha-tab active" style={{textDecoration:'none'}}>Tất cả</Link>
          <div className="alpha-tab">Giao ngay</div>
          <div className="alpha-tab">Giao sau</div>
          <Link to="/markets/alpha" className="alpha-tab" style={{textDecoration:'none'}}>Alpha</Link>
        </div>

        {/* SUB TABS */}
        <div className="alpha-sub-tabs" style={{borderBottom: 'none', marginBottom: '16px'}}>
          <div className="alpha-pills">
            {tabs.map(tab => (
              <button 
                key={tab.key}
                className={`alpha-pill bordered ${activeSubTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="alpha-tools">
            <div className="alpha-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Tìm kiếm" />
            </div>
          </div>
        </div>

        <div style={{marginBottom: '24px', color: '#848e9c', fontSize: '12px'}}>
          {activeSubTab === 'meme' && "Meme đề cập đến các khái niệm lan tỏa khắp các cộng đồng, tạo thành một nền văn hóa nhỏ..."}
          {activeSubTab === 'storage' && "Lưu trữ phân tán có thể được sử dụng để truyền dữ liệu trên nhiều điểm nút mạng lưới..."}
          {activeSubTab === 'supply' && "Tính minh bạch, tính công khai, khả năng phi tập trung hóa chống giả mạo..."}
          {activeSubTab === 'media' && "Công nghệ blockchain có thể bù đắp cho những thiếu sót của nền tảng media truyền thống..."}
          {activeSubTab === 'all' && "KuCoin Theo dõi Thị trường. Tìm kiếm coin triển vọng và những cơ hội tuyệt vời!"}
        </div>

        {/* TABLE */}
        <div className="alpha-table-wrapper">
          <table className="alpha-table" style={{textAlign: 'right'}}>
            <thead>
              <tr>
                <th style={{width: '30px', textAlign: 'left'}}>#</th>
                <th style={{textAlign: 'left'}}>Tên ↕</th>
                <th>Giá ↕</th>
                <th>1h 4h <span style={{color:'#fff'}}>24h</span> Thay đổi ↕</th>
                <th style={{textAlign:'center'}}>Thị trường</th>
                <th>Vốn hóa thị trường ↕</th>
                <th>Doanh thu 24 giờ ↕</th>
                <th style={{textAlign: 'right'}}>Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((coin, index) => (
                <tr key={coin.id} style={{cursor: 'pointer'}} onClick={() => navigate(`/trade/${coin.name}`)}>
                  <td style={{textAlign: 'left'}}>
                    <svg className="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </td>
                  <td style={{textAlign: 'left'}}>
                    <div className="alpha-coin-cell">
                      <div className="alpha-coin-icon" style={{background: index % 2 === 0 ? '#F7931A' : '#4169e1', color: '#fff'}}>{coin.name[0]}</div>
                      <div>
                        <div className="alpha-coin-symbol-large">{coin.name}</div>
                        <div className="alpha-coin-address">{coin.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{formatPrice(coin.price)}</td>
                  <td className={coin.isUp ? 'text-green' : 'text-red'} style={{fontWeight: '500'}}>
                    {coin.change > 0 ? '+' : ''}{coin.change}% {coin.isUp ? '▲' : '▼'}
                  </td>
                  <td style={{textAlign:'center'}}>
                    <Sparkline isUp={coin.isUp} />
                  </td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{coin.cap}</td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{coin.vol}</td>
                  <td style={{textAlign: 'right', color: '#24DB9B', fontSize: '12px'}}>
                    <span style={{marginRight: '8px', cursor: 'pointer'}}>Chi tiết</span>
                    <span style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); navigate(`/trade/${coin.name}`); }}>Giao dịch</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default AllMarkets;
