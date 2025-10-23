const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên tác giả là bắt buộc'],
      trim: true,
    },
    avatar: {
      type: String,
      default: '/placeholder.svg?height=100&width=100',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio không được vượt quá 500 ký tự'],
    },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug chỉ được chúa chữ thường, số và dấu gạch ngang'],
    },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: [true, 'Slug là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'],
    },
    excerpt: {
      type: String,
      required: [true, 'Tóm tắt là bắt buộc'],
      maxlength: [500, 'Tóm tắt không được vượt quá 500 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Nội dung là bắt buộc'],
    },
    featuredImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=400&fit=crop',
    },
    category: {
      type: categorySchema,
      required: [true, 'Danh mục là bắt buộc'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: authorSchema,
      required: [true, 'Thông tin tác giả là bắt buộc'],
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    readTime: {
      type: String,
      default: '5 phút đọc',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes để tối ưu tìm kiếm
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// Virtual để lấy URL
blogSchema.virtual('url').get(function () {
  return `/blog/${this.slug}`;
});

// Đảm bảo virtual fields được included khi convert to JSON
blogSchema.set('toJSON', {
  virtuals: true,
});

// Auto-generate slug từ title nếu không có
blogSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    // Chuyển đổi title thành slug
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/[\s_-]+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
  }
  next();
});

// Static methods
blogSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

blogSchema.statics.findPublished = function () {
  return this.find({ isPublished: true }).sort({ publishedAt: -1 });
};

blogSchema.statics.findByCategory = function (category) {
  return this.find({ category: category, isPublished: true });
};

blogSchema.statics.findByTag = function (tag) {
  return this.find({ tags: tag, isPublished: true });
};

// Instance methods
blogSchema.methods.getListView = function () {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    excerpt: this.excerpt,
    featuredImage: this.featuredImage,
    publishedAt: this.publishedAt,
    readTime: this.readTime,
    category: this.category,
    tags: this.tags,
    author: {
      name: this.author.name,
      avatar: this.author.avatar,
    },
    views: this.views,
    likes: this.likes,
  };
};

blogSchema.methods.getAllListView = function () {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    excerpt: this.excerpt,
    featuredImage: this.featuredImage,
    publishedAt: this.publishedAt,
    readTime: this.readTime,
    category: this.category,
    tags: this.tags,
    author: {
      name: this.author.name,
      avatar: this.author.avatar,
    },
    isPublished: this.isPublished,
    views: this.views,
    likes: this.likes,
  };
};

blogSchema.methods.getDetailView = function () {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    excerpt: this.excerpt,
    content: this.content,
    featuredImage: this.featuredImage,
    publishedAt: this.publishedAt,
    readTime: this.readTime,
    category: this.category,
    tags: this.tags,
    author: this.author,
    views: this.views,
    likes: this.likes,
    url: this.url,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Middleware để tính toán readTime dựa trên content length
blogSchema.pre('save', function (next) {
  if (this.content && !this.isModified('readTime')) {
    // Ước tính: 200 từ/phút đọc
    const wordCount = this.content.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / 200);
    this.readTime = `${readTimeMinutes} phút đọc`;
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
