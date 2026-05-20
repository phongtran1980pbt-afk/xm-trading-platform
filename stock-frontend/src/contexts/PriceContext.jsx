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

// ─── Seeded Pseudo-Random (mulberry32) ───────────────────────────────────────
// Same seed → same number. Used to make all browsers compute identical prices.
function seededRand(seed) {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Stable integer hash of a string (for per-coin offset)
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const COIN_HASHES = Object.fromEntries(COIN_KEYS.map(k => [k, hashStr(k)]));

// ─── Fixed epoch: start of today UTC (same for everyone worldwide) ────────────
// We fast-forward from this point so F5 always gives the same price as "live"
function getEpochBucket() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 2000);
}

// Apply one tick (one 2-second bucket) to a price state
function applyBucket(state, bucket) {
  COIN_KEYS.forEach(key => {
    const coinHash = COIN_HASHES[key];
    const r1 = seededRand(bucket * 131 + coinHash);       // delta direction
    const r2 = seededRand(bucket * 131 + coinHash + 7);   // change nudge

    const p = state[key].price;
    const delta = p * (r1 * 0.004 - 0.002);               // ±0.2% per tick
    const newP = Math.max(p + delta, p * 0.0001);
    let chg = state[key].change + (r2 * 0.2 - 0.1);
    if (chg > 15) chg = 2;   // reset runaway % display
    if (chg < -15) chg = -2;

    state[key] = {
      price:  newP,
      prev:   p,
      change: parseFloat(chg.toFixed(2)),
      isUp:   newP >= p,
    };
  });
}

// ─── Build the CURRENT state by fast-forwarding from epoch to now ─────────────
// This is deterministic: same result whether you F5'd or not.
function buildCurrentState() {
  // Start from initial prices
  const state = Object.fromEntries(
    COIN_KEYS.map(k => [k, {
      price:  INITIAL_COINS[k].price,
      prev:   INITIAL_COINS[k].price,
      change: 0,
      isUp:   false,
    }])
  );

  const epochBucket  = getEpochBucket();
  const currentBucket = Math.floor(Date.now() / 2000);

  // Fast-forward: iterate through every 2-second bucket since midnight UTC
  // Max ~43 200 buckets per day — runs in <150ms thanks to simple arithmetic
  for (let b = epochBucket; b <= currentBucket; b++) {
    applyBucket(state, b);
  }

  return state;
}

// Export so other components can read initial prices
export const INITIAL_COIN_PRICES = Object.fromEntries(
  COIN_KEYS.map(k => [k, INITIAL_COINS[k].price])
);

export const PriceContext = createContext(null);

export function PriceProvider({ children }) {
  // On first render: compute where prices "should be right now"
  const [prices, setPrices] = useState(buildCurrentState);
  const lastBucket = useRef(Math.floor(Date.now() / 2000));

  useEffect(() => {
    function tick() {
      const nowBucket = Math.floor(Date.now() / 2000);
      if (nowBucket <= lastBucket.current) return; // same bucket, skip
      lastBucket.current = nowBucket;

      // Apply exactly the new bucket on top of current prices
      setPrices(prev => {
        const next = {};
        COIN_KEYS.forEach(k => { next[k] = { ...prev[k] }; });
        applyBucket(next, nowBucket);
        return next;
      });
    }

    // Poll every 500ms to catch bucket boundary quickly
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
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
