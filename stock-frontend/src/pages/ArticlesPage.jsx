import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './ArticlesPage.css';

/* ============================================================
   ARTICLE DATA BANK
   slug → { title, category, readMin, date, hero, sections[] }
   ============================================================ */
const ARTICLES = {
  /* ───────── GIAO DỊCH ───────── */
  'giao-dich-giao-ngay': {
    title: 'Giao Dịch Giao Ngay: Hướng Dẫn Toàn Diện Cho Nhà Đầu Tư',
    category: 'Giao dịch',
    readMin: 8,
    date: '20/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 3 3 21 21 21"></polyline><polyline points="3 17 9 11 13 15 21 7"></polyline><polyline points="14 7 21 7 21 14"></polyline></svg>,
    sections: [
      { heading: 'Giao dịch giao ngay là gì?', body: 'Giao dịch giao ngay (Spot Trading) là hình thức mua bán tài sản tại mức giá thị trường hiện tại, với việc thanh toán và chuyển giao tài sản diễn ra ngay lập tức hoặc trong vòng T+2 ngày làm việc. Đây là hình thức giao dịch cơ bản và phổ biến nhất trên các sàn tiền điện tử và thị trường tài chính truyền thống.' },
      { heading: 'Lợi ích của giao dịch giao ngay', body: 'Giao dịch giao ngay mang lại sự đơn giản và minh bạch: bạn biết chính xác mình mua bao nhiêu, ở mức giá nào. Không có rủi ro margin call, không bị ảnh hưởng bởi phí qua đêm (swap). Đây là lựa chọn lý tưởng cho người mới và nhà đầu tư dài hạn muốn sở hữu tài sản thực sự.' },
      { heading: 'Chiến lược giao dịch giao ngay hiệu quả', body: 'Dollar-Cost Averaging (DCA) – đầu tư định kỳ một khoản cố định bất kể giá thị trường – là chiến lược được nhiều chuyên gia khuyến nghị. Ngoài ra, phân tích kỹ thuật với các chỉ báo như RSI, MACD, và Bollinger Bands giúp xác định điểm vào lệnh tối ưu. Luôn đặt stop-loss để bảo vệ vốn.' },
      { heading: 'Quản lý rủi ro trong giao dịch giao ngay', body: 'Nguyên tắc vàng: không bao giờ đầu tư quá 5-10% danh mục vào một tài sản duy nhất. Đa dạng hóa danh mục với các đồng coin có vốn hóa lớn (BTC, ETH) và một phần nhỏ altcoin tiềm năng. Luôn dành một phần thanh khoản để tận dụng cơ hội khi thị trường giảm sâu.' },
      { heading: 'Phí giao dịch và cách tối ưu chi phí', body: 'KuCoin áp dụng phí Maker/Taker cạnh tranh, có thể giảm thêm khi nắm giữ KCS. Sử dụng lệnh limit thay vì market order giúp tiết kiệm phí taker. Chương trình VIP tier cũng cung cấp mức phí ưu đãi cho trader khối lượng lớn.' },
    ],
  },
  'giao-dich-ky-quy': {
    title: 'Giao Dịch Ký Quỹ: Tăng Tốc Lợi Nhuận Với Đòn Bẩy Thông Minh',
    category: 'Giao dịch',
    readMin: 10,
    date: '18/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    sections: [
      { heading: 'Giao dịch ký quỹ là gì?', body: 'Giao dịch ký quỹ (Margin Trading) cho phép bạn vay vốn từ sàn để gia tăng sức mua, từ đó khuếch đại lợi nhuận tiềm năng. Với đòn bẩy 10x, bạn có thể kiểm soát vị thế 10.000 USDT chỉ với 1.000 USDT vốn thực. Tuy nhiên, mức lỗ cũng được khuếch đại tương ứng.' },
      { heading: 'Isolated vs Cross Margin', body: 'Isolated Margin giới hạn rủi ro trong một vị thế cụ thể – nếu bị thanh lý, chỉ số margin bạn phân bổ cho vị thế đó bị mất. Cross Margin sử dụng toàn bộ số dư tài khoản làm tài sản thế chấp, linh hoạt hơn nhưng rủi ro cao hơn.' },
      { heading: 'Cách tính Margin Ratio và tránh bị thanh lý', body: 'Tỷ lệ ký quỹ (Margin Ratio) = Vốn sở hữu / Tổng tài sản. Khi tỷ lệ này giảm xuống ngưỡng cảnh báo (thường 80-100%), sàn gửi margin call. Khi xuống ngưỡng thanh lý (thường 10-15%), vị thế bị đóng cưỡng chế. Luôn theo dõi tỷ lệ này và thêm margin khi cần.' },
      { heading: 'Chiến lược sử dụng đòn bẩy an toàn', body: 'Khuyến nghị chỉ sử dụng đòn bẩy 2-3x với người mới; 5-10x dành cho trader có kinh nghiệm. Kết hợp stop-loss chặt chẽ và không bao giờ để một vị thế ký quỹ "chạy tự do" qua đêm mà không có kế hoạch quản lý rủi ro rõ ràng.' },
    ],
  },
  'bot-giao-dich': {
    title: 'Bot Giao Dịch Tự Động: Giao Dịch 24/7 Không Cần Ngủ',
    category: 'Giao dịch',
    readMin: 7,
    date: '15/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
    sections: [
      { heading: 'Bot giao dịch hoạt động như thế nào?', body: 'Bot giao dịch là phần mềm tự động thực hiện lệnh mua/bán dựa trên các tham số và chiến lược được lập trình sẵn. Bot kết nối với sàn qua API và hoạt động 24/7, loại bỏ yếu tố cảm xúc và đảm bảo thực hiện chiến lược một cách nhất quán.' },
      { heading: 'Các loại bot phổ biến trên KuCoin', body: 'Grid Bot đặt lưới lệnh mua/bán ở các mức giá cách đều nhau, lý tưởng cho thị trường sideway. DCA Bot tự động mua thêm khi giá giảm theo kế hoạch định sẵn. Smart Rebalance Bot duy trì tỷ trọng danh mục tối ưu theo thời gian thực.' },
      { heading: 'Cách thiết lập Grid Bot hiệu quả', body: 'Xác định khoảng giá hoạt động dựa trên phân tích lịch sử. Số lưới càng nhiều, profit/lệnh càng nhỏ nhưng tần suất giao dịch cao hơn. Khuyến nghị 50-100 lưới với khoảng giá tương đương 20-30% biên độ giao động lịch sử.' },
      { heading: 'Rủi ro cần lưu ý khi dùng bot', body: 'Bot không thể dự đoán sự kiện bất ngờ (black swan). Luôn đặt giới hạn stop-loss tổng cho danh mục. Kiểm tra hiệu suất bot định kỳ và điều chỉnh tham số khi điều kiện thị trường thay đổi.' },
    ],
  },

  /* ───────── PHÁI SINH ───────── */
  'hop-dong-tuong-lai': {
    title: 'Hợp Đồng Tương Lai Tiền Điện Tử: Cơ Hội Và Rủi Ro',
    category: 'Phái sinh',
    readMin: 12,
    date: '22/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    sections: [
      { heading: 'Hợp đồng tương lai là gì?', body: 'Hợp đồng tương lai (Futures) là thỏa thuận mua/bán một tài sản ở mức giá xác định trong tương lai. Trên thị trường tiền điện tử, phổ biến nhất là hợp đồng vĩnh cửu (perpetual futures) – không có ngày đáo hạn, với cơ chế funding rate để neo giá với thị trường giao ngay.' },
      { heading: 'Long và Short – Kiếm tiền cả hai chiều', body: 'Với futures, bạn có thể kiếm lời khi giá tăng (long/mua) và cả khi giá giảm (short/bán khống). Đây là lợi thế lớn so với giao dịch giao ngay truyền thống, cho phép bảo hiểm danh mục (hedging) hoặc đầu cơ trong mọi điều kiện thị trường.' },
      { heading: 'Funding Rate và chi phí nắm giữ vị thế', body: 'Funding rate là khoản phí trao đổi giữa trader long và short mỗi 8 giờ. Khi thị trường tăng mạnh, funding dương – trader long trả phí cho trader short. Theo dõi funding rate giúp tránh các vị thế tốn kém và đôi khi tìm được cơ hội arbitrage.' },
      { heading: 'Hợp đồng USDT-M vs Coin-M', body: 'USDT-M (Linear): PnL tính bằng USDT, lý tưởng khi muốn kết quả ổn định theo USD. Coin-M (Inverse): PnL tính bằng coin cơ sở (BTC, ETH), phù hợp khi tin tưởng coin sẽ tăng giá dài hạn và muốn gia tăng số lượng coin nắm giữ.' },
      { heading: 'Phòng vệ danh mục với Futures', body: 'Nếu bạn nắm giữ 1 BTC và lo ngại giá giảm ngắn hạn, bạn có thể short 1 BTC future để "khóa" giá trị danh mục mà không cần bán BTC thực. Đây là chiến lược hedging phổ biến trong quản lý tài sản chuyên nghiệp.' },
    ],
  },
  'phai-sinh-option': {
    title: 'Quyền Chọn (Options): Công Cụ Phòng Vệ Nâng Cao',
    category: 'Phái sinh',
    readMin: 9,
    date: '19/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
    sections: [
      { heading: 'Quyền chọn hoạt động như thế nào?', body: 'Quyền chọn (Options) cho người mua quyền (không phải nghĩa vụ) mua hoặc bán tài sản ở mức giá cố định (strike price) trong thời hạn nhất định. Người mua trả phí bảo hiểm (premium); người bán nhận phí nhưng chịu nghĩa vụ thực hiện hợp đồng.' },
      { heading: 'Call Option và Put Option', body: 'Call Option: quyền mua tài sản – có lợi khi giá tăng. Put Option: quyền bán tài sản – có lợi khi giá giảm. Chiến lược kết hợp như straddle (mua cả call và put cùng strike) cho phép kiếm lời khi biến động mạnh bất kể hướng.' },
      { heading: 'Sử dụng Options để bảo vệ danh mục', body: 'Mua put option tương đương mua bảo hiểm cho tài sản. Ví dụ: nắm giữ 1 BTC, mua put option với strike 90.000 USDT – nếu BTC giảm xuống 70.000, put option bù đắp phần lỗ. Chi phí là premium – mức "phí bảo hiểm" bạn chấp nhận trả.' },
      { heading: 'Greeks: các thước đo rủi ro quan trọng', body: 'Delta đo mức thay đổi giá option khi giá tài sản thay đổi 1 đơn vị. Gamma đo tốc độ thay đổi của Delta. Theta đo sự suy giảm giá trị option theo thời gian. Vega đo độ nhạy với biến động (volatility). Nắm vững Greeks giúp quản lý rủi ro chính xác hơn.' },
    ],
  },

  /* ───────── TRUNG TÂM BỆ PHÓNG ───────── */
  'launchpad-la-gi': {
    title: 'KuCoin Launchpad: Cơ Hội Tham Gia Sớm Vào Các Dự Án Tiềm Năng',
    category: 'Trung tâm bệ phóng',
    readMin: 7,
    date: '23/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>,
    sections: [
      { heading: 'Launchpad là gì?', body: 'KuCoin Launchpad là nền tảng phát hành token cho phép người dùng tham gia mua token của các dự án blockchain mới trước khi chúng được niêm yết trên thị trường mở. Đây là cơ hội tiếp cận sớm các dự án có tiềm năng với giá ưu đãi.' },
      { heading: 'Cách tham gia Launchpad', body: 'Để tham gia, bạn cần nắm giữ một lượng KCS tối thiểu trong tài khoản trong suốt thời gian snapshot. Lượng token bạn được phân bổ tỉ lệ thuận với số KCS nắm giữ so với tổng pool. Hoàn thành KYC và đảm bảo tài khoản đã xác minh đầy đủ.' },
      { heading: 'Lịch sử dự án thành công từ Launchpad', body: 'Nhiều dự án được ra mắt qua KuCoin Launchpad đã đạt mức tăng trưởng vượt trội sau khi niêm yết. Việc nghiên cứu kỹ whitepaper, tokenomics, đội ngũ phát triển và roadmap là bước không thể bỏ qua trước khi tham gia.' },
      { heading: 'Rủi ro và lưu ý khi tham gia Launchpad', body: 'Không phải dự án nào cũng thành công sau khi niêm yết. Phân bổ vốn hợp lý, không đặt quá nhiều kỳ vọng vào một dự án duy nhất. Đọc kỹ điều khoản lock-up period (thời gian khóa token) nếu có, để lên kế hoạch thanh khoản phù hợp.' },
    ],
  },
  'ido-ieo-ico': {
    title: 'IDO, IEO, ICO: Hiểu Đúng Về Các Hình Thức Gọi Vốn Blockchain',
    category: 'Trung tâm bệ phóng',
    readMin: 8,
    date: '21/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>,
    sections: [
      { heading: 'ICO – Người tiên phong', body: 'Initial Coin Offering (ICO) là hình thức gọi vốn đầu tiên trong không gian crypto, tương tự IPO nhưng phát hành token thay vì cổ phiếu. Sự bùng nổ ICO năm 2017-2018 tạo ra hàng nghìn dự án, nhưng cũng kéo theo nhiều dự án lừa đảo (exit scam).' },
      { heading: 'IEO – Gọi vốn qua sàn giao dịch', body: 'Initial Exchange Offering (IEO) được thực hiện trực tiếp trên sàn giao dịch như KuCoin, mang lại lớp bảo vệ bổ sung: sàn thực hiện due diligence trước khi chấp nhận dự án. IEO thường có uy tín cao hơn ICO và token thường được niêm yết ngay sau đó.' },
      { heading: 'IDO – Gọi vốn phi tập trung', body: 'Initial DEX Offering (IDO) diễn ra trên các sàn phi tập trung (DEX) hoặc launchpad DeFi. Mang tính phi tập trung, cho phép ai cũng tham gia không cần KYC, nhưng cũng tiềm ẩn rủi ro cao hơn về bảo mật và chất lượng dự án.' },
      { heading: 'Tiêu chí đánh giá dự án Launchpad', body: 'Kiểm tra: (1) Whitepaper rõ ràng, có vấn đề thực tế cần giải quyết; (2) Đội ngũ có kinh nghiệm và công khai danh tính; (3) Tokenomics hợp lý, không phân bổ quá nhiều cho insider; (4) Roadmap thực tế; (5) Đối tác và nhà đầu tư chiến lược uy tín.' },
    ],
  },

  /* ───────── KIẾM TIỀN ───────── */
  'staking-la-gi': {
    title: 'Staking Tiền Điện Tử: Để Tiền Làm Việc Thay Bạn',
    category: 'Kiếm tiền',
    readMin: 6,
    date: '24/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M11.5 8.5A2.5 2.5 0 0 0 9 11v0a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5"></path></svg>,
    sections: [
      { heading: 'Staking là gì?', body: 'Staking là quá trình khóa tiền điện tử để hỗ trợ hoạt động của mạng blockchain (trong cơ chế Proof of Stake) và nhận phần thưởng. Tương tự gửi tiết kiệm ngân hàng, nhưng lãi suất thường cao hơn nhiều và thanh toán bằng chính đồng coin bạn staking.' },
      { heading: 'Tại sao APR của Staking lại cao?', body: 'Phần thưởng staking đến từ phí giao dịch trên mạng và token mới được phát hành theo cơ chế inflation. Mạng blockchain cần validator để xác nhận giao dịch và bảo mật mạng – staker là những validator này và được trả công xứng đáng.' },
      { heading: 'Liquid Staking: giải pháp cho vấn đề thanh khoản', body: 'Staking thông thường yêu cầu khóa token trong thời gian cố định. Liquid staking (như stETH trên Lido) cho bạn nhận token đại diện (derivative) có thể giao dịch tự do trong khi vẫn nhận phần thưởng staking. KuCoin hỗ trợ nhiều sản phẩm liquid staking hấp dẫn.' },
      { heading: 'Cách tối đa hóa thu nhập từ Staking', body: 'Tìm kiếm các chương trình staking có thưởng kép (double-reward). Tái đầu tư (compound) phần thưởng thường xuyên để tận dụng lãi kép. Theo dõi thị trường để chuyển sang staking đồng coin có APR cao hơn khi điều kiện thuận lợi.' },
    ],
  },
  'yield-farming': {
    title: 'Yield Farming DeFi: Chiến Lược Tối Đa Hóa Lợi Suất',
    category: 'Kiếm tiền',
    readMin: 9,
    date: '17/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    sections: [
      { heading: 'Yield Farming là gì?', body: 'Yield Farming (canh tác lợi suất) là chiến lược cung cấp thanh khoản cho các giao thức DeFi để nhận phần thưởng. Bạn gửi tài sản vào liquidity pool, nhận LP token và dùng LP token đó để farm thêm token thưởng. APY có thể lên đến vài trăm phần trăm trong giai đoạn đầu.' },
      { heading: 'Liquidity Pool và Impermanent Loss', body: 'Cung cấp thanh khoản đòi hỏi gửi cặp token (ví dụ: ETH/USDT) với tỷ lệ 50/50. Khi giá một trong hai token thay đổi mạnh, bạn có thể chịu "impermanent loss" – giá trị danh mục thấp hơn so với chỉ nắm giữ. Phí giao dịch nhận được cần bù đắp khoản này.' },
      { heading: 'Chiến lược Stablecoin Farming giảm thiểu rủi ro', body: 'Farm với các cặp stablecoin (USDT/USDC, DAI/USDC) loại bỏ hoàn toàn rủi ro impermanent loss. APY thấp hơn (5-20%) nhưng an toàn hơn nhiều, phù hợp với nhà đầu tư bảo thủ muốn lợi suất cao hơn gửi ngân hàng.' },
      { heading: 'Rủi ro smart contract và cách phòng tránh', body: 'Luôn chọn giao thức đã được audit bởi bên thứ ba uy tín. Bắt đầu với số vốn nhỏ để kiểm tra. Theo dõi Total Value Locked (TVL) – TVL cao thường phản ánh độ tin cậy của giao thức. Đừng bị cám dỗ bởi APY quá cao bất thường (nguy cơ rug pull).' },
    ],
  },

  /* ───────── TỔ CHỨC ───────── */
  'to-chuc-crypto': {
    title: 'Đầu Tư Crypto Tổ Chức: Xu Hướng Định Hình Thị Trường 2026',
    category: 'Tổ chức',
    readMin: 11,
    date: '25/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M12 2v8"/><path d="m5 6 7-4 7 4"/></svg>,
    sections: [
      { heading: 'Làn sóng tổ chức tham gia thị trường crypto', body: 'Từ năm 2020, thị trường chứng kiến sự dịch chuyển lớn khi các tổ chức tài chính truyền thống (quỹ đầu tư, ngân hàng, công ty niêm yết) bắt đầu phân bổ tài sản vào Bitcoin và Ethereum. Sự ra đời của Bitcoin ETF tại Mỹ năm 2024 mở ra cơ hội tiếp cận mới cho dòng tiền tổ chức khổng lồ.' },
      { heading: 'Tại sao tổ chức chọn crypto?', body: 'Bitcoin được coi là "vàng kỹ thuật số" – kho lưu trữ giá trị chống lạm phát với nguồn cung giới hạn 21 triệu BTC. Thêm vào đó, tương quan thấp với tài sản truyền thống giúp crypto nâng cao hiệu suất điều chỉnh theo rủi ro của danh mục đầu tư tổng thể (portfolio optimization).' },
      { heading: 'KuCoin cho nhà đầu tư tổ chức', body: 'KuCoin cung cấp dịch vụ OTC desk cho giao dịch khối lượng lớn không ảnh hưởng thị trường, API tốc độ cao cho nhà tạo lập thị trường, custodian solution đảm bảo bảo mật tài sản cấp tổ chức, và báo cáo thuế chuyên nghiệp.' },
      { heading: 'Quản lý rủi ro cấp tổ chức', body: 'Tổ chức áp dụng framework quản lý rủi ro nghiêm ngặt: giới hạn phân bổ crypto trong tổng danh mục (thường 1-5%), đa dạng hóa qua nhiều tài sản và chiến lược, sử dụng derivatives để hedging, và báo cáo định kỳ cho ban lãnh đạo.' },
      { heading: 'Quy định và tuân thủ (Compliance)', body: 'Nhà đầu tư tổ chức phải tuân thủ quy định AML/KYC, báo cáo giao dịch theo quy định địa phương, và đảm bảo lưu ký tài sản đúng chuẩn. KuCoin hợp tác với các đối tác tuân thủ toàn cầu để hỗ trợ khách hàng tổ chức đáp ứng mọi yêu cầu pháp lý.' },
    ],
  },
  'otc-giao-dich-lon': {
    title: 'Giao Dịch OTC: Mua Bán Khối Lượng Lớn Không Ảnh Hưởng Thị Trường',
    category: 'Tổ chức',
    readMin: 7,
    date: '22/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
    sections: [
      { heading: 'OTC là gì và tại sao cần thiết?', body: 'Over-The-Counter (OTC) là giao dịch trực tiếp giữa hai bên mà không qua order book công khai. Khi mua/bán số lượng lớn qua sàn thông thường, lệnh sẽ "ăn" nhiều mức giá khác nhau (slippage), đẩy giá tăng/giảm mạnh và thiệt hại cho cả hai phía. OTC giải quyết vấn đề này.' },
      { heading: 'KuCoin OTC Desk hoạt động như thế nào?', body: 'Liên hệ đội ngũ OTC của KuCoin qua kênh chuyên biệt. Nhận báo giá tức thì cho toàn bộ khối lượng giao dịch. Thực hiện giao dịch ở một mức giá cố định, đảm bảo không slippage. Phù hợp cho giao dịch từ 50.000 USDT trở lên.' },
      { heading: 'Lợi ích của giao dịch OTC', body: 'Giá tốt hơn nhờ loại bỏ slippage. Bảo mật thông tin – giao dịch không hiển thị công khai. Thanh toán nhanh và linh hoạt (nhiều phương thức). Hỗ trợ 24/7 từ chuyên gia OTC. Phù hợp với cả mua và bán tiền điện tử số lượng lớn.' },
    ],
  },

  /* ───────── XEM THÊM ───────── */
  'bao-mat-tai-khoan': {
    title: 'Bảo Mật Tài Khoản Crypto: 10 Thói Quen Không Thể Bỏ Qua',
    category: 'Xem thêm',
    readMin: 6,
    date: '24/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    sections: [
      { heading: 'Xác thực hai yếu tố (2FA) – Lớp bảo vệ đầu tiên', body: 'Luôn bật 2FA, ưu tiên sử dụng ứng dụng xác thực (Google Authenticator, Authy) thay vì SMS. SMS có thể bị tấn công SIM swapping – hacker thuyết phục nhà mạng chuyển số điện thoại của bạn sang SIM của chúng.' },
      { heading: 'Mật khẩu mạnh và quản lý mật khẩu', body: 'Sử dụng mật khẩu ngẫu nhiên độ dài ≥20 ký tự, khác nhau cho mỗi tài khoản. Dùng password manager (Bitwarden, 1Password) để quản lý. Không bao giờ tái sử dụng mật khẩu và thay đổi định kỳ mỗi 3-6 tháng.' },
      { heading: 'Phòng tránh Phishing – Kẻ thù tinh vi nhất', body: 'Luôn kiểm tra URL trước khi đăng nhập – bookmark trang chính thức thay vì tìm kiếm trên Google. Email giả mạo thường có domain gần giống (kucoin.com vs kuc0in.com). Không bao giờ nhập thông tin tài khoản theo link trong email.' },
      { heading: 'Cold Wallet cho tài sản dài hạn', body: 'Với số tiền lớn, sử dụng hardware wallet (Ledger, Trezor) để lưu trữ offline. Private key không bao giờ online = hacker không thể đánh cắp. Backup seed phrase vào ít nhất 2 nơi an toàn khác nhau, không lưu trên thiết bị điện tử.' },
      { heading: 'Whitelist địa chỉ rút tiền', body: 'Bật tính năng whitelist địa chỉ rút tiền trên KuCoin. Chỉ địa chỉ trong danh sách trắng mới có thể nhận tiền rút từ tài khoản. Thêm địa chỉ mới yêu cầu xác nhận qua email và 2FA, tạo thêm 24-48h chờ đợi để phát hiện hành vi bất thường.' },
    ],
  },
  'hoc-ve-blockchain': {
    title: 'Blockchain Là Gì? Hiểu Từ Cơ Bản Đến Nâng Cao',
    category: 'Xem thêm',
    readMin: 10,
    date: '20/05/2026',
    hero: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
    sections: [
      { heading: 'Blockchain – Cuốn sổ cái bất biến', body: 'Blockchain là cơ sở dữ liệu phân tán, lưu trữ thông tin trong các "block" được liên kết với nhau theo chuỗi thời gian. Mỗi block chứa dữ liệu giao dịch, timestamp và hash của block trước. Một khi được ghi, dữ liệu không thể thay đổi mà không cần thay đổi toàn bộ chuỗi – điều này đòi hỏi sự đồng thuận của đa số mạng lưới.' },
      { heading: 'Proof of Work vs Proof of Stake', body: 'PoW (Bitcoin): máy tính giải bài toán phức tạp để xác nhận giao dịch và nhận thưởng – tốn nhiều điện năng nhưng bảo mật cao. PoS (Ethereum sau The Merge): validator đặt cược (stake) tiền để được quyền xác nhận – tiết kiệm năng lượng hơn 99% và tốc độ xử lý nhanh hơn.' },
      { heading: 'Smart Contract – Hợp đồng tự thực thi', body: 'Smart contract là đoạn code chạy trên blockchain, tự động thực hiện các điều khoản khi điều kiện được thỏa mãn. Ví dụ: token tự động chuyển đến người mua khi nhận đủ thanh toán, không cần bên trung gian. Nền tảng của toàn bộ hệ sinh thái DeFi và NFT.' },
      { heading: 'Layer 2 – Giải pháp mở rộng quy mô', body: 'Ethereum xử lý ~15 giao dịch/giây – quá chậm cho ứng dụng đại trà. Layer 2 (Polygon, Arbitrum, Optimism) xây dựng trên Ethereum, xử lý giao dịch off-chain và ghi kết quả lên mainchain định kỳ. Phí rẻ hơn 10-100x, tốc độ nhanh hơn hàng chục lần.' },
    ],
  },
};

/* Danh sách bài viết theo category */
const CATEGORIES = {
  'giao-dich': { label: 'Giao dịch', color: '#3b82f6' },
  'phai-sinh': { label: 'Phái sinh', color: '#8b5cf6' },
  'launchpad': { label: 'Trung tâm bệ phóng', color: '#f59e0b' },
  'kiem-tien': { label: 'Kiếm tiền', color: '#10b981' },
  'to-chuc': { label: 'Tổ chức', color: '#ef4444' },
  'xem-them': { label: 'Xem thêm', color: '#6b7280' },
};

const CATEGORY_ARTICLES = {
  'giao-dich': ['giao-dich-giao-ngay', 'giao-dich-ky-quy', 'bot-giao-dich'],
  'phai-sinh': ['hop-dong-tuong-lai', 'phai-sinh-option'],
  'launchpad': ['launchpad-la-gi', 'ido-ieo-ico'],
  'kiem-tien': ['staking-la-gi', 'yield-farming'],
  'to-chuc': ['to-chuc-crypto', 'otc-giao-dich-lon'],
  'xem-them': ['bao-mat-tai-khoan', 'hoc-ve-blockchain'],
};

/* ============================================================
   ARTICLE DETAIL PAGE
   ============================================================ */
function ArticleDetail({ slug }) {
  const navigate = useNavigate();
  const article = ARTICLES[slug];
  if (!article) return <div style={{color:'#fff',padding:'80px',textAlign:'center'}}>Bài viết không tồn tại</div>;

  const relatedSlugs = Object.keys(ARTICLES).filter(
    s => s !== slug && ARTICLES[s].category === article.category
  ).slice(0, 3);

  return (
    <div className="ap-detail">
      <div className="ap-detail-container">
        {/* Back */}
        <button className="ap-back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        {/* Hero */}
        <div className="ap-article-hero">
          <div className="ap-category-badge" style={{ background: 'rgba(36,219,155,0.12)', color: '#24DB9B' }}>
            {article.category}
          </div>
          <div className="ap-hero-emoji">{article.hero}</div>
          <h1 className="ap-article-title">{article.title}</h1>
          <div className="ap-article-meta">
            <span>📅 {article.date}</span>
            <span>⏱ {article.readMin} phút đọc</span>
          </div>
        </div>

        {/* Content */}
        <div className="ap-article-body">
          {article.sections.map((sec, i) => (
            <div key={i} className="ap-section">
              <h2 className="ap-section-heading">{sec.heading}</h2>
              <p className="ap-section-body">{sec.body}</p>
            </div>
          ))}
        </div>

        {/* Related */}
        {relatedSlugs.length > 0 && (
          <div className="ap-related">
            <h3 className="ap-related-title">Bài viết liên quan</h3>
            <div className="ap-related-grid">
              {relatedSlugs.map(s => (
                <Link to={`/articles/${s}`} key={s} className="ap-related-card">
                  <div className="ap-related-emoji">{ARTICLES[s].hero}</div>
                  <div className="ap-related-info">
                    <div className="ap-related-cat">{ARTICLES[s].category}</div>
                    <div className="ap-related-name">{ARTICLES[s].title}</div>
                    <div className="ap-related-read">{ARTICLES[s].readMin} phút đọc</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORY LISTING PAGE
   ============================================================ */
function CategoryListing({ cat }) {
  const navigate = useNavigate();
  const slugs = CATEGORY_ARTICLES[cat] || [];
  const catInfo = CATEGORIES[cat];

  return (
    <div className="ap-listing">
      <div className="ap-listing-container">
        <button className="ap-back-btn" onClick={() => navigate('/')}>← Trang chủ</button>
        <div className="ap-listing-hero">
          <div className="ap-category-badge" style={{ background: `${catInfo?.color}22`, color: catInfo?.color }}>
            {catInfo?.label}
          </div>
          <h1 className="ap-listing-title">Bài viết về {catInfo?.label}</h1>
          <p className="ap-listing-sub">Cập nhật kiến thức và chiến lược từ chuyên gia</p>
        </div>
        <div className="ap-cards-grid">
          {slugs.map(slug => {
            const art = ARTICLES[slug];
            return (
              <Link to={`/articles/${slug}`} key={slug} className="ap-card">
                <div className="ap-card-emoji">{art.hero}</div>
                <div className="ap-card-body">
                  <div className="ap-card-cat" style={{ color: catInfo?.color }}>{art.category}</div>
                  <h3 className="ap-card-title">{art.title}</h3>
                  <p className="ap-card-excerpt">{art.sections[0]?.body.slice(0, 100)}...</p>
                  <div className="ap-card-footer">
                    <span>📅 {art.date}</span>
                    <span>⏱ {art.readMin} phút đọc</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* All articles teaser */}
        <div className="ap-all-section">
          <h2 className="ap-all-title">Khám phá thêm</h2>
          <div className="ap-cat-chips">
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <Link to={`/articles/category/${k}`} key={k} className="ap-cat-chip" style={{ borderColor: v.color, color: v.color }}>
                {v.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROUTER COMPONENT
   ============================================================ */
export default function ArticlesPage() {
  const { slug, cat } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, cat]);

  return (
    <div className="ap-root">
      {/* Simple nav */}
      <nav className="ap-nav">
        <Link to="/" className="ap-nav-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7.5 4L4 7.5V16.5L7.5 20H10.5L7 16.5V7.5L10.5 4H7.5Z" fill="#24DB9B" />
            <path d="M16.5 4L20 7.5V16.5L16.5 20H13.5L17 16.5V7.5L13.5 4H16.5Z" fill="#24DB9B" />
            <path d="M12 10L14 12L12 14L10 12L12 10Z" fill="#24DB9B" />
          </svg>
          <span>KUCOIN</span>
        </Link>
        <div className="ap-nav-links">
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <Link to={`/articles/category/${k}`} key={k} className="ap-nav-link">{v.label}</Link>
          ))}
        </div>
      </nav>

      {slug ? <ArticleDetail slug={slug} /> : cat ? <CategoryListing cat={cat} /> : <CategoryListing cat="giao-dich" />}
    </div>
  );
}
