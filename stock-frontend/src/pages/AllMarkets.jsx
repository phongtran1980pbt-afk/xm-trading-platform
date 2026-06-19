import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrices } from '../contexts/PriceContext';
import CoinLogo from '../components/CoinLogo';
import './AlphaMarkets.css';

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

const Sparkline = ({ isUp }) => {
  const points = [];
  let y = 10;
  for (let x = 0; x <= 50; x += 10) {
    points.push(`${x},${y}`);
    y += (Math.random() * 10 - 5);
  }
  
  if (isUp) {
    points[points.length - 1] = `50,2`; 
  } else {
    points[points.length - 1] = `50,18`; 
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

const SPOT_ALL_DATA = [
  { id: 201, name: 'BTC', sub: 'Bitcoin', price: 77402.66, change: 0.56, isUp: true, cap: '$1.52 NT', vol: '$15.85 Tr' },
  { id: 202, name: 'ETH', sub: 'Ethereum', price: 2185.27, change: -0.7, isUp: false, cap: '$256.3 T', vol: '$5.56 Tr' },
  { id: 203, name: 'SOL', sub: 'Solana', price: 85.07, change: 0.41, isUp: true, cap: '$41.2 T', vol: '$1.82 Tr' },
  { id: 204, name: 'BNB', sub: 'BNB', price: 615.42, change: 1.15, isUp: true, cap: '$94.6 T', vol: '$688.8 Tr' },
  { id: 205, name: 'XRP', sub: 'Ripple', price: 1.3735, change: -0.14, isUp: false, cap: '$78.3 T', vol: '$4.67 Tr' },
  { id: 206, name: 'ADA', sub: 'Cardano', price: 0.524, change: 2.14, isUp: true, cap: '$18.2 T', vol: '$628 Tr' },
  { id: 207, name: 'LINK', sub: 'Chainlink', price: 18.25, change: -1.05, isUp: false, cap: '$10.8 T', vol: '$328 Tr' }
];

const FUTURES_ALL_DATA = [
  { id: 301, name: 'BTCUSDT-M', sub: 'BTC Vĩnh cửu', price: 77612.4, change: 0.91, isUp: true, cap: '$194.2 B', vol: '$5.8 B' },
  { id: 302, name: 'ETHUSDT-M', sub: 'ETH Vĩnh cửu', price: 2185.11, change: 0.68, isUp: true, cap: '$89.5 B', vol: '$2.6 B' },
  { id: 303, name: 'SOLUSDT-M', sub: 'SOL Vĩnh cửu', price: 85.068, change: -0.4, isUp: false, cap: '$41.2 B', vol: '$1.2 B' },
  { id: 304, name: 'DOGEUSDT-M', sub: 'DOGE Vĩnh cửu', price: 0.1038, change: -0.28, isUp: false, cap: '$15.9 B', vol: '$480M' },
  { id: 305, name: 'PEPEUSDT-M', sub: 'PEPE Vĩnh cửu', price: 0.00000368, change: 0.96, isUp: true, cap: '$8.4 B', vol: '$230M' },
  { id: 306, name: 'WIFUSDT-M', sub: 'WIF Vĩnh cửu', price: 0.1928, change: 1.26, isUp: true, cap: '$2.9 B', vol: '$85M' }
];

function AllMarkets() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [mainTab, setMainTab] = useState('all'); // 'all' | 'favorites' | 'spot' | 'futures'
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favoriteCoins') || '[]'));
  
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

  const toggleFavorite = (e, coinName) => {
    e.stopPropagation();
    let newFavs = [...favorites];
    if (newFavs.includes(coinName)) {
      newFavs = newFavs.filter(c => c !== coinName);
    } else {
      newFavs.push(coinName);
    }
    setFavorites(newFavs);
    localStorage.setItem('favoriteCoins', JSON.stringify(newFavs));
  };
  
  let baseData = [];
  if (mainTab === 'all') {
    const raw = ALL_MARKETS_DATA[activeSubTab] || [];
    baseData = [...raw];
    if (baseData.length > 0 && baseData.length < 20) {
      let expanded = [];
      for(let i=0; i<3; i++) expanded = expanded.concat(baseData.map(c => ({...c, id: c.id + i*100})));
      baseData = expanded;
    }
  } else if (mainTab === 'spot') {
    baseData = [...SPOT_ALL_DATA];
  } else if (mainTab === 'futures') {
    baseData = [...FUTURES_ALL_DATA];
  } else if (mainTab === 'favorites') {
    let allCoins = [...SPOT_ALL_DATA, ...FUTURES_ALL_DATA];
    Object.values(ALL_MARKETS_DATA).forEach(list => allCoins = allCoins.concat(list));
    const uniqueCoins = Array.from(new Map(allCoins.map(item => [item.name, item])).values());
    baseData = uniqueCoins.filter(c => favorites.includes(c.name));
  }

  const currentData = baseData.map(coin => {
    const live = globalPrices?.[coin.name];
    if (!live) return coin;
    return { ...coin, price: live.price, change: live.change, isUp: live.isUp };
  });

  return (
    <div className="alpha-markets-page">
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

      <div className="alpha-main-container">
        
        <div className="alpha-tabs-container" style={{marginTop: '24px'}}>
          <div className={"alpha-tab " + (mainTab === 'favorites' ? 'active' : '')} onClick={() => setMainTab('favorites')} style={{cursor: 'pointer'}}>Yêu thích</div>
          <div className={"alpha-tab " + (mainTab === 'all' ? 'active' : '')} onClick={() => setMainTab('all')} style={{cursor: 'pointer'}}>Tất cả</div>
          <div className={"alpha-tab " + (mainTab === 'spot' ? 'active' : '')} onClick={() => setMainTab('spot')} style={{cursor: 'pointer'}}>Giao ngay</div>
          <div className={"alpha-tab " + (mainTab === 'futures' ? 'active' : '')} onClick={() => setMainTab('futures')} style={{cursor: 'pointer'}}>Giao sau</div>
          <Link to="/markets/alpha" className="alpha-tab" style={{textDecoration:'none', color:'#848e9c'}}>Alpha</Link>
        </div>

        {mainTab === 'all' ? (
          <>
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
          </>
        ) : (
          <div className="alpha-sub-tabs" style={{borderBottom: 'none', marginBottom: '24px', justifyContent: 'flex-end'}}>
            <div className="alpha-tools">
              <div className="alpha-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Tìm kiếm" />
              </div>
            </div>
          </div>
        )}

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
                    <svg className="star-icon" onClick={(e) => toggleFavorite(e, coin.name)} width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(coin.name) ? '#F7931A' : 'none'} stroke={favorites.includes(coin.name) ? '#F7931A' : 'currentColor'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </td>
                  <td style={{textAlign: 'left'}}>
                    <div className="alpha-coin-cell">
                      <CoinLogo name={coin.name} />
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
