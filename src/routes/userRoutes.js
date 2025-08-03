const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users - Lấy tất cả users với pagination và search
router.get('/', getAllUsers);

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', getUserById);

// POST /api/users - Tạo user mới
router.post('/', createUser);

// PUT /api/users/:id - Cập nhật user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Xóa user
router.delete('/:id', deleteUser);

module.exports = router;
