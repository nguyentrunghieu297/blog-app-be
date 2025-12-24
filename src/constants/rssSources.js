const rssSources = [
  // =======================
  // VnExpress (Nguồn chính - tin nhanh, uy tín cao)
  // =======================
  {
    name: 'VnExpress',
    domain: 'vnexpress.net',
    icon: 'https://vnexpress.net/favicon.ico',
    categories: [
      { name: 'Thời sự', url: 'https://vnexpress.net/rss/thoi-su.rss' },
      { name: 'Kinh doanh', url: 'https://vnexpress.net/rss/kinh-doanh.rss' },
      { name: 'Khoa học', url: 'https://vnexpress.net/rss/khoa-hoc.rss' },
      { name: 'Công nghệ số', url: 'https://vnexpress.net/rss/so-hoa.rss' },
      // ❌ Loại bỏ: Bất động sản (ít quan trọng hơn)
    ],
  },

  // =======================
  // Tuổi Trẻ (Giới trẻ, công nghệ)
  // =======================
  {
    name: 'Tuổi Trẻ',
    domain: 'tuoitre.vn',
    icon: 'https://tuoitre.vn/favicon.ico',
    categories: [
      { name: 'Thời sự', url: 'https://tuoitre.vn/rss/thoi-su.rss' },
      { name: 'Công nghệ', url: 'https://tuoitre.vn/rss/nhip-song-so.rss' },
      { name: 'Thế giới', url: 'https://tuoitre.vn/rss/the-gioi.rss' },
      // ❌ Loại bỏ: Nhịp sống trẻ, Văn hóa (trùng với nguồn khác)
    ],
  },

  // =======================
  // Thanh Niên (Công nghệ chuyên sâu, blockchain)
  // =======================
  {
    name: 'Thanh Niên',
    domain: 'thanhnien.vn',
    icon: 'https://thanhnien.vn/favicon.ico',
    categories: [
      { name: 'Công nghệ', url: 'https://thanhnien.vn/rss/cong-nghe.rss' },
      { name: 'Blockchain', url: 'https://thanhnien.vn/rss/cong-nghe/blockchain.rss' },
      { name: 'Thể thao', url: 'https://thanhnien.vn/rss/the-thao.rss' },
      // ❌ Loại bỏ: Thời sự (đã có VnExpress, Tuổi Trẻ), Game (niche)
    ],
  },

  // =======================
  // Vietnamnet (Đời sống, sức khỏe)
  // =======================
  {
    name: 'Vietnamnet',
    domain: 'vietnamnet.vn',
    icon: 'https://vietnamnet.vn/favicon.ico',
    categories: [
      { name: 'Bất động sản', url: 'https://vietnamnet.vn/rss/bat-dong-san.rss' },
      { name: 'Sức khỏe', url: 'https://vietnamnet.vn/rss/suc-khoe.rss' },
      { name: 'Đời sống', url: 'https://vietnamnet.vn/rss/doi-song.rss' },
      // ❌ Loại bỏ: Thời sự, Công nghệ (đã có nguồn tốt hơn)
    ],
  },

  // =======================
  // Dân Trí (Pháp luật, ô tô)
  // =======================
  {
    name: 'Dân Trí',
    domain: 'dantri.com.vn',
    icon: 'https://dantri.com.vn/favicon.ico',
    categories: [
      { name: 'Pháp luật', url: 'https://dantri.com.vn/rss/phap-luat.rss' },
      { name: 'Ô tô - Xe máy', url: 'https://dantri.com.vn/rss/o-to-xe-may.rss' },
      { name: 'Văn hóa', url: 'https://dantri.com.vn/rss/van-hoa.rss' },
      // ❌ Loại bỏ: Công nghệ, Thế giới (đã đủ từ nguồn khác)
    ],
  },

  // =======================
  // Người Lao Động (Kinh tế, giải trí)
  // =======================
  {
    name: 'Người Lao Động',
    domain: 'nld.com.vn',
    icon: 'https://nld.com.vn/favicon.ico',
    categories: [
      { name: 'Kinh tế', url: 'https://nld.com.vn/rss/kinh-te.rss' },
      { name: 'Giải trí', url: 'https://nld.com.vn/rss/giai-tri.rss' },
      // ❌ Loại bỏ: Pháp luật (đã có Dân Trí), Sức khỏe (đã có Vietnamnet)
    ],
  },
];

module.exports = { rssSources };

// 📊 THỐNG KÊ:
// ✅ Trước: 30 feeds
// ✅ Sau: 18 feeds (giảm 40%)
//
// 📈 KẾT QUẢ DỰ KIẾN:
// - Load time giảm từ ~8-12s → ~4-6s
// - Vẫn đầy đủ coverage cho tất cả categories
// - Giữ lại nguồn uy tín nhất cho mỗi category
