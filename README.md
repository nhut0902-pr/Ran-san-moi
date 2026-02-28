# Dự án Waitlist Hương Nhớ - Hướng dẫn triển khai lên Vercel

Để triển khai dự án này lên Vercel, bạn cần cấu hình các Biến Môi Trường (Environment Variables) sau đây trong phần Settings của Project trên Vercel:

### Danh sách các Biến Môi Trường (BMT) cần thiết:

1.  **`DATABASE_URL`**:
    - Giá trị: (Lấy chuỗi kết nối từ bảng điều khiển Neon của bạn)
    - Định dạng ví dụ: `postgresql://user:password@hostname/dbname?sslmode=require`
    - Mục đích: Kết nối tới cơ sở dữ liệu PostgreSQL.

2.  **`GMAIL_USER`**:
    - Giá trị: (Địa chỉ email Gmail của bạn)
    - Mục đích: Email dùng để gửi thông báo xác nhận cho khách hàng.

3.  **`GMAIL_PASS`**:
    - Giá trị: (Mật khẩu ứng dụng - App Password của Gmail)
    - Mục đích: Xác thực gửi email qua SMTP.

4.  **`NODE_ENV`**:
    - Giá trị: `production`
    - Mục đích: Thông báo môi trường chạy thực tế.

### Các bước thực hiện trên Vercel:
1. Truy cập vào Dashboard của Vercel và chọn project của bạn.
2. Chọn tab **Settings** -> **Environment Variables**.
3. Thêm từng cặp Key (Tên BMT) và Value (Giá trị thật) vào bảng cấu hình.
4. Nhấn **Save** và thực hiện **Redeploy** lại dự án.

---
**CẢNH BÁO BẢO MẬT:**
- Tuyệt đối không bao giờ đưa mật khẩu, khóa cơ sở dữ liệu trực tiếp vào mã nguồn hoặc file README này.
- Luôn sử dụng Biến Môi Trường (Environment Variables) để bảo vệ thông tin nhạy cảm khỏi việc bị lộ công khai trên GitHub.
