import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { useCoinPrice, INITIAL_COIN_PRICES } from '../contexts/PriceContext';
import './TradePage.css';

/* ─── Seeded PRNG (mulberry32) — same seed → same number always ─── */
function seededRand(seed) {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ─── Helpers ─── */
// coinSym is used as part of the seed so each coin has a unique but stable history
function generateCandles(currentPrice, count = 200, coinSym = '') {
  const coinHash = hashStr(coinSym || 'default');
  // Candle timestamps: each candle = 1 minute, ending count minutes ago
  // Round to the nearest minute boundary so times are stable on F5
  const nowMin = Math.floor(Date.now() / 1000 / 60);
  const startMin = nowMin - count;

  // Build raw candles with seeded random (seed = coinHash + candle minute)
  const rawCandles = [];
  let price = 100;
  for (let i = 0; i < count; i++) {
    const candleMin = startMin + i;
    const seed1 = coinHash + candleMin * 3;
    const seed2 = coinHash + candleMin * 3 + 1;
    const seed3 = coinHash + candleMin * 3 + 2;
    const seed4 = coinHash + candleMin * 3 + 3;
    const open = price;
    const chg = price * (seededRand(seed1) * 0.03 - 0.015);
    const close = open + chg;
    const high = Math.max(open, close) + Math.abs(price * seededRand(seed2) * 0.01);
    const low  = Math.min(open, close) - Math.abs(price * seededRand(seed3) * 0.01);
    rawCandles.push({ time: candleMin * 60, open, high, low, close, _seed4: seed4 });
    price = close;
  }

  // Shift all prices so the last close = currentPrice
  const ratio = currentPrice / rawCandles[rawCandles.length - 1].close;
  const candles = rawCandles.map(c => ({
    time:  c.time,
    open:  c.open  * ratio,
    high:  c.high  * ratio,
    low:   c.low   * ratio,
    close: c.close * ratio,
    _seed4: c._seed4,
  }));

  return { candles, lastPrice: currentPrice };
}

function generateVolume(candles) {
  return candles.map(c => ({
    time:  c.time,
    value: seededRand(c._seed4 ?? c.time) * 5000 + 500,
    color: c.close >= c.open ? 'rgba(0,255,163,0.4)' : 'rgba(246,70,93,0.4)',
  }));
}

function genOrderBook(price) {
  const asks = [], bids = [];
  for (let i = 0; i < 12; i++) {
    const pAsk = price * (1 + 0.001 * (12 - i));
    const pBid = price * (1 - 0.001 * (i + 1));
    const amt  = (Math.random() * 8 + 0.1).toFixed(2);
    asks.push({ price: pAsk, amount: amt, total: (pAsk * amt).toFixed(0) });
    bids.push({ price: pBid, amount: amt, total: (pBid * amt).toFixed(0) });
  }
  return { asks, bids };
}

const fmt = (v, digits = 2) => Number(v).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtP = (v) => {
  if (v < 0.01) return v.toPrecision(4);
  return fmt(v, 4);
};

/* ─── Component ─── */
export default function TradePage() {
  const { symbol } = useParams();
  const coin = symbol || 'BULL';

  const chartRef     = useRef(null);
  const chartInst    = useRef(null);
  const candleSRef   = useRef(null);
  const volSeriesRef = useRef(null);
  // Candle aggregation state (mutated in-place — no re-renders needed)
  const candleState  = useRef({ open: 0, high: 0, low: 0, minute: 0 });

  // Use REAL coin price from context as the base for historical candles
  const base = INITIAL_COIN_PRICES[coin] ?? coin.length * 50 + 10;

  // Live price driven entirely by global context
  const globalCoin = useCoinPrice(coin);
  const [livePrice, setLivePrice] = useState(base);
  const [prevPrice, setPrevPrice] = useState(base);
  const [obData,    setObData]    = useState(() => genOrderBook(base));
  const [tradeTab,  setTradeTab]   = useState('buy'); // 'buy' | 'sell'
  const [orderType, setOrderType]  = useState('market');
  const [activeTab, setActiveCoinTab] = useState(coin);
  const [tf,        setTf]         = useState('1m');
  const [bottomTab, setBottomTab]  = useState('open');
  const [chartTopTab, setChartTopTab] = useState('chart');

  /* ─── Build chart once ─── */
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: { background: { color: '#0b0e11' }, textColor: '#848e9c' },
      grid:   { vertLines: { color: '#1a1e27' }, horzLines: { color: '#1a1e27' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1e2329' },
      timeScale: { borderColor: '#1e2329', timeVisible: true, secondsVisible: false },
      width:  el.clientWidth,
      height: el.clientHeight,
    });
    chartInst.current = chart;

    // Use the FIXED initial price as anchor so ALL browsers generate identical history
    // (The live price feed will update the rightmost candle in real-time)
    const { candles, lastPrice } = generateCandles(base, 800, coin);

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00FFA3', downColor: '#F6465D',
      borderVisible: false,
      wickUpColor: '#00FFA3', wickDownColor: '#F6465D',
    });
    candleSeries.setData(candles);
    candleSRef.current = candleSeries;

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volSeries.setData(generateVolume(candles));
    volSeriesRef.current = volSeries;

    chart.timeScale().fitContent();

    // Seed candle aggregation state from end of historical data
    const nowMin = Math.floor(Date.now() / 1000 / 60);
    candleState.current = { open: lastPrice, high: lastPrice, low: lastPrice, minute: nowMin };
    setLivePrice(lastPrice);
    setPrevPrice(lastPrice);

    const onResize = () => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => { ro.disconnect(); chart.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin]);

  /* ─── Sync chart with global price context ───
   * Runs every time PriceContext emits a new price for this coin.
   * No independent timer needed — perfect sync across all pages.
   */
  useEffect(() => {
    if (!globalCoin) return;

    const newPrice = globalCoin.price;
    setPrevPrice(prev => prev);
    setLivePrice(prev => {
      setPrevPrice(prev);
      return newPrice;
    });

    // Update chart candle (1-minute aggregation)
    if (candleSRef.current) {
      const nowMin   = Math.floor(Date.now() / 1000 / 60);
      const candleTs = nowMin * 60;
      const cs       = candleState.current;

      if (nowMin !== cs.minute) {
        // New minute → close old candle, open new one
        cs.minute = nowMin;
        cs.open   = newPrice;
        cs.high   = newPrice;
        cs.low    = newPrice;
      } else {
        if (newPrice > cs.high) cs.high = newPrice;
        if (newPrice < cs.low)  cs.low  = newPrice;
      }

      candleSRef.current.update({
        time:  candleTs,
        open:  cs.open,
        high:  cs.high,
        low:   cs.low,
        close: newPrice,
      });

      // Volume bar synced with candle color
      if (volSeriesRef.current) {
        const volSeed = hashStr(coin + candleTs);
        volSeriesRef.current.update({
          time:  candleTs,
          value: seededRand(volSeed) * 3000 + 300,
          color: newPrice >= cs.open
            ? 'rgba(0,255,163,0.45)'
            : 'rgba(246,70,93,0.45)',
        });
      }
    }

    // Update order book with new price
    setObData(genOrderBook(newPrice));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalCoin]);

  const priceUp  = livePrice >= prevPrice;
  const priceCls = priceUp ? 'green' : 'red';

  const tabs = [
    { key: coin, label: coin, price: fmt(livePrice, 2), up: priceUp },
    { key: 'BTC',  label: 'BTC/USDT',  price: '77,390.98', up: true  },
    { key: 'ETH',  label: 'ETH/USDT',  price: '2,127.08',  up: true  },
  ];

  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h', '1d', '1w'];

  return (
    <div className="trade-page">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="trade-header">
        <Link to="/markets/alpha" className="trade-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B"/>
            <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B"/>
            <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B"/>
          </svg>
          <span className="trade-logo-text">KUCOIN</span>
        </Link>

        <div className="trade-coin-tabs">
          {tabs.map(t => (
            <div
              key={t.key}
              className={`trade-coin-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveCoinTab(t.key)}
            >
              <span>{t.label}</span>
              <span className={`tab-price ${t.up ? '' : 'down'}`}>{t.price}</span>
              <span className="close-btn">✕</span>
            </div>
          ))}
          <div className="trade-coin-tab">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#848e9c" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </div>

        <div className="trade-header-stats">
          <div className="trade-stat">
            <span className="trade-stat-label">Giá Cuối cùng</span>
            <span className={`trade-stat-value ${priceCls}`}>{fmt(livePrice, 2)}</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">24h Thay đổi</span>
            <span className="trade-stat-value green">+2.39 (+0.11%)</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">24h Cao</span>
            <span className="trade-stat-value">{fmt(livePrice * 1.05, 2)}</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">24h Thấp</span>
            <span className="trade-stat-value">{fmt(livePrice * 0.95, 2)}</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">Khối lượng 24h ({coin})</span>
            <span className="trade-stat-value">25.64</span>
          </div>
          <div className="trade-stat">
            <span className="trade-stat-label">Khối lượng 24h (USDT)</span>
            <span className="trade-stat-value">{fmt(livePrice * 25.64, 0)}</span>
          </div>
        </div>
      </header>

      {/* ═══════════ BODY ═══════════ */}
      <div className="trade-body">

        {/* ─── Left Toolbar ─── */}
        <div className="trade-left-toolbar">
          {[
            <svg key="cursor" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>,
            <svg key="cross" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
            <svg key="line" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="3" y1="21" x2="21" y2="3"/></svg>,
            <svg key="rect" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"/></svg>,
            <svg key="fib" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
            <svg key="text" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h14"/></svg>,
          ].map((icon, i) => (
            <div key={i} className="toolbar-btn">{icon}</div>
          ))}
          <div className="toolbar-divider"/>
          <div className="toolbar-btn">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/></svg>
          </div>
        </div>

        {/* ─── Chart Area ─── */}
        <div className="trade-chart-area">
          <div className="chart-top-bar">
            <div className="chart-top-bar-tabs">
              {[{k:'chart',l:'Biểu đồ'},{k:'depth',l:'Nguồn cấp dữ liệu'},{k:'info',l:'Thông tin Coin'}].map(t=>(
                <div key={t.k} className={`chart-top-tab ${chartTopTab===t.k?'active':''}`} onClick={()=>setChartTopTab(t.k)}>{t.l}</div>
              ))}
            </div>
            <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px'}}>
              <svg width="14" height="14" fill="none" stroke="#848e9c" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <svg width="14" height="14" fill="none" stroke="#848e9c" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="8 3 4 3 4 21 20 21 20 17"/><rect x="8" y="3" width="12" height="12" rx="1"/></svg>
            </div>
          </div>

          <div className="chart-timeframe-bar">
            <span style={{color:'#848e9c',fontSize:'11px',marginRight:'6px'}}>Thời gian</span>
            {timeframes.map(t => (
              <button key={t} className={`tf-btn ${tf===t?'active':''}`} onClick={()=>setTf(t)}>{t}</button>
            ))}
            <div className="tf-separator"/>
            <button className="tf-btn">N</button>
            <button className="tf-btn">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <button className="tf-btn">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </button>
            <div style={{marginLeft:'auto', display:'flex', gap:'4px'}}>
              <button className="tf-btn">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <button className="tf-btn">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </div>

          <div className="chart-container">
            <div ref={chartRef} className="chart-inner"/>
          </div>
        </div>

        {/* ─── Order Book ─── */}
        <div className="trade-orderbook-panel">
          <div className="ob-header">
            <div className={`ob-tab ${true?'active':''}`}>Sổ lệnh</div>
            <div className="ob-tab">Giao dịch mới</div>
          </div>
          <div className="ob-col-header">
            <span>Tỷ lệ</span>
            <span>Số tiền</span>
            <span>Tổng</span>
          </div>
          <div className="ob-list">
            <div className="ob-asks">
              {obData.asks.map((row, i) => (
                <div key={i} className="ob-row ask">
                  <div className="ob-row-bar" style={{width:`${20+i*5}%`}}/>
                  <span className="ob-price-ask">{fmtP(row.price)}</span>
                  <span className="ob-amount">{row.amount}</span>
                  <span className="ob-total">{Number(row.total).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={`ob-current-price ${priceCls}`}>
              <span style={{fontSize:'15px', fontWeight:'bold'}}>{fmt(livePrice, 2)}</span>
              {priceUp
                ? <svg width="12" height="12" fill="#00FFA3" viewBox="0 0 24 24"><path d="M12 5l7 7H5z"/></svg>
                : <svg width="12" height="12" fill="#F6465D" viewBox="0 0 24 24"><path d="M12 19l7-7H5z"/></svg>}
              <span className="mark">${fmt(livePrice, 2)}</span>
            </div>

            <div className="ob-bids">
              {obData.bids.map((row, i) => (
                <div key={i} className="ob-row bid">
                  <div className="ob-row-bar" style={{width:`${20+(11-i)*5}%`}}/>
                  <span className="ob-price-bid">{fmtP(row.price)}</span>
                  <span className="ob-amount">{row.amount}</span>
                  <span className="ob-total">{Number(row.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:'6px 8px', fontSize:'11px', color:'#848e9c', textAlign:'right', borderTop:'1px solid #1e2329'}}>
            <span>25 75%</span>
          </div>
        </div>

        {/* ─── Right Trading Panel ─── */}
        <div className="trade-right-panel">
          <div className="rp-tab-bar">
            <div className={`rp-tab ${true?'active':''}`}>Thị trường</div>
            <div className="rp-tab">Bot</div>
          </div>
          <div className="rp-body">

            <div className="rp-buy-sell">
              <button className={`rp-bs-btn buy ${tradeTab==='buy'?'active':''}`} onClick={()=>setTradeTab('buy')}>Chào</button>
              <button className={`rp-bs-btn sell ${tradeTab==='sell'?'active':''}`} onClick={()=>setTradeTab('sell')}>Chào +</button>
            </div>

            <div className="rp-order-type">
              {['limit','market','condition'].map(t=>(
                <button key={t} className={`rp-ot-btn ${orderType===t?'active':''}`} onClick={()=>setOrderType(t)}>
                  {t==='limit'?'Giới hạn':t==='market'?'Thị trường':'Có điều kiện'}
                </button>
              ))}
            </div>

            <div className="rp-input-row">
              <div className="rp-label">
                <span>Giá hạn</span>
                <span style={{color:'#00FFA3'}}>Mới nhất</span>
              </div>
              <div className="rp-input-wrap">
                <span className="rp-input-label-left">Giá</span>
                <input type="text" defaultValue={fmt(livePrice, 2)} key={fmt(livePrice,2)}/>
                <span className="rp-input-unit">USDT</span>
              </div>
            </div>

            <div className="rp-input-row">
              <div className="rp-label">
                <span>Mở vị thế (TTG)</span>
                <span style={{color:'#848e9c'}}>Khả dụng 0 USDT</span>
              </div>
              <div className="rp-input-wrap">
                <span className="rp-input-label-left">0,00</span>
                <input type="number" placeholder="0.00"/>
                <span className="rp-input-unit">USDT</span>
              </div>
            </div>

            <div className="rp-input-row">
              <div className="rp-input-wrap">
                <span className="rp-input-label-left">0,00</span>
                <input type="number" placeholder="0.00"/>
                <span className="rp-input-unit">{coin}</span>
              </div>
            </div>

            <div>
              <input type="range" className="rp-slider" min="0" max="100" defaultValue="0"/>
              <div className="rp-pct-labels">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>

            <button className={`rp-submit-btn ${tradeTab==='sell'?'sell-btn':''}`}>
              Kích hoạt Giao dịch Futures
            </button>

            <div className="rp-info-box">
              <svg width="14" height="14" fill="none" stroke="#848e9c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Kiếm tiền tự động. Không lo kiến, giao dịch tốt đẹp ở tốc nào.</span>
            </div>
          </div>

          <div className="rp-overview">
            <div className="rp-overview-title">Tổng quan</div>
            {[
              ['Hợp đồng', 'ETH/USDT Vĩnh Viễn'],
              ['Tỷ giá tài trợ', '0.01%'],
              ['Tỷ lệ Mở', '—'],
              ['GÙN M', '—'],
              ['Số lý đủ bộ', '— JSDT'],
              ['Bộ tiêu đó thống', '0 —USDT'],
              ['Số lý giải thưởng', '0 —USDT'],
              ['Tỷ lệ PNL thực', '—'],
            ].map(([k,v]) => (
              <div className="rp-overview-row" key={k}>
                <span className="rp-overview-key">{k}</span>
                <span className="rp-overview-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ BOTTOM PANEL ═══════════ */}
      <div className="trade-bottom-panel">
        <div className="bp-tab-bar">
          {[
            {k:'open', l:'Lệnh giao dịch mở (0)'},
            {k:'pos',  l:'Vị thế (3)'},
            {k:'asset',l:'Tài sản'},
            {k:'hist', l:'Lịch sử đặt lệnh'},
            {k:'trade',l:'Lịch sử giao dịch'},
            {k:'algo', l:'Thuật toán giao dịch (0)'},
            {k:'cond', l:'Lệnh có điều kiện (0)'},
          ].map(t=>(
            <div key={t.k} className={`bp-tab ${bottomTab===t.k?'active':''}`} onClick={()=>setBottomTab(t.k)}>{t.l}</div>
          ))}
          <div className="bp-controls">
            <button className="bp-ctrl-btn">Hợp đồng điều kiện ▾</button>
            <button className="bp-ctrl-btn">Điều kiện điều kiện 0x</button>
            <button className="bp-ctrl-btn">Lệnh điều kiện 0x</button>
          </div>
        </div>
        <div className="bp-content">
          <svg width="40" height="40" fill="none" stroke="#5e6673" strokeWidth="1" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span>Sổ đặt Khai dụng — JSDT</span>
        </div>
      </div>

    </div>
  );
}
