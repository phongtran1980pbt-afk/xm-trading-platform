// Global in-memory price state
const INITIAL_COINS = {
  // Alpha
  BULL:      { price: 0.00479,   name: 'BULL'      },
  DEGEN:     { price: 0.001735,  name: 'DEGEN'     },
  BSO:       { price: 0.77337,   name: 'BSO'       },
  UP:        { price: 0.28334,   name: 'UP'        },
  ESPORTS:   { price: 0.79886,   name: 'ESPORTS'   },
  VIRL:      { price: 0.002996,  name: 'VIRL'      },
  RTX:       { price: 1.36045,   name: 'RTX'       },
  BABYTROLL: { price: 0.000912,  name: 'BABYTROLL' },
  EITHER:    { price: 0.16539,   name: 'EITHER'    },
  SKYAI:     { price: 0.31262,   name: 'SKYAI'     },
  SPCX:      { price: 0.002395,  name: 'SPCX'      },
  TITAN:     { price: 0.045059,  name: 'TITAN'     },
  WORLDCUP:  { price: 0.004468,  name: 'WORLDCUP'  },
  sato:      { price: 0.78079,   name: 'sato'      },
  Goblin:    { price: 0.009554,  name: 'Goblin'    },
  AWF:       { price: 0.007199,  name: 'AWF'       },
  RAGEGUY:   { price: 0.002628,  name: 'RAGEGUY'   },
  HANTA:     { price: 0.000725,  name: 'HANTA'     },
  BURNIE:    { price: 0.007445,  name: 'BURNIE'    },
  USDUC:     { price: 0.005204,  name: 'USDUC'     },
  ASTEROID:  { price: 0.000313,  name: 'ASTEROID'  },
  PAYAI:     { price: 0.008607,  name: 'PAYAI'     },
  MAGA:      { price: 0.008158,  name: 'MAGA'      },
  chudhouse: { price: 0.000121,  name: 'chudhouse' },
  GME:       { price: 0.000822,  name: 'GME'       },
  quq:       { price: 0.003109,  name: 'quq'       },
  // All markets
  BTC:   { price: 77390.98, name: 'BTC'   },
  ETH:   { price: 2127.08,  name: 'ETH'   },
  ZEC:   { price: 582.76,   name: 'ZEC'   },
  XMR:   { price: 338.20,   name: 'XMR'   },
  AAVE:  { price: 87.68,    name: 'AAVE'  },
  NEAR:  { price: 1.65,     name: 'NEAR'  },
  TAO:   { price: 263.06,   name: 'TAO'   },
  UNI:   { price: 8.6,      name: 'UNI'   },
  // Meme
  SHIB:  { price: 0.00000574,  name: 'SHIB'  },
  DOGE:  { price: 0.10386562,  name: 'DOGE'  },
  PEPE:  { price: 0.0000036899,name: 'PEPE'  },
  WIF:   { price: 0.19288759,  name: 'WIF'   },
  BONK:  { price: 0.00000602,  name: 'BONK'  },
  FLOKI: { price: 0.00003021,  name: 'FLOKI' },
  BRETT: { price: 0.00755767,  name: 'BRETT' },
  // Storage
  FIL:   { price: 0.95315038,  name: 'FIL'   },
  STORJ: { price: 0.11257603,  name: 'STORJ' },
  AR:    { price: 2.16,        name: 'AR'    },
  DATA:  { price: 0.00062571,  name: 'DATA'  },
  SKL:   { price: 0.00607331,  name: 'SKL'   },
  ELA:   { price: 0.45340071,  name: 'ELA'   },
  ALEPH: { price: 0.01628207,  name: 'ALEPH' },
  // Supply chain
  VET:   { price: 0.00659373,  name: 'VET'   },
  // Media
  THETA: { price: 0.19828165,  name: 'THETA' },
  AIOZ:  { price: 0.06672652,  name: 'AIOZ'  },
  KIN:   { price: 0.00506442,  name: 'KIN'   },
  WAXP:  { price: 0.00619318,  name: 'WAXP'  },
  TFUEL: { price: 0.01058834,  name: 'TFUEL' },
};

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

function generateInitialCandles(coinSym, count = 1000) {
  const info = INITIAL_COINS[coinSym];
  const initialPrice = info ? info.price : 100;
  const coinHash = hashStr(coinSym);
  
  let price = initialPrice;
  const candles = [];
  const nowMin = Math.floor(Date.now() / 1000 / 60);
  const startMin = nowMin - count;
  
  const FIXED_EPOCH_MIN = 29453760; // Jan 1, 2026
  const simulationStart = Math.min(startMin, FIXED_EPOCH_MIN);
  
  for (let m = simulationStart; m < nowMin; m++) {
    const seed1 = coinHash + m * 3;
    const seed2 = coinHash + m * 3 + 1;
    const seed3 = coinHash + m * 3 + 2;
    const seed4 = coinHash + m * 3 + 3;
    
    const r1 = seededRand(seed1);
    const drift = ((initialPrice - price) / initialPrice) * 0.01;
    const change = (r1 * 0.003 - 0.0015) + drift;
    const factor = Math.max(0.1, 1 + change);
    const nextPrice = Math.max(price * factor, initialPrice * 0.01);
    
    const open = price;
    const close = nextPrice;
    
    if (m >= startMin) {
      const r2 = seededRand(seed2);
      const r3 = seededRand(seed3);
      const high = Math.max(open, close) + Math.abs(open * r2 * 0.001);
      const low  = Math.max(Math.min(open, close) - Math.abs(open * r3 * 0.001), initialPrice * 0.001);
      
      candles.push({
        time: m * 60,
        open,
        high,
        low,
        close,
        _seed4: seed4
      });
    }
    
    price = nextPrice;
  }
  return { candles, lastPrice: price };
}

function initializePriceState() {
  const state = {};
  const history = {};
  const current = {};
  const nowMin = Math.floor(Date.now() / 1000 / 60);

  Object.keys(INITIAL_COINS).forEach(key => {
    const { candles, lastPrice } = generateInitialCandles(key, 1000);
    history[key] = candles;
    state[key] = {
      price: lastPrice,
      prev: lastPrice,
      change: +(Math.random() * 10 - 5).toFixed(2),
      isUp: Math.random() > 0.5
    };
    current[key] = {
      time: nowMin * 60,
      open: lastPrice,
      high: lastPrice,
      low: lastPrice,
      close: lastPrice,
      minute: nowMin
    };
  });
  return { state, history, current };
}

const { state: initialStates, history: initialHistories, current: initialCurrents } = initializePriceState();
let prices = initialStates;
let candleHistory = initialHistories;
let currentCandles = initialCurrents;
let coinTrends = {}; // { BTC: 'up', quq: 'down', ... }
let coinOffsets = {}; // { BTC: 0.003, quq: -0.003, ... }

// Background task to update prices every 2 seconds
setInterval(() => {
  const next = { ...prices };
  const nowMin = Math.floor(Date.now() / 1000 / 60);

  Object.keys(next).forEach(key => {
    const trend = coinTrends[key] || 'neutral';
    const p = next[key].price;
    let newP = p;
    let change = 0;

    if (trend === 'up') {
      // 62% chance to go up, 38% chance to go down for smoother, segmented fluctuation
      const isUpTick = Math.random() < 0.62;
      change = isUpTick ? (Math.random() * 0.0004) : -(Math.random() * 0.00035);
      newP = Math.max(p * (1 + change), p * 0.0001);
      coinOffsets[key] = (coinOffsets[key] || 0) + change;
    } else if (trend === 'down') {
      // 62% chance to go down, 38% chance to go up
      const isDownTick = Math.random() < 0.62;
      change = isDownTick ? -(Math.random() * 0.0004) : (Math.random() * 0.00035);
      newP = Math.max(p * (1 + change), p * 0.0001);
      coinOffsets[key] = (coinOffsets[key] || 0) + change;
    } else {
      // Neutral trend: 50/50 fluctuation
      change = Math.random() * 0.0004 - 0.0002;
      newP = Math.max(p * (1 + change), p * 0.0001);
      // Decaying offset to return to base Binance price slowly when neutral
      coinOffsets[key] = ((coinOffsets[key] || 0) * 0.99) + (Math.random() * 0.0001 - 0.00005);
    }
    
    // Cap maximum change from candle open to prevent extremely tall (monster) candles
    const openP = currentCandles[key]?.open || p;
    const diffPct = (newP - openP) / openP;
    const MAX_CANDLE_DIFF = 0.0025; // max 0.25% body change per candle
    if (diffPct > MAX_CANDLE_DIFF) {
      newP = openP * (1 + MAX_CANDLE_DIFF);
    } else if (diffPct < -MAX_CANDLE_DIFF) {
      newP = openP * (1 - MAX_CANDLE_DIFF);
    }
    
    // Calculate the true change percentage based on the initial price
    const initialPrice = INITIAL_COINS[key]?.price || p || 1;
    const chg = ((newP - initialPrice) / initialPrice) * 100;
    
    next[key] = {
      price: newP,
      prev: p,
      change: parseFloat(chg.toFixed(2)),
      isUp: newP >= p,
    };

    // Update candle
    if (!currentCandles[key] || currentCandles[key].minute !== nowMin) {
      if (currentCandles[key]) {
        candleHistory[key].push({
          time: currentCandles[key].time,
          open: currentCandles[key].open,
          high: currentCandles[key].high,
          low: currentCandles[key].low,
          close: currentCandles[key].close
        });
        if (candleHistory[key].length > 1000) {
          candleHistory[key].shift();
        }
      }
      currentCandles[key] = {
        time: nowMin * 60,
        open: p,
        high: Math.max(p, newP),
        low: Math.min(p, newP),
        close: newP,
        minute: nowMin
      };
    } else {
      currentCandles[key].high = Math.max(currentCandles[key].high, newP);
      currentCandles[key].low = Math.min(currentCandles[key].low, newP);
      currentCandles[key].close = newP;
    }
  });
  prices = next;
}, 2000);

export const getCandles = (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ success: false, message: 'Missing symbol' });
  const hist = candleHistory[symbol] || [];
  const curr = currentCandles[symbol];
  if (curr) {
    res.json([...hist, {
      time: curr.time,
      open: curr.open,
      high: curr.high,
      low: curr.low,
      close: curr.close
    }]);
  } else {
    res.json(hist);
  }
};

export const getPricesData = () => prices;

export const getPrices = (req, res) => {
  res.json({ prices, coinOffsets });
};

export const setTrend = (req, res) => {
  const { symbol, trend } = req.body;
  const targetSymbol = symbol || 'BTC';
  if (['up', 'down', 'neutral'].includes(trend)) {
    coinTrends[targetSymbol] = trend;
    res.json({ success: true, symbol: targetSymbol, trend });
  } else {
    res.status(400).json({ success: false, message: 'Invalid trend' });
  }
};

export const getTrend = (req, res) => {
  const { symbol } = req.query;
  const targetSymbol = symbol || 'BTC';
  res.json({ trend: coinTrends[targetSymbol] || 'neutral' });
};

export const resetTrendToNeutral = (symbol) => {
  const targetSymbol = symbol || 'BTC';
  coinTrends[targetSymbol] = 'neutral';
};
