const express = require('express');
const {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getCategories,
  getTags,
  getPublishedBlogs,
  getArchives,
  togglePublishBlog,
} = require('../controllers/blogController');
const {
  validateBlogData,
  validateBlogUpdateData,
  sanitizeBlogData,
} = require('../middleware/blogValidation');

const router = express.Router();

// GET /api/blogs/categories - Lấy danh sách categories
router.get('/categories', getCategories);

// GET /api/blogs/tags - Lấy danh sách tags
router.get('/tags', getTags);

// GET /api/blogs/archives - Lấy danh sách archives
router.get('/archives', getArchives);

// GET /api/blogs - Lấy danh sách blogs với pagination, search, filter
router.get('/', getAllBlogs);

// GET /api/blogs/published - Lấy danh sách blogs đã xuất bản
router.get('/published', getPublishedBlogs);

// GET /api/blogs/slug/:slug - Lấy blog theo slug
router.get('/:slug', getBlogBySlug);

// GET /api/blogs/:id - Lấy blog theo ID
router.get('/:id', getBlogById);

// POST /api/blogs - Tạo blog mới
router.post('/', sanitizeBlogData, validateBlogData, createBlog);

// PUT /api/blogs/:id - Cập nhật blog
router.put('/:id', sanitizeBlogData, validateBlogUpdateData, updateBlog);

// DELETE /api/blogs/:id - Xóa blog
router.delete('/:id', deleteBlog);

// POST /api/blogs/:id/like - Like/Unlike blog
router.post('/:id/like', toggleLike);

// PUT /api/blogs/:id/toggle-publish - Ẩn/Hiện blog (isPublished toggle)
router.put('/:id/toggle-publish', togglePublishBlog);

module.exports = router;
