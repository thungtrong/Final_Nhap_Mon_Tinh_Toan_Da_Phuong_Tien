# Final_Nhap_Mon_Tinh_Toan_Da_Phuong_Tien

## Cài đặt môi trường

1. Django
2. Tensorflow

## Chạy Project

Lệnh: python manage.py runserver
Địa chỉ url: /chatbot
Địa chỉ api: /chatbot/api

## Superuser

Admin <br />
Admin123

## Các file cần quan tâm

1. src/chatbot/view
2. src/static/js/chatbot.js

## Cách thay model vào web

1. Copy file model, tokenzizer vào thư mục src
2. Thay đổi hằng MODEL_FILE_NAME, TOKEN_FILE_NAME cho chính xác với file mới

## Testcase

Gửi tin nhắn -> nhận phản hồi

### Các Tag TO-DO trong file là những dự định tiếp theo

Bắt sự kiện phím enter x
Đưa các phần load model vào hàm bất đồng bộ x
Trước khi vào giao diện chat, người dùng phải nhập tên, lưu tên người dùng vào localStorage
Vừa vào giao diện chat có sẵn câu chào
Lưu cuộc trò chuyện vào localStorage, khi người dùng vẫn còn lưu trong localStorage thì load lại các tin nhắn trước đó
Xoá cuộc trò chuyện
