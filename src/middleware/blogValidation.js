// Validation middleware cho blog
const validateBlogData = (req, res, next) => {
  const { title, excerpt, content, category, author } = req.body;
  const errors = [];

  // Validate required fields
  if (!title || title.trim().length === 0) {
    errors.push('Tiêu đề là bắt buộc');
  }

  if (!excerpt || excerpt.trim().length === 0) {
    errors.push('Tóm tắt là bắt buộc');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Nội dung là bắt buộc');
  }

  if (!category || category.name.trim().length === 0) {
    errors.push('Danh mục là bắt buộc');
  }

  // Validate author object
  if (!author || typeof author !== 'object') {
    errors.push('Thông tin tác giả là bắt buộc');
  } else {
    if (!author.name || author.name.trim().length === 0) {
      errors.push('Tên tác giả là bắt buộc');
    }
  }

  // Validate field lengths
  if (title && title.length > 200) {
    errors.push('Tiêu đề không được vượt quá 200 ký tự');
  }

  if (excerpt && excerpt.length > 500) {
    errors.push('Tóm tắt không được vượt quá 500 ký tự');
  }

  if (author && author.bio && author.bio.length > 500) {
    errors.push('Bio của tác giả không được vượt quá 500 ký tự');
  }

  // Validate slug format (if provided)
  if (req.body.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(req.body.slug)) {
      errors.push('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
    }
  }

  // Validate tags array
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.push('Tags phải là một mảng');
  }

  // Validate URL format (if provided)
  const urlFields = ['featuredImage', 'author.avatar'];
  urlFields.forEach((field) => {
    const value = field.includes('.')
      ? req.body[field.split('.')[0]]?.[field.split('.')[1]]
      : req.body[field];

    if (value && !isValidUrl(value)) {
      errors.push(`${field} phải là URL hợp lệ`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors,
    });
  }

  next();
};

// Validation middleware cho update blog (các field optional)
const validateBlogUpdateData = (req, res, next) => {
  const errors = [];

  // Validate field lengths (if provided)
  if (req.body.title && req.body.title.length > 200) {
    errors.push('Tiêu đề không được vượt quá 200 ký tự');
  }

  if (req.body.excerpt && req.body.excerpt.length > 500) {
    errors.push('Tóm tắt không được vượt quá 500 ký tự');
  }

  if (req.body.author?.bio && req.body.author.bio.length > 500) {
    errors.push('Bio của tác giả không được vượt quá 500 ký tự');
  }

  // Validate slug format (if provided)
  if (req.body.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(req.body.slug)) {
      errors.push('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
    }
  }

  // Validate tags array
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.push('Tags phải là một mảng');
  }

  // Validate author name if author object is provided
  if (req.body.author && (!req.body.author.name || req.body.author.name.trim().length === 0)) {
    errors.push('Tên tác giả là bắt buộc');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors,
    });
  }

  next();
};

// Helper function để validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Middleware để sanitize dữ liệu đầu vào
const sanitizeBlogData = (req, res, next) => {
  // Trim các string fields
  const stringFields = ['title', 'slug', 'excerpt', 'content', 'category', 'readTime'];
  stringFields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  });

  // Sanitize author object
  if (req.body.author) {
    if (req.body.author.name) {
      req.body.author.name = req.body.author.name.trim();
    }
    if (req.body.author.bio) {
      req.body.author.bio = req.body.author.bio.trim();
    }
  }

  // Sanitize tags array
  if (req.body.tags && Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags
      .map((tag) => (typeof tag === 'string' ? tag.trim() : tag))
      .filter((tag) => tag && tag.length > 0);
  }

  next();
};

module.exports = {
  validateBlogData,
  validateBlogUpdateData,
  sanitizeBlogData,
};
