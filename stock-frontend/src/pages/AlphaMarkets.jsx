import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrices } from '../contexts/PriceContext';
import './AlphaMarkets.css';

const INITIAL_MOCK_DATA = [
  { id: 1, name: 'BTC', address: '0xBTC...USDT', price: 62630.00, change: 0.56, isUp: true, vol: '156.85K', volSub: '80K/76K', uniqueAddr: '98K', holders: '15.2M', totalVol: '$12.14 B', liquidity: '$2.4 B' },
  { id: 2, name: 'XAU', address: '0xXAU...USDT', price: 4150.00, change: -1.09, isUp: false, vol: '825K', volSub: '425K/400K', uniqueAddr: '12K', holders: '1.2M', totalVol: '$3.4 B', liquidity: '$850M' },
  { id: 3, name: 'ETH', address: '0xETH...USDT', price: 1690.00, change: -0.7, isUp: false, vol: '256K', volSub: '120K/136K', uniqueAddr: '84K', holders: '8.4M', totalVol: '$5.56 B', liquidity: '$1.1 B' },
  { id: 4, name: 'BULL', address: '3TYqKw...pump', price: 0.00479, change: 1.89, isUp: true, vol: '16.076', volSub: '7.981/8.095', uniqueAddr: '860', holders: '10.877', totalVol: '$718.605,66', liquidity: '$624.363,89' },
  { id: 5, name: 'DEGEN', address: 'Fm3c...pump', price: 0.001735, change: 10.70, isUp: true, vol: '44.853', volSub: '21.928/22.925', uniqueAddr: '19.290', holders: '5.600', totalVol: '$3.34 Tr', liquidity: '$231.034,5' },
  { id: 6, name: 'BSO', address: 'DeD8Sd...78ec', price: 0.77337, change: 15.14, isUp: true, vol: '50.221', volSub: '26.240/23.981', uniqueAddr: '2.336', holders: '58.222', totalVol: '$9.74 Tr', liquidity: '$3.18 Tỷ' },
  { id: 7, name: 'UP', address: 'Dx0000...0000', price: 0.28334, change: 15.22, isUp: true, vol: '21.795', volSub: '11.106/10.689', uniqueAddr: '1.285', holders: '5.455', totalVol: '$12.62 Tr', liquidity: '$4.22 Tỷ' },
  { id: 8, name: 'ESPORTS', address: 'Dd39c...BC42', price: 0.79886, change: 14.29, isUp: true, vol: '90.015', volSub: '44.424/45.521', uniqueAddr: '2.138', holders: '83.033', totalVol: '$8.89 Tr', liquidity: '$2.35 Tỷ' },
  { id: 9, name: 'VIRL', address: 'EkwH...S...pump', price: 0.002996, change: 104.49, isUp: true, vol: '20.288', volSub: '9.743/10.545', uniqueAddr: '3.218', holders: '3.585', totalVol: '$2.04 Tr', liquidity: '$379.885,99' },
  { id: 10, name: 'RTX', address: 'Dx4829...98B3', price: 1.36045, change: 0.04, isUp: true, vol: '25.295', volSub: '13.722/11.573', uniqueAddr: '5.592', holders: '11.581', totalVol: '$7.58 Tr', liquidity: '$1.13 Tỷ' },
  { id: 11, name: 'BABYTROLL', address: '8qdz1x...pump', price: 0.000912, change: -39.81, isUp: false, vol: '15.037', volSub: '6.004/9.033', uniqueAddr: '4.060', holders: '5.841', totalVol: '$896.679,94', liquidity: '$219.652,17' },
  { id: 12, name: 'EITHER', address: 'Hm5dmB...noel', price: 0.16539, change: -2.92, isUp: false, vol: '31.358', volSub: '18.394/12.964', uniqueAddr: '2.808', holders: '18.338', totalVol: '$2.25 Tr', liquidity: '$484.783,35' },
  { id: 13, name: 'SKYAI', address: 'Dx82aa...fc1e', price: 0.31262, change: 10.56, isUp: true, vol: '22.990', volSub: '11.196/11.794', uniqueAddr: '1.417', holders: '54.922', totalVol: '$10.51 Tr', liquidity: '$12.68 Tỷ' },
  { id: 14, name: 'SPCX', address: 'E5fP2...pump', price: 0.002395, change: 50.81, isUp: true, vol: '6.159', volSub: '3.059/3.100', uniqueAddr: '1.529', holders: '4.152', totalVol: '$591.849,78', liquidity: '$274.060,83' },
  { id: 15, name: 'TITAN', address: '0x0214...4e44', price: 0.045059, change: -3.34, isUp: false, vol: '17', volSub: '7/10', uniqueAddr: '11', holders: '4.349', totalVol: '$429,56', liquidity: '$55.930,5' },
  { id: 16, name: 'WORLDCUP', address: '33eumB...pump', price: 0.004468, change: 36.49, isUp: true, vol: '5.125', volSub: '2.904/2.221', uniqueAddr: '1.816', holders: '10.779', totalVol: '$543.899,28', liquidity: '$720.312,71' },
  { id: 17, name: 'sato', address: '0x125f...74D8', price: 0.78079, change: 86.04, isUp: true, vol: '2.356', volSub: '1.362/994', uniqueAddr: '1.168', holders: '9.383', totalVol: '$2.04 Tr', liquidity: '$2.89 Tỷ' },
  { id: 18, name: 'Goblin', address: '3KHWZ1...pump', price: 0.009554, change: -12.50, isUp: false, vol: '5.936', volSub: '3.138/2.798', uniqueAddr: '1.331', holders: '8.559', totalVol: '$939.706,87', liquidity: '$1.11 Tỷ' },
  { id: 19, name: 'AWF', address: '0x12e7...a1e3', price: 0.007199, change: -18.74, isUp: false, vol: '1.733', volSub: '943/790', uniqueAddr: '745', holders: '2.323', totalVol: '$809.013,06', liquidity: '$539.952,46' },
  { id: 20, name: 'RAGEGUY', address: 'GwWzsr...pump', price: 0.002628, change: -11.06, isUp: false, vol: '3.766', volSub: '2.034/1.732', uniqueAddr: '766', holders: '4.287', totalVol: '$447.401,65', liquidity: '$197.367,77' },
  { id: 21, name: 'HANTA', address: '2Ekpqu...zy3y', price: 0.000725, change: -23.50, isUp: false, vol: '3.084', volSub: '1.673/1.411', uniqueAddr: '1.136', holders: '17.662', totalVol: '$270.695,2', liquidity: '$197.050,7' },
  { id: 22, name: 'BURNIE', address: 'CGEDT9...pump', price: 0.007445, change: 19.43, isUp: true, vol: '6.207', volSub: '3.265/2.942', uniqueAddr: '1.497', holders: '10.576', totalVol: '$850.454,18', liquidity: '$1.3 Tỷ' },
  { id: 23, name: 'USDUC', address: 'C89dbu...pump', price: 0.005204, change: -11.06, isUp: false, vol: '2.478', volSub: '1.213/1.265', uniqueAddr: '463', holders: '15.372', totalVol: '$213.602,35', liquidity: '$724.917,44' },
  { id: 24, name: 'ASTEROID', address: '0xf380...4c26', price: 0.000313, change: 1.44, isUp: true, vol: '1.317', volSub: '742/575', uniqueAddr: '715', holders: '25.582', totalVol: '$1.41 Tr', liquidity: '$15.68 Tỷ' },
  { id: 25, name: 'PAYAI', address: 'EXYms5...Dcfu', price: 0.008607, change: -6.17, isUp: false, vol: '1.113', volSub: '784/329', uniqueAddr: '280', holders: '5.782', totalVol: '$198.281,52', liquidity: '$572.822,58' },
  { id: 26, name: 'SAND', address: '0xSAND...pump', price: 0.05046, change: -3.40, isUp: false, vol: '7.60M', volSub: '3.6M/4.0M', uniqueAddr: '1.240', holders: '12.432', totalVol: '$560K', liquidity: '$219.000' },
  { id: 27, name: 'ANKR', address: '0xANKR...pump', price: 0.003698, change: -3.19, isUp: false, vol: '4.04M', volSub: '1.8M/2.2M', uniqueAddr: '2.500', holders: '8.432', totalVol: '$120K', liquidity: '$89.000' },
  { id: 28, name: 'RVN', address: '0xRVN...pump', price: 0.004134, change: -2.47, isUp: false, vol: '1.17M', volSub: '500K/670K', uniqueAddr: '1.500', holders: '3.490', totalVol: '$89K', liquidity: '$45.000' },
  { id: 29, name: 'SFP', address: '0xSFP...pump', price: 0.2305, change: -3.15, isUp: false, vol: '759.011', volSub: '300K/459K', uniqueAddr: '3.400', holders: '15.430', totalVol: '$980K', liquidity: '$410.000' },
  { id: 30, name: 'COTI', address: '0xCOTI...pump', price: 0.00936, change: -2.39, isUp: false, vol: '1.16M', volSub: '500K/660K', uniqueAddr: '1.100', holders: '5.200', totalVol: '$230K', liquidity: '$120.000' },
  { id: 31, name: 'CHR', address: '0xCHR...pump', price: 0.01504, change: -3.40, isUp: false, vol: '1.09M', volSub: '450K/640K', uniqueAddr: '1.090', holders: '4.890', totalVol: '$190K', liquidity: '$98.000' },
  { id: 32, name: 'MANA', address: '0xMANA...pump', price: 0.0661, change: -2.50, isUp: false, vol: '3.27M', volSub: '1.5M/1.77M', uniqueAddr: '2.100', holders: '19.430', totalVol: '$1.4M', liquidity: '$560.000' },
  { id: 33, name: 'ALICE', address: '0xALICE...pump', price: 0.1010, change: -3.62, isUp: false, vol: '1.67M', volSub: '700K/970K', uniqueAddr: '1.670', holders: '9.480', totalVol: '$870K', liquidity: '$320.000' },
  { id: 34, name: 'HBAR', address: '0xHBAR...pump', price: 0.07896, change: -1.87, isUp: false, vol: '21.67M', volSub: '10M/11.67M', uniqueAddr: '5.400', holders: '48.900', totalVol: '$9.4M', liquidity: '$3.8M' },
  { id: 35, name: 'ONE', address: '0xONE...pump', price: 0.001404, change: -3.30, isUp: false, vol: '1.17M', volSub: '500K/670K', uniqueAddr: '1.100', holders: '8.430', totalVol: '$180K', liquidity: '$95.000' },
  { id: 36, name: 'CELR', address: '0xCELR...pump', price: 0.002077, change: -3.30, isUp: false, vol: '574.736', volSub: '250K/324K', uniqueAddr: '890', holders: '3.210', totalVol: '$94K', liquidity: '$52.000' },
  { id: 37, name: 'HOT', address: '0xHOT...pump', price: 0.0003009, change: -2.52, isUp: false, vol: '1.10M', volSub: '500K/600K', uniqueAddr: '1.200', holders: '12.430', totalVol: '$320K', liquidity: '$140.000' },
  { id: 38, name: 'PYTH', address: '0xPYTH...pump', price: 0.03507, change: -7.02, isUp: false, vol: '5.92M', volSub: '2.5M/3.42M', uniqueAddr: '3.420', holders: '28.930', totalVol: '$2.8M', liquidity: '$1.2M' },
  { id: 39, name: 'SUPER', address: '0xSUPER...pump', price: 0.0926, change: -1.69, isUp: false, vol: '1.69M', volSub: '700K/990K', uniqueAddr: '1.690', holders: '9.430', totalVol: '$850K', liquidity: '$340.000' },
  { id: 40, name: 'USTC', address: '0xUSTC...pump', price: 0.005840, change: -3.80, isUp: false, vol: '988.869', volSub: '400K/588K', uniqueAddr: '988', holders: '15.430', totalVol: '$410K', liquidity: '$180.000' },
  { id: 41, name: 'ONG', address: '0xONG...pump', price: 0.04577, change: -2.72, isUp: false, vol: '665.678', volSub: '300K/365K', uniqueAddr: '665', holders: '4.890', totalVol: '$210K', liquidity: '$94.000' },
  { id: 42, name: 'ETHW', address: '0xETHW...pump', price: 0.2308, change: -2.69, isUp: false, vol: '368.772', volSub: '150K/218K', uniqueAddr: '368', holders: '3.420', totalVol: '$180K', liquidity: '$88.000' },
  { id: 43, name: 'JTO', address: '0xJTO...pump', price: 0.7125, change: 1.38, isUp: true, vol: '71.80M', volSub: '38M/33.8M', uniqueAddr: '15.400', holders: '89.430', totalVol: '$38.4M', liquidity: '$15.8M' },
  { id: 44, name: '1000SATS', address: '0x1000SATS...pump', price: 0.00000937, change: -2.19, isUp: false, vol: '2.44M', volSub: '1M/1.44M', uniqueAddr: '2.440', holders: '114.930', totalVol: '$1.4M', liquidity: '$620.000' },
  { id: 45, name: 'AUCTION', address: '0xAUCTION...pump', price: 3.706, change: -1.54, isUp: false, vol: '1.33M', volSub: '600K/730K', uniqueAddr: '1.330', holders: '8.430', totalVol: '$980K', liquidity: '$430.000' },
  { id: 46, name: '1000RATS', address: '0x1000RATS...pump', price: 0.02696, change: -6.71, isUp: false, vol: '1.09M', volSub: '400K/690K', uniqueAddr: '1.090', holders: '48.900', totalVol: '$850K', liquidity: '$390.000' },
  { id: 47, name: 'ACE', address: '0xACE...pump', price: 0.07732, change: -5.01, isUp: false, vol: '1.55M', volSub: '600K/950K', uniqueAddr: '1.550', holders: '9.430', totalVol: '$810K', liquidity: '$360.000' },
  { id: 48, name: 'MOVR', address: '0xMOVR...pump', price: 1.274, change: -5.13, isUp: false, vol: '1.76M', volSub: '700K/1.06M', uniqueAddr: '1.760', holders: '5.200', totalVol: '$1.1M', liquidity: '$480.000' },
  { id: 49, name: 'NFP', address: '0xNFP...pump', price: 0.007780, change: -1.74, isUp: false, vol: '3.30M', volSub: '1.5M/1.8M', uniqueAddr: '3.300', holders: '15.430', totalVol: '$1.8M', liquidity: '$790.000' },
  { id: 50, name: 'RENDER', address: '0xRENDER...pump', price: 1.670, change: -1.06, isUp: false, vol: '26.09M', volSub: '12M/14.09M', uniqueAddr: '15.400', holders: '124.900', totalVol: '$19.4M', liquidity: '$8.4M' },
  { id: 51, name: 'BANANA', address: '0xBANANA...pump', price: 2.843, change: -3.16, isUp: false, vol: '1.23M', volSub: '500K/730K', uniqueAddr: '1.230', holders: '8.430', totalVol: '$1.1M', liquidity: '$490.000' },
  { id: 52, name: 'RARE', address: '0xRARE...pump', price: 0.01251, change: -3.17, isUp: false, vol: '1.03M', volSub: '400K/630K', uniqueAddr: '1.030', holders: '9.480', totalVol: '$790K', liquidity: '$310.000' },
  { id: 53, name: 'G', address: '0xG...pump', price: 0.002611, change: -2.35, isUp: false, vol: '1.10M', volSub: '500K/600K', uniqueAddr: '1.100', holders: '3.420', totalVol: '$98K', liquidity: '$42.000' },
  { id: 54, name: 'SYN', address: '0xSYN...pump', price: 0.14893, change: 30.22, isUp: true, vol: '453.27M', volSub: '250M/203.27M', uniqueAddr: '89.400', holders: '114.930', totalVol: '$124.9M', liquidity: '$56.8M' },
  { id: 55, name: 'BRETT', address: '0xBRETT...pump', price: 0.006111, change: -9.98, isUp: false, vol: '2.93M', volSub: '1M/1.93M', uniqueAddr: '2.930', holders: '28.930', totalVol: '$1.8M', liquidity: '$790.000' },
  { id: 56, name: 'POPCAT', address: '0xPOPCAT...pump', price: 0.04146, change: -2.05, isUp: false, vol: '3.22M', volSub: '1.4M/1.82M', uniqueAddr: '3.220', holders: '19.430', totalVol: '$1.4M', liquidity: '$620.000' },
  { id: 57, name: 'SUN', address: '0xSUN...pump', price: 0.017076, change: -0.72, isUp: false, vol: '1.63M', volSub: '700K/930K', uniqueAddr: '1.630', holders: '9.430', totalVol: '$810K', liquidity: '$320.000' },
  { id: 58, name: 'DOGS', address: '0xDOGS...pump', price: 0.00003902, change: -5.22, isUp: false, vol: '2.63M', volSub: '1.1M/1.53M', uniqueAddr: '2.630', holders: '89.430', totalVol: '$1.4M', liquidity: '$590.000' },
  { id: 59, name: 'FLUX', address: '0xFLUX...pump', price: 0.04930, change: -3.42, isUp: false, vol: '562.429', volSub: '250K/312.429', uniqueAddr: '562', holders: '4.890', totalVol: '$230K', liquidity: '$98.000' },
  { id: 60, name: 'RPL', address: '0xRPL...pump', price: 1.332, change: -3.19, isUp: false, vol: '599.170', volSub: '250K/349.170', uniqueAddr: '599', holders: '5.200', totalVol: '$720K', liquidity: '$310.000' },
  { id: 61, name: 'POL', address: '0xPOL...pump', price: 0.07757, change: 1.54, isUp: true, vol: '15.16M', volSub: '8M/7.16M', uniqueAddr: '5.420', holders: '28.930', totalVol: '$9.4M', liquidity: '$3.9M' }
];

const SPOT_MOCK_DATA = [
  { id: 201, name: 'BTC', address: 'SPOT-BTC/USDT', price: 77402.66, change: 0.56, isUp: true, vol: '156.85K', volSub: '80K/76K', uniqueAddr: '98K', holders: '15.2M', totalVol: '$12.14 B', liquidity: '$2.4 B' },
  { id: 202, name: 'ETH', address: 'SPOT-ETH/USDT', price: 2185.27, change: -0.7, isUp: false, vol: '256.33K', volSub: '120K/136K', uniqueAddr: '84K', holders: '8.4M', totalVol: '$5.56 B', liquidity: '$1.1 B' },
  { id: 203, name: 'SOL', address: 'SPOT-SOL/USDT', price: 85.07, change: 0.41, isUp: true, vol: '890K', volSub: '450K/440K', uniqueAddr: '45K', holders: '2.1M', totalVol: '$1.82 B', liquidity: '$350M' },
  { id: 204, name: 'BNB', address: 'SPOT-BNB/USDT', price: 615.42, change: 1.15, isUp: true, vol: '112K', volSub: '60K/52K', uniqueAddr: '23K', holders: '4.8M', totalVol: '$688M', liquidity: '$180M' },
  { id: 205, name: 'XRP', address: 'SPOT-XRP/USDT', price: 1.3735, change: -0.14, isUp: false, vol: '3.4M', volSub: '1.6M/1.8M', uniqueAddr: '150K', holders: '3.5M', totalVol: '$4.67 B', liquidity: '$850M' },
  { id: 206, name: 'ADA', address: 'SPOT-ADA/USDT', price: 0.524, change: 2.14, isUp: true, vol: '1.2M', volSub: '700K/500K', uniqueAddr: '38K', holders: '1.8M', totalVol: '$628M', liquidity: '$120M' },
  { id: 207, name: 'LINK', address: 'SPOT-LINK/USDT', price: 18.25, change: -1.05, isUp: false, vol: '450K', volSub: '200K/250K', uniqueAddr: '18K', holders: '650K', totalVol: '$328M', liquidity: '$75M' }
];

const FUTURES_MOCK_DATA = [
  { id: 301, name: 'BTCUSDT-M', address: 'BTC Vĩnh cửu', price: 77612.4, change: 0.91, isUp: true, vol: '2.5M', volSub: '1.3M/1.2M', uniqueAddr: '120K', holders: 'N/A', totalVol: '$194.2 B', liquidity: '$5.8 B' },
  { id: 302, name: 'ETHUSDT-M', address: 'ETH Vĩnh cửu', price: 2185.11, change: 0.68, isUp: true, vol: '4.1M', volSub: '2.1M/2.0M', uniqueAddr: '98K', holders: 'N/A', totalVol: '$89.5 B', liquidity: '$2.6 B' },
  { id: 303, name: 'SOLUSDT-M', address: 'SOL Vĩnh cửu', price: 85.068, change: -0.4, isUp: false, vol: '12.4M', volSub: '6.0M/6.4M', uniqueAddr: '110K', holders: 'N/A', totalVol: '$41.2 B', liquidity: '$1.2 B' },
  { id: 304, name: 'DOGEUSDT-M', address: 'DOGE Vĩnh cửu', price: 0.1038, change: -0.28, isUp: false, vol: '38.4M', volSub: '18M/20.4M', uniqueAddr: '78K', holders: 'N/A', totalVol: '$15.9 B', liquidity: '$480M' },
  { id: 305, name: 'PEPEUSDT-M', address: 'PEPE Vĩnh cửu', price: 0.00000368, change: 0.96, isUp: true, vol: '120.5M', volSub: '65M/55.5M', uniqueAddr: '85K', holders: 'N/A', totalVol: '$8.4 B', liquidity: '$230M' },
  { id: 306, name: 'WIFUSDT-M', address: 'WIF Vĩnh cửu', price: 0.1928, change: 1.26, isUp: true, vol: '15.2M', volSub: '8M/7.2M', uniqueAddr: '32K', holders: 'N/A', totalVol: '$2.9 B', liquidity: '$85M' }
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
  const [mainTab, setMainTab] = useState('alpha'); // 'alpha' | 'favorites' | 'spot' | 'futures'
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favoriteCoins') || '[]'));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
  if (mainTab === 'alpha') {
    baseData = [...INITIAL_MOCK_DATA];
  } else if (mainTab === 'spot') {
    baseData = [...SPOT_MOCK_DATA];
  } else if (mainTab === 'futures') {
    baseData = [...FUTURES_MOCK_DATA];
  } else if (mainTab === 'favorites') {
    const all = [...INITIAL_MOCK_DATA, ...SPOT_MOCK_DATA, ...FUTURES_MOCK_DATA];
    const uniqueCoins = Array.from(new Map(all.map(item => [item.name, item])).values());
    baseData = uniqueCoins.filter(c => favorites.includes(c.name));
  }

  const paginatedData = baseData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const data = paginatedData.map(coin => {
    const live = globalPrices?.[coin.name];
    if (!live) return coin;
    return {
      ...coin,
      price:  live.price,
      change: live.change,
      isUp:   live.isUp,
    };
  });
  
  const totalPages = Math.ceil(baseData.length / itemsPerPage) || 1;

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
        <h1 className="alpha-page-title">Tổng quan thị trường</h1>

        <div className="alpha-overview-grid">
          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Xu hướng &gt;</span>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/BTC')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#F7931A', color: '#fff'}}>B</div>
                <span className="alpha-coin-symbol">BTC</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$77.402,66</span>
                <span className="alpha-price-change text-green">+0,56% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/XAU')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FFD700', color: '#000'}}>X</div>
                <span className="alpha-coin-symbol">XAU</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$2.350,00</span>
                <span className="alpha-price-change text-red">-1,09% ▼</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/KCS')}>
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

          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Coin mới &gt;</span>
              <span className="text-gray">00d 34h 01m 00s<br/>Đếm ngược đến khi ra mắt</span>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/NEX')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#2b2b2b', color: '#fff'}}>N</div>
                <span className="alpha-coin-symbol">NEX</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/ZEST')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF4500', color: '#fff'}}>Z</div>
                <span className="alpha-coin-symbol">ZEST</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,1488361</span>
                <span className="alpha-price-change text-green">+893,33% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/ATWO')}>
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

          <div className="alpha-card">
            <div className="alpha-card-header">
              <span>Top tăng giá &gt;</span>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/ZEST')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF4500', color: '#fff'}}>Z</div>
                <span className="alpha-coin-symbol">ZEST</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,1488361</span>
                <span className="alpha-price-change text-green">+893,33% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/LYX')}>
              <div className="alpha-coin-info">
                <div className="alpha-coin-icon" style={{background: '#FF1493', color: '#fff'}}>L</div>
                <span className="alpha-coin-symbol">LYX</span>
              </div>
              <div className="alpha-price-info">
                <span className="alpha-price-val">$0,36020774</span>
                <span className="alpha-price-change text-green">+72,27% ▲</span>
              </div>
            </div>
            <div className="alpha-card-item" style={{cursor: 'pointer'}} onClick={() => navigate('/trade/NUMI')}>
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

        <div className="alpha-tabs-container">
          <div className={"alpha-tab " + (mainTab === 'favorites' ? 'active' : '')} onClick={() => { setMainTab('favorites'); setCurrentPage(1); }} style={{cursor: 'pointer'}}>Yêu thích</div>
          <Link to="/markets/all" className="alpha-tab" style={{textDecoration:'none', color:'#848e9c'}}>Tất cả</Link>
          <div className={"alpha-tab " + (mainTab === 'spot' ? 'active' : '')} onClick={() => { setMainTab('spot'); setCurrentPage(1); }} style={{cursor: 'pointer'}}>Giao ngay</div>
          <div className={"alpha-tab " + (mainTab === 'futures' ? 'active' : '')} onClick={() => { setMainTab('futures'); setCurrentPage(1); }} style={{cursor: 'pointer'}}>Giao sau</div>
          <div className={"alpha-tab " + (mainTab === 'alpha' ? 'active' : '')} onClick={() => { setMainTab('alpha'); setCurrentPage(1); }} style={{cursor: 'pointer'}}>Alpha</div>
        </div>

        <div className="alpha-sub-tabs">
          <div className="alpha-pills">
            <button className="alpha-pill">Đã chọn</button>
            <button className="alpha-pill">Trên chuỗi</button>
            <button className="alpha-pill active">Tất cả</button>
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
                    <svg className="star-icon" onClick={(e) => toggleFavorite(e, coin.name)} width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(coin.name) ? '#F7931A' : 'none'} stroke={favorites.includes(coin.name) ? '#F7931A' : 'currentColor'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </td>
                  <td>
                    <div className="alpha-coin-cell">
                      <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
                        <img 
                          src={`https://assets.coincap.io/assets/icons/${coin.name.toLowerCase()}@2x.png`}
                          onLoad={(e) => {
                            e.currentTarget.style.display = 'block';
                            const sibling = e.currentTarget.nextSibling;
                            if (sibling) sibling.style.display = 'none';
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextSibling;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                          alt={coin.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'none', objectFit: 'cover' }}
                        />
                        <div className="alpha-coin-icon" style={{background: index % 2 === 0 ? '#F7931A' : '#627EEA', color: '#fff', display: 'flex', width: '28px', height: '28px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                          {coin.name[0]}
                        </div>
                      </div>
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

        <div className="alpha-pagination">
          <button className="alpha-page-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>&lt;</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i+1} className={`alpha-page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="alpha-page-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>&gt;</button>
        </div>

      </div>
    </div>
  );
}

export default AlphaMarkets;
