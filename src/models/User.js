const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
      trim: true,
      maxlength: [50, 'Tên không được vượt quá 50 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ'],
    },
    age: {
      type: Number,
      min: [0, 'Tuổi phải lớn hơn 0'],
      max: [120, 'Tuổi phải nhỏ hơn 120'],
    },
    phone: {
      type: String,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },
    address: {
      street: String,
      city: String,
      country: {
        type: String,
        default: 'Vietnam',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    versionKey: false, // Loại bỏ __v field
  }
);

// Index để tối ưu tìm kiếm
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', email: 'text' });

// Virtual để lấy full name (nếu có first/last name)
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Đảm bảo virtual fields được included khi convert to JSON
userSchema.set('toJSON', {
  virtuals: true,
});

// Middleware trước khi save
userSchema.pre('save', function (next) {
  // Có thể thêm logic hash password ở đây sau này
  next();
});

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance methods
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    age: this.age,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
