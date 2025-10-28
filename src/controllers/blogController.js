const { monthNames } = require('../constants');
const Blog = require('../models/Blog');
const { createSlug } = require('../utils');

// GET /api/blogs - Lấy danh sách blogs (list view)
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tag,
      isPublished,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = req.query;

    // Tạo filter object
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      // Nếu category có dấu hoặc chứa khoảng trắng => có thể là tên
      const isSlug = /^[a-z0-9-]+$/.test(category);

      if (isSlug) {
        // Lọc theo slug
        filter['category.slug'] = category.toLowerCase();
      } else {
        // Lọc theo tên (không phân biệt hoa thường)
        filter['category.name'] = new RegExp(category, 'i');
      }
    }

    if (tag) {
      filter.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    };

    // Execute queries
    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .limit(options.limit)
        .skip((options.page - 1) * options.limit)
        .sort(options.sort)
        .select('-content'), // Exclude content for list view
      Blog.countDocuments(filter),
    ]);

    // Transform to list view
    const blogList = blogs.map((blog) => blog.getAllListView());

    res.json({
      success: true,
      data: blogList,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalBlogs: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1,
        limit: options.limit,
      },
      filters: {
        search,
        category,
        tag,
        isPublished,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách blogs',
      error: error.message,
    });
  }
};

// GET /api/blogs/published/ - Lấy blog đã published
const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .select('-content'); // Exclude content for list view

    const blogList = blogs.map((blog) => blog.getListView());

    res.json({
      success: true,
      data: blogList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách blog đã published',
      error: error.message,
    });
  }
};

// GET /api/blogs/:id - Lấy blog theo ID (detail view)
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog',
      });
    }

    // Tăng view count
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    blog.views += 1;

    res.json({
      success: true,
      data: blog.getDetailView(),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin blog',
      error: error.message,
    });
  }
};

// GET /api/blogs/slug/:slug - Lấy blog theo slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findBySlug(req.params.slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog với slug này',
      });
    }

    // Tăng view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    blog.views += 1;

    res.json({
      success: true,
      data: blog.getDetailView(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin blog',
      error: error.message,
    });
  }
};

// POST /api/blogs - Tạo blog mới
const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      author,
      publishedAt,
      readTime,
      isPublished,
    } = req.body;

    // Kiểm tra slug đã tồn tại
    if (slug) {
      const existingBlog = await Blog.findBySlug(slug);
      if (existingBlog) {
        return res.status(409).json({
          success: false,
          message: 'Slug đã được sử dụng',
        });
      }
    }

    // Tạo blog mới
    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags: tags || [],
      author,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      readTime,
      isPublished: isPublished || false,
    });

    const savedBlog = await blog.save();

    res.status(201).json({
      success: true,
      message: 'Tạo blog thành công',
      data: savedBlog.getDetailView(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Slug đã được sử dụng',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo blog',
      error: error.message,
    });
  }
};

// PUT /api/blogs/:id - Cập nhật blog
const updateBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      author,
      publishedAt,
      readTime,
      isPublished,
    } = req.body;

    // Kiểm tra slug trùng (nếu có thay đổi slug)
    if (slug) {
      const existingBlog = await Blog.findOne({
        slug: slug.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingBlog) {
        return res.status(409).json({
          success: false,
          message: 'Slug đã được sử dụng bởi blog khác',
        });
      }
    }

    const updateData = {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      author,
      readTime,
      isPublished,
    };

    if (publishedAt) {
      updateData.publishedAt = new Date(publishedAt);
    }

    // Loại bỏ các field undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật blog thành công',
      data: updatedBlog.getDetailView(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Slug đã được sử dụng',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật blog',
      error: error.message,
    });
  }
};

// DELETE /api/blogs/:id - Xóa blog
const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog',
      });
    }

    res.json({
      success: true,
      message: 'Xóa blog thành công',
      data: deletedBlog.getListView(),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa blog',
      error: error.message,
    });
  }
};

// PUT /api/blogs/:id/hide - Ẩn/Hiện blog (isPublished toggle)
const togglePublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog',
      });
    }

    blog.isPublished = !blog.isPublished;
    const updatedBlog = await blog.save();

    res.json({
      success: true,
      message: blog.isPublished ? 'Đã hiển thị blog' : 'Đã ẩn blog',
      data: updatedBlog.getDetailView(),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái hiển thị blog',
      error: error.message,
    });
  }
};

// POST /api/blogs/:id/like - Like/Unlike blog
const toggleLike = async (req, res) => {
  try {
    const { action = 'like' } = req.body; // 'like' or 'unlike'

    const increment = action === 'like' ? 1 : -1;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: increment } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy blog',
      });
    }

    res.json({
      success: true,
      message: action === 'like' ? 'Đã like blog' : 'Đã unlike blog',
      data: {
        id: blog._id,
        likes: blog.likes,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật like',
      error: error.message,
    });
  }
};

// GET /api/blogs/categories - Lấy danh sách categories
const getCategories = async (req, res) => {
  try {
    // Đếm tổng số bài viết đã published
    const totalCount = await Blog.countDocuments({ isPublished: true });

    // Sử dụng aggregation pipeline để group và đếm theo category
    const categoriesData = await Blog.aggregate([
      // Chỉ lấy những blog đã published
      { $match: { isPublished: true } },

      // Group theo category và đếm số lượng
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },

      // Sắp xếp theo tên category
      { $sort: { _id: 1 } },
    ]);

    // Chuyển đổi dữ liệu sang format mong muốn
    const categories = categoriesData.map((item) => ({
      ...item._id,
      count: item.count,
    }));

    // Thêm option "Tất cả" vào đầu danh sách
    const allCategories = [
      {
        name: 'Tất cả',
        slug: 'all',
        count: totalCount,
      },
      ...categories,
    ];

    res.json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách categories',
      error: error.message,
    });
  }
};

// GET /api/blogs/tags - Lấy danh sách tags
const getTags = async (req, res) => {
  try {
    // Sử dụng aggregation pipeline để xử lý tags và đếm
    const tagsData = await Blog.aggregate([
      // Chỉ lấy những blog đã published
      { $match: { isPublished: true } },

      // Unwind tags array để tách từng tag thành document riêng
      { $unwind: '$tags' },

      // Group theo tag và đếm số lượng
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },

      // Sắp xếp theo tên tag
      { $sort: { _id: 1 } },

      // Chuyển đổi format dữ liệu
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: tagsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tags',
      error: error.message,
    });
  }
};

// GET /api/blogs/archives - Lấy danh sách archive theo tháng
const getArchives = async (req, res) => {
  try {
    const totalCount = await Blog.countDocuments({ isPublished: true });
    // Sử dụng aggregation pipeline để group theo tháng/năm
    const archivesData = await Blog.aggregate([
      // Chỉ lấy những blog đã published
      { $match: { isPublished: true } },

      // Thêm fields tháng và năm từ createdAt hoặc publishedAt
      {
        $addFields: {
          year: { $year: '$publishedAt' }, // Hoặc "$publishedAt" nếu có field này
          month: { $month: '$publishedAt' },
        },
      },

      // Group theo năm và tháng
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
          },
          count: { $sum: 1 },
        },
      },

      // Sắp xếp theo năm và tháng giảm dần (mới nhất trước)
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    // Chuyển đổi dữ liệu sang format mong muốn
    const archives = archivesData.map((item) => {
      const monthName = monthNames[item._id.month - 1]; // Month bắt đầu từ 1
      const year = item._id.year;

      return {
        month: `${monthName}, ${year}`,
        count: item.count,
        slug: `${year}-${String(item._id.month).padStart(2, '0')}`,
      };
    });

    // Thêm option "Tất cả" vào đầu danh sách
    const allArchives = [
      {
        month: 'Tất cả',
        slug: 'all',
        count: totalCount,
      },
      ...archives,
    ];
    res.json({
      success: true,
      data: allArchives,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách archives',
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getCategories,
  getTags,
  getArchives,
  togglePublishBlog,
};
