// Mapping từ category key (FE) sang category names (BE)
const categoryMapping = {
  'tong-quan': null, // null = lấy tất cả
  'kinh-te': ['Kinh doanh', 'Kinh tế', 'Thuế - Tài chính'],
  'bat-dong-san': ['Bất động sản'],
  'cong-nghe': ['Công nghệ', 'Khoa học'],
  'doanh-nghiep': ['Kinh doanh'],
  'the-gioi': ['Thế giới'],
  'thoi-su': ['Thời sự'],
  'giai-tri': ['Giải trí'],
  'giao-duc': ['Giáo dục'],
};

// Danh sách categories hiển thị trên FE
const frontendCategories = [
  { label: 'Tổng quan', key: 'tong-quan' },
  { label: 'Kinh Tế', key: 'kinh-te' },
  { label: 'Bất Động Sản', key: 'bat-dong-san' },
  { label: 'Công Nghệ', key: 'cong-nghe' },
  { label: 'Doanh Nghiệp', key: 'doanh-nghiep' },
  { label: 'Thế Giới', key: 'the-gioi' },
  { label: 'Thời Sự', key: 'thoi-su' },
  { label: 'Giải Trí', key: 'giai-tri' },
  { label: 'Giáo Dục', key: 'giao-duc' },
];

module.exports = { categoryMapping, frontendCategories };
