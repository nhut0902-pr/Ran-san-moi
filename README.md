# Dự án Waitlist Hương Nhớ - Hướng dẫn triển khai lên Vercel

Để triển khai dự án này lên Vercel, bạn cần cấu hình các Biến Môi Trường (Environment Variables) sau đây trong phần Settings của Project trên Vercel:

### Danh sách các Biến Môi Trường (BMT):

1.  **`DATABASE_URL`**:
    - Giá trị: `postgresql://neondb_owner:npg_FC1SZONJ4XYe@ep-frosty-haze-a1eo09jq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
    - Mục đích: Kết nối tới cơ sở dữ liệu PostgreSQL trên Neon.

2.  **`GMAIL_USER`**:
    - Giá trị: `lamminhnhut09022011@gmail.com`
    - Mục đích: Email dùng để gửi thông báo xác nhận cho khách hàng.

3.  **`GMAIL_PASS`**:
    - Giá trị: `fxldyahyaostnkqk`
    - Mục đích: Mật khẩu ứng dụng (App Password) của Gmail để xác thực.

4.  **`NODE_ENV`**:
    - Giá trị: `production`
    - Mục đích: Thông báo cho mã nguồn rằng ứng dụng đang chạy trong môi trường thực tế.

### Các bước thực hiện trên Vercel:
1. Truy cập vào Dashboard của Vercel và chọn project của bạn.
2. Chọn tab **Settings** -> **Environment Variables**.
3. Thêm từng cặp Key (Tên BMT) và Value (Giá trị) ở trên vào.
4. Nhấn **Save** và thực hiện **Redeploy** lại dự án để các thay đổi có hiệu lực.

---
**Lưu ý:** Bạn không cần commit file `.env` lên GitHub vì nó chứa thông tin bảo mật. Vercel sẽ tự động lấy các giá trị từ bảng cấu hình này.

### Tại sao Vercel báo "Preview" thay vì "Production"?
Mặc định, Vercel chỉ coi các thay đổi trên nhánh chính (thường là `main` hoặc `master`) là **Production**. Các nhánh khác (như `feature/...`) sẽ được coi là bản xem trước (**Preview**).

Để chuyển bản Preview thành Production, bạn có 2 cách:
1. **Gộp (Merge) code:** Thực hiện gộp nhánh hiện tại vào nhánh `main` trên GitHub. Vercel sẽ tự động deploy lại bản chính thức.
2. **Promote to Production (Trên Vercel Dashboard):**
   - Vào tab **Deployments**.
   - Tìm bản deploy gần nhất.
   - Nhấn vào dấu 3 chấm `...` và chọn **Promote to Production**.
