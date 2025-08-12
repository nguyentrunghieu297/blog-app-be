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
            <p>Hà Nội, thủ đô của nước Cộng hòa xã hội chủ nghĩa Việt Nam, là một trong những thành phố có lịch sử lâu đời nhất Đông Nam Á. Với hơn 1000 năm lịch sử, Hà Nội đã chứng kiến sự thăng trầm của nhiều triều đại và là trung tâm chính trị, kinh tế, văn hóa quan trọng của đất nước.</p>
            <h2>Thời kỳ Thăng Long cổ kính</h2>
            <p>Năm 1010, vua Lý Thái Tổ quyết định dời đô từ Hoa Lư về Đại La và đặt tên là Thăng Long, mở đầu cho một thời kỳ huy hoàng trong lịch sử Việt Nam. Thành Thăng Long trở thành trung tâm quyền lực của các triều đại phfeudal Việt Nam.</p>
            <p>Qua nhiều thế kỷ, Hà Nội không chỉ là nơi cư trú của các vua chúa mà còn là trung tâm văn hóa, giáo dục với nhiều ngôi chùa, đền và trường học được xây dựng.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
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
    title: 'Cuộc kháng chiến chống Pháp 1946-1954: Dấu mốc lịch sử huy hoàng',
    slug: 'cuoc-khang-chien-chong-phap-1946-1954',
    excerpt:
      'Tìm hiểu về cuộc kháng chiến toàn quốc chống Pháp, từ những ngày đầu khó khăn đến chiến thắng lịch sử tại Điện Biên Phủ.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Cuộc kháng chiến chống Pháp (1946-1954) là một trong những trang sử huy hoàng nhất của dân tộc Việt Nam. Đây là cuộc đấu tranh giành độc lập hoàn toàn, thống nhất đất nước sau hàng thế kỷ bị thống trị bởi thực dân Pháp.</p>
            <h2>Bối cảnh lịch sử</h2>
            <p>Sau Cách mạng Tháng Tám 1945, nước Việt Nam Dân chủ Cộng hòa ra đời. Tuy nhiên, thực dân Pháp vẫn có tham vọng tái chiếm Đông Dương, dẫn đến xung đột không thể tránh khỏi.</p>
            <p>Chiến thắng Điện Biên Phủ ngày 7/5/1954 đã đánh dấu sự kết thúc của cuộc kháng chiến và mở ra giai đoạn mới trong lịch sử Việt Nam.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
    tags: ['Kháng chiến', 'Điện Biên Phủ', 'Lịch sử Việt Nam', 'Độc lập'],
    author: {
      name: 'GS. Trần Văn Chiến',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Giáo sư Lịch sử, chuyên gia về lịch sử kháng chiến Việt Nam',
    },
    publishedAt: new Date('2024-01-12'),
    readTime: '18 phút đọc',
    isPublished: true,
    views: 980,
    likes: 76,
  },
  {
    title: 'Văn hóa ăn uống Việt Nam: Từ phở đến bánh mì',
    slug: 'van-hoa-an-uong-viet-nam-pho-banh-mi',
    excerpt:
      'Khám phá sự đa dạng và phong phú của ẩm thực Việt Nam, từ những món ăn truyền thống đến sự ảnh hưởng của văn hóa quốc tế.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Ẩm thực Việt Nam là một trong những nét văn hóa đặc sắc nhất của dân tộc, thể hiện sự sáng tạo và tinh tế trong từng món ăn. Từ bát phở nóng hổi buổi sáng đến ổ bánh mì thơm lừng, ẩm thực Việt đã chinh phục biết bao tâm hồn.</p>
            <h2>Phở - Linh hồn ẩm thực Việt</h2>
            <p>Phở không chỉ là một món ăn mà còn là biểu tượng văn hóa của người Việt. Với nước dùng trong veo được niêu nấu từ xương bò hàng giờ đồng hồ, bánh phở mềm mại và thịt bò tươi ngon, phở đã trở thành món ăn được yêu thích trên toàn thế giới.</p>
            <h2>Bánh mì - Sự hòa quyện Đông Tây</h2>
            <p>Bánh mì Việt Nam là một minh chứng tuyệt vời cho sự giao thoa văn hóa. Kết hợp giữa bánh baguette của Pháp với nhân bánh đặc trưng Việt Nam, tạo nên một món ăn độc đáo chỉ có ở Việt Nam.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=400&fit=crop',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Ẩm thực', 'Văn hóa Việt Nam', 'Phở', 'Bánh mì', 'Truyền thống'],
    author: {
      name: 'Nguyễn Thị Hương',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      bio: 'Chuyên gia ẩm thực, tác giả sách "Hương vị Việt Nam"',
    },
    publishedAt: new Date('2024-01-10'),
    readTime: '12 phút đọc',
    isPublished: true,
    views: 1450,
    likes: 112,
  },
  {
    title: 'Lễ hội truyền thống Việt Nam: Tết Nguyên Đán và ý nghĩa văn hóa',
    slug: 'le-hoi-truyen-thong-tet-nguyen-dan',
    excerpt:
      'Tìm hiểu về lễ hội lớn nhất trong năm của người Việt Nam, từ nguồn gốc lịch sử đến các phong tục tập quán độc đáo.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Tết Nguyên Đán, hay còn gọi đơn giản là Tết, là lễ hội truyền thống quan trọng nhất của người Việt Nam. Đây không chỉ là dịp đón năm mới theo âm lịch mà còn là thời gian để gia đình đoàn tụ, tôn vinh tổ tiên và cầu mong một năm mới tốt lành.</p>
            <h2>Nguồn gốc và ý nghĩa</h2>
            <p>Tết Nguyên Đán có nguồn gốc từ hàng ngàn năm trước, gắn liền với nền nông nghiệp lúa nước của người Việt. Đây là thời điểm đánh dấu sự kết thúc của một vụ mùa và bắt đầu chu kỳ canh tác mới.</p>
            <h2>Những phong tục đặc sắc</h2>
            <p>Từ việc trang trí nhà cửa bằng hoa đào, hoa mai, gói bánh chưng, bánh tét cho đến việc lì xì, chúc tết, mỗi phong tục đều mang trong mình những ý nghĩa sâu sắc về tình yêu thương và sự đoàn kết.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Tết Nguyên Đán', 'Lễ hội', 'Truyền thống', 'Văn hóa Việt Nam', 'Phong tục'],
    author: {
      name: 'TS. Lê Văn Truyền',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Văn hóa học, nghiên cứu về văn hóa truyền thống Việt Nam',
    },
    publishedAt: new Date('2024-01-20'),
    readTime: '14 phút đọc',
    isPublished: true,
    views: 1680,
    likes: 145,
  },
  {
    title: 'Kinh tế Việt Nam thời kỳ Đổi Mới: Hành trình từ 1986 đến nay',
    slug: 'kinh-te-viet-nam-thoi-ky-doi-moi',
    excerpt:
      'Phân tích sự phát triển kinh tế Việt Nam trong gần 40 năm Đổi Mới, từ nước nông nghiệp nghèo đến quốc gia thu nhập trung bình.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Chính sách Đổi Mới được khởi xướng từ Đại hội VI của Đảng Cộng sản Việt Nam năm 1986 đã mở ra một chương mới trong lịch sử phát triển kinh tế của đất nước. Từ một nền kinh tế kế hoạch hóa tập trung, Việt Nam đã chuyển đổi thành nền kinh tế thị trường định hướng xã hội chủ nghĩa.</p>
            <h2>Những thành tựu nổi bật</h2>
            <p>Sau gần 40 năm Đổi Mới, Việt Nam đã đạt được nhiều thành tựu quan trọng: từ việc giải quyết nạn đói nghèo, trở thành nước xuất khẩu gạo lớn thứ ba thế giới, đến việc thu hút hàng tỷ USD vốn đầu tư nước ngoài.</p>
            <p>GDP bình quân đầu người đã tăng từ khoảng 100 USD năm 1986 lên trên 3.000 USD năm 2020, đưa Việt Nam vào nhóm các nước có thu nhập trung bình.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
    tags: ['Đổi Mới', 'Kinh tế Việt Nam', 'Phát triển', 'Lịch sử hiện đại'],
    author: {
      name: 'GS. Phạm Văn Kinh',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      bio: 'Giáo sư Kinh tế, chuyên gia về kinh tế phát triển Việt Nam',
    },
    publishedAt: new Date('2024-01-08'),
    readTime: '20 phút đọc',
    isPublished: true,
    views: 875,
    likes: 63,
  },
  {
    title: 'Làng nghề truyền thống Việt Nam: Bát Tràng và nghệ thuật gốm sứ',
    slug: 'lang-nghe-truyen-thong-bat-trang-gom-su',
    excerpt:
      'Khám phá lịch sử và nghệ thuật làm gốm sứ của làng Bát Tràng, một trong những làng nghề lâu đời nhất của Việt Nam.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Bát Tràng, một làng nhỏ bên dòng sông Hồng, đã trở thành biểu tượng của nghệ thuật gốm sứ Việt Nam với lịch sử hơn 700 năm. Không chỉ là nơi sản xuất đồ gốm phục vụ đời sống hàng ngày, Bát Tràng còn là trung tâm của nghệ thuật sáng tạo và văn hóa truyền thống.</p>
            <h2>Lịch sử hình thành</h2>
            <p>Làng gốm Bát Tràng được hình thành từ thế kỷ XIV, khi những nghệ nhân đầu tiên tận dụng nguồn đất sét chất lượng cao từ sông Hồng để tạo ra những sản phẩm gốm đầu tiên. Qua nhiều thế kỷ, nghề làm gốm đã trở thành linh hồn của cả cộng đồng.</p>
            <h2>Nghệ thuật và kỹ thuật</h2>
            <p>Từ việc nhào nặn đất sét, tạo hình, trang trí cho đến nung đồ, mỗi công đoạn đều đòi hỏi sự khéo léo và kinh nghiệm của nghệ nhân. Những họa tiết truyền thống như rồng, phượng, hoa cúc được vẽ tay tinh xảo trên từng sản phẩm.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=400&fit=crop',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Làng nghề', 'Bát Tràng', 'Gốm sứ', 'Nghệ thuật', 'Truyền thống'],
    author: {
      name: 'Nghệ nhân Nguyễn Văn Đức',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Nghệ nhân gốm sứ Bát Tràng, thế hệ thứ 5 trong gia đình làm nghề',
    },
    publishedAt: new Date('2024-01-05'),
    readTime: '16 phút đọc',
    isPublished: true,
    views: 720,
    likes: 54,
  },
  {
    title: 'Cách mạng Tháng Tám 1945: Bước ngoặt lịch sử của dân tộc',
    slug: 'cach-mang-thang-tam-1945-buoc-ngoat-lich-su',
    excerpt:
      'Tìm hiểu về Cách mạng Tháng Tám 1945, sự kiện lịch sử quan trọng đánh dấu sự ra đời của nước Việt Nam Dân chủ Cộng hòa.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Cách mạng Tháng Tám 1945 là một trong những sự kiện quan trọng nhất trong lịch sử dân tộc Việt Nam. Đây là cuộc cách mạng dân tộc dân chủ nhân dân, đánh dấu sự kết thúc của chế độ thực dân - phong kiến và sự ra đời của nhà nước Việt Nam Dân chủ Cộng hòa.</p>
            <h2>Bối cảnh lịch sử</h2>
            <p>Sau Thế chiến II, Nhật Bản đầu hàng đồng minh, tạo ra một khoảng trống quyền lực tại Việt Nam. Đảng Cộng sản Đông Dương đã nắm bắt thời cơ này để lãnh đạo nhân dân tiến hành cách mạng giành chính quyền.</p>
            <h2>Ý nghĩa lịch sử</h2>
            <p>Thành công của Cách mạng Tháng Tám đã mở ra một kỷ nguyên mới trong lịch sử Việt Nam. Lần đầu tiên trong lịch sử, nhân dân Việt Nam thực sự làm chủ vận mệnh của mình.</p>
        </div>`,
    featuredImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
    tags: ['Cách mạng Tháng Tám', 'Lịch sử Việt Nam', 'Độc lập', '1945'],
    author: {
      name: 'PGS. TS. Hoàng Văn Sử',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Phó Giáo sư Tiến sĩ Lịch sử, chuyên gia về lịch sử cách mạng Việt Nam',
    },
    publishedAt: new Date('2024-01-18'),
    readTime: '22 phút đọc',
    isPublished: true,
    views: 1120,
    likes: 88,
  },
  {
    title: 'Đời sống nông thôn Việt Nam: Từ làng xã truyền thống đến nông thôn mới',
    slug: 'doi-song-nong-thon-viet-nam-lang-xa-nong-thon-moi',
    excerpt:
      'Khám phá sự thay đổi của đời sống nông thôn Việt Nam, từ những làng xã truyền thống đến chương trình xây dựng nông thôn mới.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Nông thôn Việt Nam đã trải qua nhiều thay đổi sâu sắc trong những thập kỷ qua. Từ những làng xã truyền thống với lối sống gắn bó với thiên nhiên, nông thôn Việt Nam ngày nay đã có những bước chuyển mình mạnh mẽ nhờ chương trình xây dựng nông thôn mới.</p>
            <h2>Làng xã truyền thống</h2>
            <p>Trong quá khứ, làng xã Việt Nam được tổ chức theo mô hình cộng đồng khép kín với hương ước, làng xã, đình chùa là những trung tâm sinh hoạt cộng đồng. Người dân sống chủ yếu bằng nghề nông và các nghề thủ công truyền thống.</p>
            <h2>Chương trình nông thôn mới</h2>
            <p>Từ năm 2010, chương trình xây dựng nông thôn mới đã thay đổi diện mạo nông thôn với 19 tiêu chí về kinh tế, xã hội, môi trường. Kết quả là hàng ngàn xã đã đạt chuẩn nông thôn mới với đường làng ngõ xóm khang trang, điện nước đầy đủ.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1420661696819-48ba5f66093b?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Nông thôn', 'Nông thôn mới', 'Làng xã', 'Phát triển nông nghiệp'],
    author: {
      name: 'TS. Nguyễn Thị Làng',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Xã hội học nông thôn, nghiên cứu viên về phát triển nông nghiệp',
    },
    publishedAt: new Date('2024-01-14'),
    readTime: '17 phút đọc',
    isPublished: true,
    views: 892,
    likes: 71,
  },
  {
    title: 'Giáo dục Việt Nam xưa và nay: Từ khoa cử đến giáo dục hiện đại',
    slug: 'giao-duc-viet-nam-xua-nay-khoa-cu-hien-dai',
    excerpt:
      'Tìm hiểu sự phát triển của hệ thống giáo dục Việt Nam từ chế độ khoa cử phong kiến đến hệ thống giáo dục hiện đại ngày nay.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Giáo dục Việt Nam có một lịch sử phát triển lâu dài và phong phú. Từ chế độ khoa cử truyền thống với những bài thi Tam trường đến hệ thống giáo dục phổ thông và đại học hiện đại, giáo dục luôn được coi là nền tảng của sự phát triển quốc gia.</p>
            <h2>Chế độ khoa cử thời phong kiến</h2>
            <p>Trong thời phong kiến, chế độ khoa cử là con đường chính để chọn lọc nhân tài phục vụ triều đình. Các kỳ thi Hương, Hội, Đình được tổ chức nghiêm túc với nội dung chủ yếu là kinh sử tử tập và thơ phú.</p>
            <h2>Giáo dục hiện đại</h2>
            <p>Sau Cách mạng Tháng Tám, Việt Nam đã xây dựng hệ thống giáo dục quốc dân từ mầm non đến đại học. Chính sách "dạy chữ cho tất cả mọi người" đã xóa mù chữ cho hàng triệu người dân.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
    tags: ['Giáo dục', 'Khoa cử', 'Lịch sử giáo dục', 'Văn hóa Việt Nam'],
    author: {
      name: 'GS. Trần Văn Giáo',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      bio: 'Giáo sư Sư phạm, chuyên gia về lịch sử giáo dục Việt Nam',
    },
    publishedAt: new Date('2024-01-22'),
    readTime: '19 phút đọc',
    isPublished: true,
    views: 654,
    likes: 48,
  },
  {
    title: 'Trang phục truyền thống Việt Nam: Áo dài và vẻ đẹp dân tộc',
    slug: 'trang-phuc-truyen-thong-ao-dai-ve-dep-dan-toc',
    excerpt:
      'Khám phá vẻ đẹp và ý nghĩa văn hóa của áo dài Việt Nam, từ lịch sử hình thành đến vai trò trong đời sống hiện đại.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Áo dài được xem là quốc phục của phụ nữ Việt Nam, thể hiện vẻ đẹp duyên dáng, thanh lịch của người con gái Việt. Không chỉ là trang phục, áo dài còn là biểu tượng văn hóa mang đậm bản sắc dân tộc.</p>
            <h2>Lịch sử phát triển</h2>
            <p>Áo dài có nguồn gốc từ áo ngũ thân thời Lê - Nguyễn, sau đó được cách tân bởi họa sĩ Cát Tường vào đầu thế kỷ XX. Qua các thời kỳ, áo dài liên tục được cải tiến để phù hợp với từng giai đoạn lịch sử.</p>
            <h2>Ý nghĩa văn hóa</h2>
            <p>Áo dài không chỉ tôn lên vẻ đẹp hình thể mà còn thể hiện tâm hồn, phẩm chất của người phụ nữ Việt Nam. Từ những buổi lễ quan trọng đến đời sống hàng ngày, áo dài luôn hiện diện như một phần không thể thiếu.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1617880829610-1c0605c2e44c?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Áo dài', 'Trang phục truyền thống', 'Văn hóa Việt Nam', 'Thời trang'],
    author: {
      name: 'NTK Lê Thị Thời',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      bio: 'Nhà thiết kế thời trang, chuyên gia về áo dài truyền thống',
    },
    publishedAt: new Date('2024-01-16'),
    readTime: '13 phút đọc',
    isPublished: true,
    views: 1350,
    likes: 98,
  },
  {
    title: 'Cuộc chiến tranh Việt Nam (1955-1975): Những bài học lịch sử',
    slug: 'cuoc-chien-tranh-viet-nam-1955-1975-bai-hoc-lich-su',
    excerpt:
      'Phân tích cuộc chiến tranh Việt Nam từ năm 1955-1975, nguyên nhân, diễn biến và những bài học quý báu cho thế hệ hôm nay.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Cuộc chiến tranh Việt Nam (1955-1975) là một trong những cuộc xung đột lớn nhất thế kỷ XX, để lại những ảnh hưởng sâu sắc không chỉ đối với Việt Nam mà còn đối với cả khu vực và thế giới. Đây là cuộc đấu tranh giành thống nhất đất nước và bảo vệ độc lập dân tộc.</p>
            <h2>Bối cảnh và nguyên nhân</h2>
            <p>Sau Hiệp định Geneva 1954, Việt Nam bị chia cắt thành hai miền theo vĩ tuyến 17. Sự can thiệp của các nước lớn đã làm phức tạp hóa tình hình và dẫn đến cuộc xung đột kéo dài.</p>
            <h2>Ý nghĩa và bài học</h2>
            <p>Chiến thắng 30/4/1975 đã thống nhất đất nước, chấm dứt chiến tranh và mở ra kỷ nguyên hòa bình, xây dựng đất nước. Cuộc chiến tranh để lại nhiều bài học quý báu về ý chí độc lập tự do của dân tộc.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=400&fit=crop',
    category: {
      name: 'Lịch sử',
      slug: 'lich-su',
    },
    tags: ['Chiến tranh Việt Nam', 'Thống nhất', 'Lịch sử', '30/4/1975'],
    author: {
      name: 'GS. Nguyễn Văn Chiến',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Giáo sư Lịch sử, chuyên gia về lịch sử chiến tranh Việt Nam',
    },
    publishedAt: new Date('2024-01-25'),
    readTime: '25 phút đọc',
    isPublished: true,
    views: 1890,
    likes: 156,
  },
  {
    title: 'Y học cổ truyền Việt Nam: Thuốc nam và phương pháp chữa bệnh truyền thống',
    slug: 'y-hoc-co-truyen-viet-nam-thuoc-nam',
    excerpt:
      'Tìm hiểu về kho tàng y học cổ truyền Việt Nam với các bài thuốc nam, phương pháp châm cứu và triết lý chữa bệnh độc đáo.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Y học cổ truyền Việt Nam là một kho tàng tri thức quý báu được tích lũy qua hàng ngàn năm lịch sử. Kết hợp giữa tinh hoa y học phương Đông và kinh nghiệm thực tiễn của dân tộc, y học cổ truyền Việt Nam có những đóng góp to lớn trong việc chăm sóc sức khỏe nhân dân.</p>
            <h2>Thuốc nam và dược liệu</h2>
            <p>Với hệ thống dược liệu phong phú từ thiên nhiên nhiệt đới, thuốc nam Việt Nam có hàng ngàn vị thuốc quý từ rừng rậm, đồng ruộng. Các bài thuốc được bào chế theo nguyên tắc "quân thần tá sứ", tạo nên những công thức chữa bệnh hiệu quả.</p>
            <h2>Triết lý chữa bệnh</h2>
            <p>Y học cổ truyền Việt Nam chú trọng đến việc "trị gốc", tìm hiểu nguyên nhân sâu xa của bệnh tật và điều trị toàn diện. Nguyên tắc "phòng bệnh hơn chữa bệnh" được đề cao và áp dụng rộng rãi.</p>
        </div>`,
    featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Y học cổ truyền', 'Thuốc nam', 'Dược liệu', 'Sức khỏe'],
    author: {
      name: 'Thầy thuốc Nguyễn Văn Nam',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      bio: 'Thầy thuốc y học cổ truyền, nghiên cứu về thuốc nam Việt Nam',
    },
    publishedAt: new Date('2024-01-11'),
    readTime: '16 phút đọc',
    isPublished: true,
    views: 743,
    likes: 61,
  },
  {
    title: 'Phố cổ Hội An: Di sản văn hóa thế giới và du lịch bền vững',
    slug: 'pho-co-hoi-an-di-san-van-hoa-du-lich-ben-vung',
    excerpt:
      'Khám phá vẻ đẹp cổ kính của phố cổ Hội An, một di sản văn hóa thế giới và mô hình phát triển du lịch bền vững tại Việt Nam.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Phố cổ Hội An, được UNESCO công nhận là di sản văn hóa thế giới năm 1999, là một trong những điểm đến hấp dẫn nhất Việt Nam. Với kiến trúc cổ kính được bảo tồn nguyên vẹn và văn hóa đa dạng, Hội An đã trở thành biểu tượng của du lịch văn hóa Việt Nam.</p>
            <h2>Giá trị lịch sử văn hóa</h2>
            <p>Từ thế kỷ XV đến XIX, Hội An là một trong những cảng thương mại quốc tế sầm uất nhất Đông Nam Á. Sự giao thoa văn hóa giữa Việt Nam, Trung Quốc, Nhật Bản và các nước châu Âu đã tạo nên bản sắc kiến trúc độc đáo của phố cổ.</p>
            <h2>Du lịch bền vững</h2>
            <p>Hội An đã thực hiện nhiều chính sách bảo tồn di sản kết hợp với phát triển du lịch bền vững. Từ việc hạn chế phương tiện giao thông trong khu phố cổ đến việc khuyến khích sử dụng đèn lồng thay cho đèn điện, tạo nên không gian thơ mộng độc đáo.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1706433164183-f88522c49600?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Hội An', 'Di sản văn hóa', 'Du lịch', 'UNESCO', 'Phố cổ'],
    author: {
      name: 'TS. Lê Văn Di',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Du lịch học, chuyên gia về du lịch văn hóa và bền vững',
    },
    publishedAt: new Date('2024-01-19'),
    readTime: '14 phút đọc',
    isPublished: true,
    views: 1567,
    likes: 124,
  },
  {
    title: 'Thể thao truyền thống Việt Nam: Từ đá cầu đến vovinam',
    slug: 'the-thao-truyen-thong-viet-nam-da-cau-vovinam',
    excerpt:
      'Tìm hiểu về các môn thể thao truyền thống Việt Nam như đá cầu, đẩy gậy, vovinam và vai trò trong việc rèn luyện sức khỏe.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Thể thao truyền thống Việt Nam mang đậm bản sắc văn hóa dân tộc, thể hiện sự sáng tạo và khéo léo của con người Việt Nam. Các môn thể thao này không chỉ rèn luyện sức khỏe mà còn giáo dục nhân cách, tinh thần đoàn kết cộng đồng.</p>
            <h2>Đá cầu - môn thể thao dân gian</h2>
            <p>Đá cầu là một trong những trò chơi dân gian phổ biến nhất Việt Nam. Với quả cầu được làm từ lông chim và đế cao su, người chơi sử dụng chân để giữ cầu trên không, thể hiện sự khéo léo và phối hợp nhịp nhàng.</p>
            <h2>Vovinam - võ thuật Việt Nam</h2>
            <p>Vovinam được sáng lập bởi Nguyễn Lộc vào năm 1938, kết hợp tinh hoa võ thuật phương Đông với đặc điểm riêng của người Việt. Môn võ này không chỉ rèn luyện thể lực mà còn tu d양ỗng tinh thần, phẩm chất đạo đức.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1580560230671-61e01dfdb285?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Thể thao truyền thống', 'Đá cầu', 'Vovinam', 'Võ thuật', 'Văn hóa'],
    author: {
      name: 'HLV Trần Văn Thể',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
      bio: 'Huấn luyện viên vovinam, nghiên cứu viên về thể thao truyền thống',
    },
    publishedAt: new Date('2024-01-13'),
    readTime: '11 phút đọc',
    isPublished: true,
    views: 568,
    likes: 42,
  },
  {
    title: 'Đồng bằng sông Cửu Long: Vùng đất phù sa và nền văn minh sông nước',
    slug: 'dong-bang-song-cuu-long-vung-dat-phu-sa',
    excerpt:
      'Khám phá đồng bằng sông Cửu Long - vựa lúa của cả nước, với nền văn minh sông nước độc đáo và đời sống người miền Tây Nam Bộ.',
    content: `<div style="text-align: justify; line-height: 1.8;">
            <p>Đồng bằng sông Cửu Long, hay còn gọi là miền Tây Nam Bộ, là vùng đất phù sa màu mỡ được hình thành từ phù sa của sông Mê Kông qua hàng triệu năm. Đây là vựa lúa lớn nhất Việt Nam, cung cấp hơn 50% lượng gạo của cả nước.</p>
            <h2>Đặc điểm địa lý và khí hậu</h2>
            <p>Với địa hình bằng phẳng, mạng lưới sông ngòi dày đặc và khí hậu nhiệt đới gió mùa, đồng bằng sông Cửu Long có điều kiện thuận lợi cho việc phát triển nông nghiệp, đặc biệt là trồng lúa và nuôi trồng thủy sản.</p>
            <h2>Văn hóa sông nước</h2>
            <p>Đời sống của người dân miền Tây gắn liền với sông nước. Từ chợ nổi Cái Răng, Cần Thơ đến những khu rừng U Minh, vùng đất này mang đậm bản sắc văn hóa sông nước với tính cách cởi mở, hào sảng của người Nam Bộ.</p>
        </div>`,
    featuredImage:
      'https://images.unsplash.com/photo-1679292165122-937fde72524e?q=80&w=1101&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: {
      name: 'Cuộc sống',
      slug: 'cuoc-song',
    },
    tags: ['Đồng bằng sông Cửu Long', 'Miền Tây', 'Nông nghiệp', 'Văn hóa sông nước'],
    author: {
      name: 'TS. Nguyễn Văn Sông',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
      bio: 'Tiến sĩ Địa lý, chuyên gia về địa lý kinh tế vùng đồng bằng sông Cửu Long',
    },
    publishedAt: new Date('2024-01-07'),
    readTime: '15 phút đọc',
    isPublished: true,
    views: 967,
    likes: 73,
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
