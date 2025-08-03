# Express.js + MongoDB API

Một RESTful API được xây dựng với Express.js và MongoDB, có cấu trúc dự án được tổ chức tốt và dễ mở rộng.

## 🚀 Tính năng

- ✅ RESTful API với CRUD operations
- ✅ MongoDB integration với Mongoose
- ✅ Structured project architecture
- ✅ Error handling middleware
- ✅ Input validation
- ✅ CORS support
- ✅ Environment configuration
- ✅ Request logging
- ✅ Pagination và search
- ✅ Security headers

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB với Mongoose ODM
- **Other**: dotenv, cors

## 📁 Cấu trúc dự án

```
my-express-app/
├── src/
│   ├── config/
│   │   └── database.js          # Cấu hình kết nối MongoDB
│   ├── controllers/
│   │   ├── homeController.js    # Controller cho home routes
│   │   └── userController.js    # Controller cho user operations
│   ├── models/
│   │   └── User.js              # User model với Mongoose
│   ├── routes/
│   │   ├── index.js             # Main routes
│   │   └── userRoutes.js        # User routes
│   ├── middleware/
│   │   └── errorHandler.js      # Error handling middleware
│   └── app.js                   # Express app configuration
├── server.js                    # Server entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/yourusername/my-express-app.git
cd my-express-app
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong file `.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/my-express-app
JWT_SECRET=your-super-secret-key
```

### 4. Khởi động MongoDB

**MongoDB Local:**

```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community
```

**MongoDB Atlas:**

- Tạo cluster tại [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cập nhật `MONGODB_URI` trong file `.env`

### 5. Chạy ứng dụng

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Endpoints

### Home Routes

- `GET /` - Trang chủ API
- `GET /about` - Thông tin về API
- `GET /health` - Health check

### User Routes

- `GET /api/users` - Lấy danh sách users (có pagination và search)
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Query Parameters cho GET /api/users:

- `page` - Số trang (mặc định: 1)
- `limit` - Số items per page (mặc định: 10)
- `search` - Tìm kiếm theo name hoặc email
- `isActive` - Filter theo trạng thái (true/false)

## 📝 Ví dụ sử dụng API

### Tạo user mới

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "age": 25,
    "phone": "0123456789",
    "address": {
      "street": "123 Le Loi",
      "city": "Ho Chi Minh",
      "country": "Vietnam"
    }
  }'
```

### Lấy danh sách users với pagination

```bash
curl "http://localhost:3000/api/users?page=1&limit=5&search=nguyen"
```

### Cập nhật user

```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A Updated",
    "age": 26
  }'
```

## 🗄️ User Model Schema

```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  age: Number (0-120),
  phone: String (10-11 digits),
  address: {
    street: String,
    city: String,
    country: String (default: "Vietnam")
  },
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔒 Environment Variables

| Variable      | Description               | Default                                  |
| ------------- | ------------------------- | ---------------------------------------- |
| `PORT`        | Server port               | 3000                                     |
| `NODE_ENV`    | Environment mode          | development                              |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/my-express-app |
| `JWT_SECRET`  | JWT secret key            | your-super-secret-key                    |

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🧪 Testing

Bạn có thể test API bằng:

- **Postman**: Import collection từ file `postman_collection.json` (nếu có)
- **curl**: Sử dụng các ví dụ curl ở trên
- **REST Client**: Sử dụng VS Code REST Client extension

## 🚀 Deployment

### Heroku

1. Tạo Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set MONGODB_URI=your-mongodb-uri`
3. Deploy: `git push heroku main`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Railway

1. Connect GitHub repository tại [Railway](https://railway.app)
2. Set environment variables
3. Deploy tự động

## 🤝 Contributing

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- Mongoose ODM
- Node.js ecosystem

---

⭐ Nếu project này hữu ích, hãy cho một star nhé!
