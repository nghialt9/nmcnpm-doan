# SpeakSphere - Ứng dụng luyện tiếng Anh với AI

## Thành viên nhóm
1. Lâm Trọng Nghĩa
2. Nguyễn Tuấn Anh
3. Trương Ngọc Tin
4. Trần Thanh Tùng

---

## Giới thiệu
SpeakSphere là ứng dụng web giúp người dùng luyện tập tiếng Anh thông qua hội thoại với AI. Ứng dụng sử dụng ReactJS cho frontend, NodeJS cho backend và OpenAI API để xử lý ngôn ngữ tự nhiên.

---

## Cấu trúc thư mục
- `documents/`: Tài liệu hướng dẫn, tài liệu tham khảo.
- `client/`: Mã nguồn frontend (ReactJS).
- `server/`: Mã nguồn backend (NodeJS, Express).
- `mysql/`: Cấu hình và script khởi tạo cơ sở dữ liệu MySQL.

---

## Yêu cầu hệ thống
Bạn có thể chạy ứng dụng bằng Docker hoặc cài đặt thủ công:

### Cách 1: Sử dụng Docker (Khuyến nghị)
- Cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Cách 2: Cài đặt thủ công
- NodeJS >= 18.x
- MySQL Server >= 8.x

---

## Hướng dẫn cài đặt & chạy ứng dụng

### Cách 1: Chạy bằng Docker
1. Mở PowerShell hoặc Terminal tại thư mục `source`
2. Chạy lệnh:
    ```
    docker compose up -d
    ```
3. Truy cập ứng dụng tại [http://localhost:3000](http://localhost:3000)

### Cách 2: Chạy thủ công
1. Khởi động MySQL Server và import database từ `mysql/create_db.sql`
2. Cài đặt backend:
    ```
    cd server
    npm install
    npm run start
    ```
3. Cài đặt frontend:
    ```
    cd client
    npm install
    npm run start
    ```
4. Truy cập ứng dụng tại [http://localhost:3000](http://localhost:3000)

---

## Liên hệ & đóng góp
Mọi ý kiến đóng góp hoặc báo lỗi xin gửi về nhóm
