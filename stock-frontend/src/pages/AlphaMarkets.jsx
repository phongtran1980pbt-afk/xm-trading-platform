import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrices } from '../contexts/PriceContext';
import './AlphaMarkets.css';

const INITIAL_MOCK_DATA = [
  { id: 1, name: 'quq', address: '0x4fa7...03Bf', price: 0.0031091, change: 5.39, isUp: true, vol: '79.063', volSub: '39.734/40.229', uniqueAddr: '3.163', holders: '50.349', totalVol: '$388.97 Tr', liquidity: '$284.581,55' },
  { id: 2, name: 'DEGEN', address: 'Fm3c...pump', price: 0.001735, change: 10.70, isUp: true, vol: '44.853', volSub: '21.928/22.925', uniqueAddr: '19.290', holders: '5.600', totalVol: '$3.34 Tr', liquidity: '$231.034,5' },
  { id: 3, name: 'BSO', address: 'DeD8Sd...78ec', price: 0.77337, change: 15.14, isUp: true, vol: '50.221', volSub: '26.240/23.981', uniqueAddr: '2.336', holders: '58.222', totalVol: '$9.74 Tr', liquidity: '$3.18 Tỷ' },
  { id: 4, name: 'UP', address: 'Dx0000...0000', price: 0.28334, change: 15.22, isUp: true, vol: '21.795', volSub: '11.106/10.689', uniqueAddr: '1.285', holders: '5.455', totalVol: '$12.62 Tr', liquidity: '$4.22 Tỷ' },
  { id: 5, name: 'ESPORTS', address: 'Dd39c...BC42', price: 0.79886, change: 14.29, isUp: true, vol: '90.015', volSub: '44.424/45.521', uniqueAddr: '2.138', holders: '83.033', totalVol: '$8.89 Tr', liquidity: '$2.35 Tỷ' },
  { id: 6, name: 'VIRL', address: 'EkwH...S...pump', price: 0.0029962, change: 104.49, isUp: true, vol: '20.288', volSub: '9.743/10.545', uniqueAddr: '3.218', holders: '3.585', totalVol: '$2.04 Tr', liquidity: '$379.885,99' },
  { id: 7, name: 'RTX', address: 'Dx4829...98B3', price: 1.36045, change: 0.04, isUp: true, vol: '25.295', volSub: '13.722/11.573', uniqueAddr: '5.592', holders: '11.581', totalVol: '$7.58 Tr', liquidity: '$1.13 Tỷ' },
  { id: 8, name: 'BABYTROLL', address: '8qdz1x...pump', price: 0.00091236, change: -39.81, isUp: false, vol: '15.037', volSub: '6.004/9.033', uniqueAddr: '4.060', holders: '5.841', totalVol: '$896.679,94', liquidity: '$219.652,17' },
  { id: 9, name: 'EITHER', address: 'Hm5dmB...noel', price: 0.16539, change: -2.92, isUp: false, vol: '31.358', volSub: '18.394/12.964', uniqueAddr: '2.808', holders: '18.338', totalVol: '$2.25 Tr', liquidity: '$484.783,35' },
  { id: 10, name: 'SKYAI', address: 'Dx82aa...fc1e', price: 0.31262, change: 10.56, isUp: true, vol: '22.990', volSub: '11.196/11.794', uniqueAddr: '1.417', holders: '54.922', totalVol: '$10.51 Tr', liquidity: '$12.68 Tỷ' },
  { id: 11, name: 'SPCX', address: 'E5fP2...pump', price: 0.002395, change: 50.81, isUp: true, vol: '6.159', volSub: '3.059/3.100', uniqueAddr: '1.529', holders: '4.152', totalVol: '$591.849,78', liquidity: '$274.060,83' },
  { id: 12, name: 'TITAN', address: '0x0214...4e44', price: 0.045059, change: -3.34, isUp: false, vol: '17', volSub: '7/10', uniqueAddr: '11', holders: '4.349', totalVol: '$429,56', liquidity: '$55.930,5' },
  { id: 13, name: 'WORLDCUP', address: '33eumB...pump', price: 0.0044681, change: 36.49, isUp: true, vol: '5.125', volSub: '2.904/2.221', uniqueAddr: '1.816', holders: '10.779', totalVol: '$543.899,28', liquidity: '$720.312,71' },
  { id: 14, name: 'sato', address: '0x125f...74D8', price: 0.78079, change: 86.04, isUp: true, vol: '2.356', volSub: '1.362/994', uniqueAddr: '1.168', holders: '9.383', totalVol: '$2.04 Tr', liquidity: '$2.89 Tỷ' },
  { id: 15, name: 'Goblin', address: '3KHWZ1...pump', price: 0.0095542, change: -12.50, isUp: false, vol: '5.936', volSub: '3.138/2.798', uniqueAddr: '1.331', holders: '8.559', totalVol: '$939.706,87', liquidity: '$1.11 Tỷ' },
  { id: 16, name: 'AWF', address: '0x12e7...a1e3', price: 0.0071987, change: -18.74, isUp: false, vol: '1.733', volSub: '943/790', uniqueAddr: '745', holders: '2.323', totalVol: '$809.013,06', liquidity: '$539.952,46' },
  { id: 17, name: 'RAGEGUY', address: 'GwWzsr...pump', price: 0.0026282, change: -11.06, isUp: false, vol: '3.766', volSub: '2.034/1.732', uniqueAddr: '766', holders: '4.287', totalVol: '$447.401,65', liquidity: '$197.367,77' },
  { id: 18, name: 'HANTA', address: '2Ekpqu...zy3y', price: 0.00072476, change: -23.50, isUp: false, vol: '3.084', volSub: '1.673/1.411', uniqueAddr: '1.136', holders: '17.662', totalVol: '$270.695,2', liquidity: '$197.050,7' },
  { id: 19, name: 'BULL', address: '3TYqKw...pump', price: 0.0047903, change: 1.89, isUp: true, vol: '16.076', volSub: '7.981/8.095', uniqueAddr: '860', holders: '10.877', totalVol: '$718.605,66', liquidity: '$624.363,89' },
  { id: 20, name: 'BURNIE', address: 'CGEDT9...pump', price: 0.0074449, change: 19.43, isUp: true, vol: '6.207', volSub: '3.265/2.942', uniqueAddr: '1.497', holders: '10.576', totalVol: '$850.454,18', liquidity: '$1.3 Tỷ' },
  { id: 21, name: 'USDUC', address: 'C89dbu...pump', price: 0.0052043, change: -11.06, isUp: false, vol: '2.478', volSub: '1.213/1.265', uniqueAddr: '463', holders: '15.372', totalVol: '$213.602,35', liquidity: '$724.917,44' },
  { id: 22, name: 'ASTEROID', address: '0xf380...4c26', price: 0.00031315, change: 1.44, isUp: true, vol: '1.317', volSub: '742/575', uniqueAddr: '715', holders: '25.582', totalVol: '$1.41 Tr', liquidity: '$15.68 Tỷ' },
  { id: 23, name: 'PAYAI', address: 'EXYms5...Dcfu', price: 0.0086074, change: -6.17, isUp: false, vol: '1.113', volSub: '784/329', uniqueAddr: '280', holders: '5.782', totalVol: '$198.281,52', liquidity: '$572.822,58' },
  { id: 24, name: 'MAGA', address: 'Hcn2H...pump', price: 0.0081577, change: -6.16, isUp: false, vol: '3.733', volSub: '1.765/1.968', uniqueAddr: '951', holders: '12.232', totalVol: '$552.280,18', liquidity: '$668.089,45' },
  { id: 25, name: 'chudhouse', address: 'vKo7Q...pump', price: 0.00012142, change: -27.95, isUp: false, vol: '4.968', volSub: '2.175/2.793', uniqueAddr: '469', holders: '2.008', totalVol: '$107.049,51', liquidity: '$72.176,1' },
  { id: 26, name: 'GME', address: '8wXtPe...HeB', price: 0.00082243, change: -1.10, isUp: false, vol: '329', volSub: '185/144', uniqueAddr: '130', holders: '17.183', totalVol: '$20.208,54', liquidity: '$1.37 Tỷ' }
];

function formatPrice(val) {
  let str = val.toString();
  if (str.includes('e')) {
    str = val.toFixed(10).replace(/0+$/, '');
  }
  return '$' + str.replace('.', ',');
}

function AlphaMarkets() {
  const navigate = useNavigate();
  const globalPrices = usePrices();

  // Merge global prices into each coin row
  const data = INITIAL_MOCK_DATA.map(coin => {
    const live = globalPrices?.[coin.name];
    if (!live) return coin;
    return {
      ...coin,
      price:  live.price,
      change: live.change,
      isUp:   live.isUp,
    };
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
        <h1 className="alpha-page-title">Tổng quan thị trường</h1>

        {/* OVERVIEW GRID */}
        <div className="alpha-overview-grid">
          {/* Box 1 */}
          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Xu hướng &gt;</span>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#F7931A', color: '#fff'}}>B</div>
                <span className="alpha-coin-symbol">BTC</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$77.402,66</span>
                <span className="alpha-price-change text-green">+0,56% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FFD700', color: '#000'}}>X</div>
                <span className="alpha-coin-symbol">XAUT</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$4.481,18</span>
                <span className="alpha-price-change text-red">-1,09% ▼</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#24DB9B', color: '#fff'}}>K</div>
                <span className="alpha-coin-symbol">KCS</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$7,94</span>
                <span className="alpha-price-change text-red">-1,42% ▼</span>
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Coin mới &gt;</span>
              <span className="text-gray">00d 34h 01m 00s<br/>Đếm ngược đến khi ra mắt</span>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#000', color: '#fff'}}>N</div>
                <span className="alpha-coin-symbol">NEX</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF4500', color: '#fff'}}>Z</div>
                <span className="alpha-coin-symbol">ZEST</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,1488361</span>
                <span className="alpha-price-change text-green">+893,33% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF8C00', color: '#fff'}}>A</div>
                <span className="alpha-coin-symbol">ATWO</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,00928977</span>
                <span className="alpha-price-change text-red">-40,83% ▼</span>
              </div>
            </div>
          </div>

          {/* Box 3 */}
          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Top tăng giá &gt;</span>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF4500', color: '#fff'}}>Z</div>
                <span className="alpha-coin-symbol">ZEST</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,1488361</span>
                <span className="alpha-price-change text-green">+893,33% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF1493', color: '#fff'}}>L</div>
                <span className="alpha-coin-symbol">LYX</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,36020774</span>
                <span className="alpha-price-change text-green">+72,27% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item">
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#4B0082', color: '#fff'}}>N</div>
                <span className="alpha-coin-symbol">NUMI</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,02228545</span>
                <span className="alpha-price-change text-green">+50,23% ▲</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="alpha-tabs-container">
          <div className="alpha-tab">Yêu thích</div>
          <Link to="/markets/all" className="alpha-tab" style={{textDecoration:'none', color:'#848e9c'}}>Tất cả</Link>
          <div className="alpha-tab">Giao ngay</div>
          <div className="alpha-tab">Giao sau</div>
          <div className="alpha-tab active">Alpha</div>
        </div>

        {/* SUB TABS & TOOLS */}
        <div className="alpha-sub-tabs">
          <div className="alpha-pills">
            <button className="alpha-pill">Đã chọn</button>
            <button className="alpha-pill">Trên chuỗi</button>
            <button className="alpha-pill active">Tất cả</button>
            <button className="alpha-pill bordered">Mới <span style={{color:'#24DB9B'}}>2</span></button>
            <button className="alpha-pill bordered">Solana</button>
            <button className="alpha-pill bordered">BSC</button>
            <button className="alpha-pill bordered">Ethereum</button>
          </div>
          <div className="alpha-tools">
            <div className="alpha-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Tìm kiếm" />
            </div>
            <div className="alpha-filter-btn">
              24 giờ ▾
            </div>
            <div className="alpha-filter-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Bộ lọc
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="alpha-table-wrapper">
          <table className="alpha-table">
            <thead>
              <tr>
                <th style={{width: '30px'}}>#</th>
                <th>Tên</th>
                <th>Giá ↕</th>
                <th>Thay đổi ↕</th>
                <th>Giao dịch ↕</th>
                <th style={{textAlign: 'center'}}>Địa chỉ giao dịch<br/>duy nhất ↕</th>
                <th>Người nắm giữ ↕</th>
                <th>Khối lượng ↕</th>
                <th>Tính thanh<br/>khoản ↕</th>
              </tr>
            </thead>
            <tbody>
              {data.map((coin, index) => (
                <tr key={coin.id} style={{cursor: 'pointer'}} onClick={() => navigate(`/trade/${coin.name}`)}>
                  <td>
                    <svg className="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </td>
                  <td>
                    <div className="alpha-coin-cell">
                      <div className="alpha-coin-icon" style={{background: index % 2 === 0 ? '#ffb900' : '#4169e1', color: '#fff'}}>{coin.name[0]}</div>
                      <div>
                        <div className="alpha-coin-symbol-large">{coin.name}</div>
                        <div className="alpha-coin-address">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          {coin.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontWeight: '500'}}>{formatPrice(coin.price)}</td>
                  <td className={coin.isUp ? 'text-green' : 'text-red'} style={{fontWeight: '500'}}>
                    {coin.change > 0 ? '+' : ''}{coin.change}% {coin.isUp ? '▲' : '▼'}
                  </td>
                  <td>
                    <div className="alpha-vol-wrap">
                      <span style={{fontWeight: '500', color: '#fff'}}>{coin.vol}</span>
                      <span className="alpha-vol-sub"><span className="text-green">{coin.volSub.split('/')[0]}</span>/<span className="text-red">{coin.volSub.split('/')[1]}</span></span>
                    </div>
                  </td>
                  <td style={{textAlign: 'center', fontWeight: '500', color: '#fff'}}>{coin.uniqueAddr}</td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{coin.holders}</td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{coin.totalVol}</td>
                  <td style={{fontWeight: '500', color: '#fff'}}>{coin.liquidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="alpha-pagination">
          <button className="alpha-page-btn">&lt;</button>
          <button className="alpha-page-btn active">1</button>
          <button className="alpha-page-btn">2</button>
          <button className="alpha-page-btn">3</button>
          <button className="alpha-page-btn">4</button>
          <button className="alpha-page-btn">5</button>
          <button className="alpha-page-btn">6</button>
          <button className="alpha-page-btn">7</button>
          <span style={{color: '#848e9c'}}>...</span>
          <button className="alpha-page-btn">21</button>
          <button className="alpha-page-btn">&gt;</button>
        </div>

      </div>
    </div>
  );
}

export default AlphaMarkets;
