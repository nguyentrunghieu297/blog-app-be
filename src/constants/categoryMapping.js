// Mapping từ category key (FE) sang category names (BE)
const categoryMapping = {
  'tong-quan': null, // null = lấy tất cả categories

  'kinh-te-tai-chinh': [
    'Kinh doanh',
    'Kinh tế',
    'Kinh tế vĩ mô',
    'Tài chính',
    'Tài chính - Ngân hàng',
    'Tài chính quốc tế',
    'Thuế - Tài chính',
    'Chứng khoán',
    'Thị trường chứng khoán',
    'Thị trường',
    'Doanh nghiệp',
    'Bất động sản',
    'Khởi nghiệp',
  ],

  'cong-nghe-khoa-hoc': [
    'Công nghệ',
    'Công nghệ số',
    'Khoa học',
    'Sức mạnh số',
    'Kinh tế số',
    'Blockchain',
    'Game',
    'Nhịp sống số',
  ],

  'thoi-su-the-gioi': [
    'Thời sự',
    'Xã hội',
    'Chính trị',
    'Thế giới',
    'Kinh tế thế giới',
    'Tài chính quốc tế',
    'Pháp luật',
  ],

  'van-hoa-giai-tri': ['Giải trí', 'Âm nhạc', 'Phim ảnh', 'Văn hóa', 'Lifestyle', 'Du lịch'],

  'giao-duc-suc-khoe': ['Giáo dục', 'Nhịp sống trẻ', 'Sống trẻ', 'Sức khỏe', 'Y tế'],

  'the-thao-doi-song': ['Thể thao', 'Bóng đá', 'Đời sống', 'Xe', 'Ô tô - Xe máy'],
};

// Danh sách categories hiển thị trên FE
const frontendCategories = [
  { label: 'Tổng quan', key: 'tong-quan', description: 'Tất cả tin tức' },
  {
    label: 'Kinh Tế & Tài Chính',
    key: 'kinh-te-tai-chinh',
    description: 'Kinh doanh, tài chính, chứng khoán, BĐS',
  },
  {
    label: 'Công Nghệ & Khoa Học',
    key: 'cong-nghe-khoa-hoc',
    description: 'Công nghệ, khoa học, chuyển đổi số',
  },
  {
    label: 'Thời Sự & Thế Giới',
    key: 'thoi-su-the-gioi',
    description: 'Tin trong nước, quốc tế, pháp luật',
  },
  {
    label: 'Văn Hóa & Giải Trí',
    key: 'van-hoa-giai-tri',
    description: 'Giải trí, văn hóa, du lịch',
  },
  {
    label: 'Giáo Dục & Sức Khỏe',
    key: 'giao-duc-suc-khoe',
    description: 'Giáo dục, y tế, đời sống trẻ',
  },
  {
    label: 'Thể Thao & Đời Sống',
    key: 'the-thao-doi-song',
    description: 'Thể thao, ô tô, đời sống',
  },
];

module.exports = { categoryMapping, frontendCategories };
