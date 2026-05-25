import { createContext, useContext, useState, useEffect, useRef } from 'react';

/* ── Danh sách tất cả coin với giá khởi đầu ── */
const INITIAL_COINS = {
  // Alpha
  BULL:      { price: 0.00479   },
  DEGEN:     { price: 0.001735  },
  BSO:       { price: 0.77337   },
  UP:        { price: 0.28334   },
  ESPORTS:   { price: 0.79886   },
  VIRL:      { price: 0.002996  },
  RTX:       { price: 1.36045   },
  BABYTROLL: { price: 0.000912  },
  EITHER:    { price: 0.16539   },
  SKYAI:     { price: 0.31262   },
  SPCX:      { price: 0.002395  },
  TITAN:     { price: 0.045059  },
  WORLDCUP:  { price: 0.004468  },
  sato:      { price: 0.78079   },
  Goblin:    { price: 0.009554  },
  AWF:       { price: 0.007199  },
  RAGEGUY:   { price: 0.002628  },
  HANTA:     { price: 0.000725  },
  BURNIE:    { price: 0.007445  },
  USDUC:     { price: 0.005204  },
  ASTEROID:  { price: 0.000313  },
  PAYAI:     { price: 0.008607  },
  MAGA:      { price: 0.008158  },
  chudhouse: { price: 0.000121  },
  GME:       { price: 0.000822  },
  quq:       { price: 0.003109  },
  // All markets
  BTC:   { price: 77390.98 },
  ETH:   { price: 2127.08  },
  ZEC:   { price: 582.76   },
  XMR:   { price: 338.20   },
  AAVE:  { price: 87.68    },
  NEAR:  { price: 1.65     },
  TAO:   { price: 263.06   },
  UNI:   { price: 8.6      },
  // Meme
  SHIB:  { price: 0.00000574   },
  DOGE:  { price: 0.10386562   },
  PEPE:  { price: 0.0000036899 },
  WIF:   { price: 0.19288759   },
  BONK:  { price: 0.00000602   },
  FLOKI: { price: 0.00003021   },
  BRETT: { price: 0.00755767   },
  // Storage
  FIL:   { price: 0.95315038  },
  STORJ: { price: 0.11257603  },
  AR:    { price: 2.16         },
  DATA:  { price: 0.00062571  },
  SKL:   { price: 0.00607331  },
  ELA:   { price: 0.45340071  },
  ALEPH: { price: 0.01628207  },
  // Supply chain
  VET:   { price: 0.00659373  },
  // Media
  THETA: { price: 0.19828165  },
  AIOZ:  { price: 0.06672652  },
  KIN:   { price: 0.00506442  },
  WAXP:  { price: 0.00619318  },
  TFUEL: { price: 0.01058834  },
};

const COIN_KEYS = Object.keys(INITIAL_COINS);

// Mapping from local symbols to Binance USDT pairs
const BINANCE_MAPPING = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  ZEC: 'ZECUSDT',
  XMR: 'XMRUSDT',
  AAVE: 'AAVEUSDT',
  NEAR: 'NEARUSDT',
  TAO: 'TAOUSDT',
  UNI: 'UNIUSDT',
  SHIB: 'SHIBUSDT',
  DOGE: 'DOGEUSDT',
  PEPE: 'PEPEUSDT',
  WIF: 'WIFUSDT',
  BONK: 'BONKUSDT',
  FLOKI: 'FLOKIUSDT',
  BRETT: 'BRETTUSDT',
  FIL: 'FILUSDT',
  STORJ: 'STORJUSDT',
  AR: 'ARUSDT',
  DATA: 'DATAUSDT',
  SKL: 'SKLUSDT',
  ELA: 'ELAUSDT',
  ALEPH: 'ALEPHUSDT',
  VET: 'VETUSDT',
  THETA: 'THETAUSDT',
  AIOZ: 'AIOZUSDT',
  KIN: 'KINUSDT',
  WAXP: 'WAXPUSDT',
  TFUEL: 'TFUELUSDT',
};

const REVERSE_BINANCE_MAPPING = Object.fromEntries(
  Object.entries(BINANCE_MAPPING).map(([k, v]) => [v, k])
);

// Global mutable cache of real-world prices
const LATEST_REAL_PRICES = {};

// ─── Seeded Pseudo-Random (mulberry32) — same seed → same number ──────────────
function seededRand(seed) {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const COIN_HASHES = Object.fromEntries(COIN_KEYS.map(k => [k, hashStr(k)]));

// ─── Fixed epoch: Jan 1, 2026 00:00:00 UTC — NEVER changes across days ────────
const FIXED_EPOCH_SEC = 1767225600; // 2026-01-01T00:00:00Z
const MACRO_BUCKET_SEC = 300;       // 5-minute macro buckets for long history (~40k/year, fast)
const MICRO_BUCKET_SEC = 2;         // 2-second micro buckets for live smooth updates

// ─── Apply one 5-minute macro bucket (used for historical fast-forward) ────────
function applyMacroBucket(state, bucket) {
  COIN_KEYS.forEach(key => {
    const coinHash = COIN_HASHES[key];
    const r1 = seededRand(bucket * 7919 + coinHash * 31);
    const r2 = seededRand(bucket * 7919 + coinHash * 31 + 17);

    const p = state[key].price;
    const delta = p * (r1 * 0.02 - 0.01);
    const newP  = Math.max(p + delta, p * 0.0001);
    let chg = state[key].change + (r2 * 2 - 1);
    if (chg >  15) chg =  2;
    if (chg < -15) chg = -2;

    state[key] = {
      price:  newP,
      prev:   p,
      change: parseFloat(chg.toFixed(2)),
      isUp:   newP >= p,
      isReal: false,
    };
  });
}

// ─── Apply one 2-second micro bucket (live updates inside current 5-min window) ─
function applyMicroBucket(state, microBucket) {
  COIN_KEYS.forEach(key => {
    const coinHash = COIN_HASHES[key];
    const r1 = seededRand(microBucket * 131 + coinHash);
    const r2 = seededRand(microBucket * 131 + coinHash + 7);

    const p = state[key].price;
    const delta = p * (r1 * 0.004 - 0.002);
    const newP  = Math.max(p + delta, p * 0.0001);
    let chg = state[key].change + (r2 * 0.2 - 0.1);
    if (chg >  15) chg =  2;
    if (chg < -15) chg = -2;

    state[key] = {
      price:  newP,
      prev:   p,
      change: parseFloat(chg.toFixed(2)),
      isUp:   newP >= p,
      isReal: false,
    };
  });
}

// ─── Build CURRENT state: deterministic, same result regardless of when user opens ─
function buildCurrentState() {
  const state = Object.fromEntries(
    COIN_KEYS.map(k => [k, {
      price:  INITIAL_COINS[k].price,
      prev:   INITIAL_COINS[k].price,
      change: 0,
      isUp:   false,
      isReal: false,
    }])
  );

  return state;
}

export function computeCurrentCoinPrice(coinKey) {
  if (LATEST_REAL_PRICES[coinKey]) {
    return LATEST_REAL_PRICES[coinKey].price;
  }

  const initialPrice = INITIAL_COINS[coinKey]?.price;
  if (initialPrice === undefined) return null;

  return initialPrice;
}

export const INITIAL_COIN_PRICES = Object.fromEntries(
  COIN_KEYS.map(k => [k, INITIAL_COINS[k].price])
);

export const PriceContext = createContext(null);

export function PriceProvider({ children }) {
  const [prices, setPrices] = useState(buildCurrentState);

  const lastMicroRef = useRef(Math.floor(Date.now() / 1000 / MICRO_BUCKET_SEC));
  const lastMacroRef = useRef(Math.floor(Date.now() / 1000 / MACRO_BUCKET_SEC));
  const coinOffsetsRef = useRef({});

  // Initialize and synchronise Binance live prices
  useEffect(() => {
    let ws = null;
    let isClosed = false;

    const fetchInitialRealPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!res.ok) throw new Error('Failed to fetch Binance prices');
        const data = await res.json();
        
        const updates = {};
        data.forEach(item => {
          const coinKey = REVERSE_BINANCE_MAPPING[item.symbol];
          if (coinKey) {
            const priceVal = parseFloat(item.lastPrice);
              const changePercent = parseFloat(item.priceChangePercent);
            if (!isNaN(priceVal)) {
              const offset = coinOffsetsRef.current[coinKey] || 0;
              const adjustedPrice = priceVal * (1 + offset);
              updates[coinKey] = {
                price: adjustedPrice,
                prev: adjustedPrice,
                change: isNaN(changePercent) ? 0 : parseFloat(changePercent.toFixed(2)),
                isUp: changePercent >= 0,
                isReal: true,
                rawPrice: priceVal,
              };
              LATEST_REAL_PRICES[coinKey] = updates[coinKey];
            }
          }
        });

        if (Object.keys(updates).length > 0) {
          setPrices(prev => {
            const next = { ...prev };
            Object.entries(updates).forEach(([key, val]) => {
              next[key] = val;
            });
            return next;
          });
        }
      } catch (err) {
        console.warn('Could not initialize real prices:', err);
      }
    };

    fetchInitialRealPrices();

    function connectWS() {
      if (isClosed) return;
      
      ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

      ws.onmessage = (event) => {
        try {
          const arr = JSON.parse(event.data);
          if (!Array.isArray(arr)) return;

          const updates = {};
          arr.forEach(item => {
            const coinKey = REVERSE_BINANCE_MAPPING[item.s];
            if (coinKey) {
              const price = parseFloat(item.c);
              const open = parseFloat(item.o);
              if (!isNaN(price) && !isNaN(open) && open > 0) {
                const offset = coinOffsetsRef.current[coinKey] || 0;
                const adjustedPrice = price * (1 + offset);
                const change = ((adjustedPrice - open) / open) * 100;
                updates[coinKey] = {
                  price: adjustedPrice,
                  change: parseFloat(change.toFixed(2)),
                  isUp: adjustedPrice >= open,
                  isReal: true,
                  rawPrice: price
                };
              }
            }
          });

          if (Object.keys(updates).length > 0) {
            setPrices(prev => {
              const next = { ...prev };
              Object.entries(updates).forEach(([key, val]) => {
                const oldPrice = prev[key]?.price ?? val.price;
                next[key] = {
                  ...val,
                  prev: oldPrice,
                  isUp: val.price >= oldPrice
                };
                LATEST_REAL_PRICES[key] = next[key];
              });
              return next;
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Binance WebSocket error:', err);
      };

      ws.onclose = () => {
        console.warn('Binance WebSocket closed, reconnecting in 5s...');
        setTimeout(() => {
          if (!isClosed) connectWS();
        }, 5000);
      };
    }

    connectWS();

    return () => {
      isClosed = true;
      if (ws) ws.close();
    };
  }, []);

  // Fetch custom coin prices from backend every 2 seconds
  useEffect(() => {
    const fetchBackendPrices = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/prices');
        if (!res.ok) throw new Error('Failed to fetch backend prices');
        const data = await res.json();
        const serverPrices = data.prices || data;
        const coinOffsets = data.coinOffsets || {};
        coinOffsetsRef.current = coinOffsets;
        
        setPrices(prev => {
          const next = { ...prev };
          
          // Apply coin offset to real coins
          Object.keys(next).forEach(key => {
            if (next[key].isReal && LATEST_REAL_PRICES[key]) {
               const rawPrice = LATEST_REAL_PRICES[key].rawPrice || LATEST_REAL_PRICES[key].price;
               if (!LATEST_REAL_PRICES[key].rawPrice) {
                 LATEST_REAL_PRICES[key].rawPrice = LATEST_REAL_PRICES[key].price;
               }
               const offset = coinOffsets[key] || 0;
               const newPrice = rawPrice * (1 + offset);
               next[key].price = newPrice;
               next[key].isUp = newPrice >= next[key].prev;
            }
          });

          Object.entries(serverPrices).forEach(([key, val]) => {
            // Only update custom coins from backend
            if (next[key] && !next[key].isReal) {
              const oldPrice = next[key].price;
              next[key] = {
                price: val.price,
                prev: oldPrice,
                change: val.change,
                isUp: val.price >= oldPrice,
                isReal: false,
                backendSynced: true
              };
              LATEST_REAL_PRICES[key] = next[key];
            }
          });
          return next;
        });
      } catch (err) {
        console.warn('Could not fetch custom prices from backend:', err);
      }
    };

    fetchBackendPrices();
    const interval = setInterval(fetchBackendPrices, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PriceContext.Provider value={prices}>
      {children}
    </PriceContext.Provider>
  );
}

export const usePrices = () => useContext(PriceContext);
export const useCoinPrice = (symbol) => {
  const prices = usePrices();
  return prices?.[symbol] ?? null;
};
