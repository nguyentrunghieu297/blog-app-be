const mongoose = require('mongoose');
const Blog = require('../models/Blog'); // đường dẫn đến file Blog schema của bạn

async function rebuildIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mydb'); // hoặc URL Atlas
    console.log('✅ Đã kết nối MongoDB');
    console.log('🧹 Đang xóa index cũ...');
    await Blog.collection.dropIndexes();
    console.log('🧱 Đang tạo lại index mới...');
    await Blog.collection.createIndex({ title: 'text', excerpt: 'text' });
    console.log('✅ Hoàn tất cập nhật index!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

rebuildIndex();
