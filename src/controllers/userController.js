const User = require('../models/User');

// GET /api/users - Lấy tất cả users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    // Tạo filter object
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const users = await User.find(filter)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort)
      .select('-__v');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalUsers: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message,
    });
  }
};

// GET /api/users/:id - Lấy user theo ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    res.json({
      success: true,
      data: user,
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
      message: 'Lỗi khi lấy thông tin user',
      error: error.message,
    });
  }
};

// POST /api/users - Tạo user mới
const createUser = async (req, res) => {
  try {
    const { name, email, age, phone, address } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Tạo user mới
    const user = new User({
      name,
      email,
      age,
      phone,
      address,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: savedUser.getPublicProfile(),
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

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo user',
      error: error.message,
    });
  }
};

// PUT /api/users/:id - Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { name, email, age, phone, address, isActive } = req.body;

    // Kiểm tra email trùng (nếu có thay đổi email)
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng bởi user khác',
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age, phone, address, isActive },
      {
        new: true,
        runValidators: true,
        select: '-__v',
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật user thành công',
      data: updatedUser,
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

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật user',
      error: error.message,
    });
  }
};

// DELETE /api/users/:id - Xóa user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    res.json({
      success: true,
      message: 'Xóa user thành công',
      data: deletedUser.getPublicProfile(),
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
      message: 'Lỗi khi xóa user',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
