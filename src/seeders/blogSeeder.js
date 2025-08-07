const mongoose = require('mongoose');
const Blog = require('../models/Blog');
require('dotenv').config();

const sampleBlogs = [
  {
    title: 'Lịch sử hình thành và phát triển của Hà Nội - Thủ đô ngàn năm văn hiến',
    slug: 'lich-su-hinh-thanh-phat-trien-ha-noi',
    excerpt:
      'Khám phá hành trình lịch sử hơn 1000 năm của Hà Nội, từ thành Thăng Long cổ kính đến thủ đô hiện đại của Việt Nam ngày nay.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Hà Nội, thủ đô của nước Cộng hòa xã hội chủ nghĩa Việt Nam, là một trong những thành phố có lịch sử lâu đời nhất Đông Nam Á...</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop',
    category: 'Lịch sử',
    tags: ['Lịch sử Việt Nam', 'Hà Nội', 'Thăng Long', 'Văn hóa', 'Di sản'],
    author: {
      name: 'Tiến sĩ Nguyễn Văn Sử',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Lịch sử, chuyên gia nghiên cứu lịch sử Việt Nam, tác giả của nhiều công trình nghiên cứu về lịch sử Thăng Long - Hà Nội',
    },
    publishedAt: new Date('2024-01-15'),
    readTime: '15 phút đọc',
    isPublished: true,
    views: 1250,
    likes: 89,
  },
  {
    title: 'Hướng dẫn xây dựng RESTful API với Node.js và Express',
    slug: 'huong-dan-xay-dung-restful-api-nodejs-express',
    excerpt:
      'Tìm hiểu cách xây dựng một RESTful API hoàn chỉnh với Node.js, Express.js và MongoDB từ cơ bản đến nâng cao.',
    content: `<div>
            <h2>Giới thiệu về RESTful API</h2>
            <p>REST (Representational State Transfer) là một kiến trúc phần mềm để thiết kế web service...</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
    category: 'Lập trình',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'API', 'JavaScript'],
    author: {
      name: 'Nguyễn Văn Dev',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Full-stack Developer với 5 năm kinh nghiệm, chuyên về Node.js và React',
    },
    publishedAt: new Date('2024-01-10'),
    readTime: '12 phút đọc',
    isPublished: true,
    views: 892,
    likes: 67,
  },
  {
    title: 'Deployment Next.js lên Vercel trong 5 phút',
    slug: 'deployment-nextjs-vercel-5-phut',
    excerpt:
      'Hướng dẫn chi tiết cách deploy ứng dụng Next.js lên Vercel một cách nhanh chóng và hiệu quả.',
    content: `<div>
            <h2>Tại sao chọn Vercel?</h2>
            <p>Vercel là platform được tạo ra bởi team phát triển Next.js, do đó có sự tối ưu hoá tuyệt vời...</p>
        </div>`,
    featuredImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop',
    category: 'DevOps',
    tags: ['Next.js', 'Vercel', 'Deployment', 'React'],
    author: {
      name: 'Hoàng Văn DevOps',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      bio: 'DevOps Engineer chuyên về cloud computing và CI/CD',
    },
    publishedAt: new Date('2023-12-28'),
    readTime: '4 phút đọc',
    isPublished: true,
    views: 654,
    likes: 45,
  },
  {
    title: 'Machine Learning cơ bản với Python',
    slug: 'machine-learning-co-ban-python',
    excerpt:
      'Khám phá thế giới Machine Learning thông qua Python với các thư viện phổ biến như scikit-learn, pandas và numpy.',
    content: `<div>
            <h2>Machine Learning là gì?</h2>
            <p>Machine Learning là một nhánh của Trí tuệ nhân tạo (AI) cho phép máy tính học hỏi và cải thiện...</p>
        </div>`,
    featuredImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    category: 'AI/ML',
    tags: ['Machine Learning', 'Python', 'AI', 'Data Science', 'scikit-learn'],
    author: {
      name: 'Dr. Trần Thị AI',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Khoa học máy tính, chuyên gia về AI và Machine Learning',
    },
    publishedAt: new Date('2024-01-05'),
    readTime: '18 phút đọc',
    isPublished: true,
    views: 1100,
    likes: 78,
  },
  {
    title: 'Docker và containerization trong development',
    slug: 'docker-containerization-development',
    excerpt:
      'Tìm hiểu cách sử dụng Docker để containerize ứng dụng, từ cơ bản đến các best practices trong môi trường production.',
    content: `<div>
            <h2>Docker là gì?</h2>
            <p>Docker là một platform cho phép developers package ứng dụng và dependencies vào một container...</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1605745341112-85968b19335a?w=800&h=400&fit=crop',
    category: 'DevOps',
    tags: ['Docker', 'Container', 'DevOps', 'Deployment'],
    author: {
      name: 'Lê Văn Container',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      bio: 'Senior DevOps Engineer với kinh nghiệm về Docker, Kubernetes và cloud infrastructure',
    },
    publishedAt: new Date('2024-01-20'),
    readTime: '10 phút đọc',
    isPublished: false, // Draft
    views: 0,
    likes: 0,
  },
];

const seedBlogs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Insert sample blogs
    const createdBlogs = await Blog.insertMany(sampleBlogs);
    console.log(`Created ${createdBlogs.length} sample blogs`);

    console.log('Blog seeding completed successfully!');

    // Log created blogs for reference
    createdBlogs.forEach((blog) => {
      console.log(`- ${blog.title} (ID: ${blog._id}, Slug: ${blog.slug})`);
    });
  } catch (error) {
    console.error('Error seeding blogs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedBlogs();
}

module.exports = { seedBlogs, sampleBlogs };
