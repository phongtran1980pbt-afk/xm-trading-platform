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

function buildInitialState() {
  const state = {};
  Object.entries(INITIAL_COINS).forEach(([key, info]) => {
    state[key] = {
      price:  info.price,
      prev:   info.price,
      change: +(Math.random() * 10 - 5).toFixed(2),
      isUp:   Math.random() > 0.5,
    };
  });
  return state;
}

let prices = buildInitialState();
let currentTrend = 'neutral'; // 'up', 'down', 'neutral'

// Background task to update prices every 2 seconds
setInterval(() => {
  const bias = currentTrend === 'up' ? 0.003 : currentTrend === 'down' ? -0.003 : 0;
  
  const next = { ...prices };
  Object.keys(next).forEach(key => {
    const p = next[key].price;
    // Random slow change
    const delta = p * ((Math.random() * 0.004 - 0.002) + bias);
    const newP = Math.max(p + delta, p * 0.0001); // floor
    const chg = next[key].change + (Math.random() * 0.2 - 0.1);
    
    next[key] = {
      price: newP,
      prev: p,
      change: parseFloat(chg.toFixed(2)),
      isUp: newP >= p,
    };
  });
  prices = next;
}, 2000);

export const getPrices = (req, res) => {
  res.json(prices);
};

export const setTrend = (req, res) => {
  const { trend } = req.body;
  if (['up', 'down', 'neutral'].includes(trend)) {
    currentTrend = trend;
    res.json({ success: true, trend: currentTrend });
  } else {
    res.status(400).json({ success: false, message: 'Invalid trend' });
  }
};

export const getTrend = (req, res) => {
  res.json({ trend: currentTrend });
};
