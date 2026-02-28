require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WAITLIST_FILE = 'waitlist.json';

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper: Read waitlist
const getWaitlist = () => {
  if (!fs.existsSync(WAITLIST_FILE)) return [];
  try {
    const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper: Save waitlist
const saveWaitlist = (data) => {
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(data, null, 2));
};

// API: Register email
app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const waitlist = getWaitlist();
  if (waitlist.some(entry => entry.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newEntry = { email, date: new Date().toISOString() };
  waitlist.push(newEntry);
  saveWaitlist(waitlist);

  // Send Welcome Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Chào mừng bạn đến với Danh sách chờ của Hương Nhớ!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #b08d57; text-align: center;">HƯƠNG NHỚ</h2>
        <p>Chào bạn,</p>
        <p>Cảm ơn bạn đã đăng ký tham gia danh sách chờ của <strong>Hương Nhớ</strong> - Ứng dụng mua sắm giày dép cao cấp hàng đầu Việt Nam.</p>
        <p>Chúng tôi sẽ thông báo cho bạn ngay khi ứng dụng chính thức ra mắt. Là một trong những người đầu tiên tham gia, bạn sẽ nhận được ưu đãi <strong>giảm giá 20%</strong> cho đơn hàng đầu tiên!</p>
        <p>Trong lúc chờ đợi, hãy chuẩn bị sẵn sàng để trải nghiệm phong cách thời trang đẳng cấp cùng chúng tôi.</p>
        <br>
        <p>Trân trọng,</p>
        <p>Đội ngũ Hương Nhớ</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      // Still return success since they are on the waitlist
    }
  });

  res.status(200).json({ message: 'Success' });
});

// API: Admin list
app.get('/api/admin/waitlist', (req, res) => {
  const waitlist = getWaitlist();
  res.status(200).json(waitlist);
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
