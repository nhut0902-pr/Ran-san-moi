require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Tạo bảng waitlist nếu chưa có
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  }
};
initDB();

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Helper function to escape HTML
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// API Đăng ký danh sách chờ
app.post('/api/register', async (req, res) => {
  const { fullname, email } = req.body;
  const safeFullname = escapeHTML(fullname);

  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập Email.' });
  }

  try {
    // Lưu vào DB
    const result = await pool.query(
      'INSERT INTO waitlist (fullname, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING *',
      [fullname, email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Email này đã đăng ký trước đó.' });
    }

    // Gửi email xác nhận
    const mailOptions = {
      from: `"Hương Nhớ Footwear Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Chào mừng bạn đến với Danh Sách Chờ - Hương Nhớ Footwear Store',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #a67c52; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Hương Nhớ</h1>
            <p style="margin: 0; font-size: 0.9em;">FOOTWEAR STORE</p>
          </div>
          <div style="padding: 20px;">
            <h2>Chào ${safeFullname || 'bạn'},</h2>
            <p>Cảm ơn bạn đã đăng ký tham gia danh sách chờ trải nghiệm ứng dụng của chúng tôi!</p>
            <p>Chúng tôi đang nỗ lực chuẩn bị những nội dung và sản phẩm tốt nhất dành riêng cho bạn. Bạn sẽ là những người đầu tiên nhận được thông báo khi ứng dụng chính thức ra mắt.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #f8f9fa; border: 1px dashed #a67c52; padding: 15px 30px; font-weight: bold; color: #a67c52; border-radius: 5px;">
                Đã thêm vào Danh Sách Chờ Thành Công
              </span>
            </div>
            <p>Trong thời gian chờ đợi, hãy theo dõi chúng tôi để cập nhật những bộ sưu tập mới nhất nhé!</p>
            <p>Trân trọng,<br>Đội ngũ Hương Nhớ</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 0.8em; color: #777;">
            &copy; 2024 Hương Nhớ Footwear Store. All rights reserved.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email của bạn.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
