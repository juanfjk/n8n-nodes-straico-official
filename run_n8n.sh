#!/bin/bash

# Chuyển đến thư mục custom của n8n
cd ~/.n8n/custom || { echo "Không thể vào thư mục ~/.n8n/custom"; exit 1; }

# Ngắt liên kết gói n8n-nodes-straico
npm unlink n8n-nodes-straico

# Chuyển đến thư mục n8n-nodes-straico
cd ~/n8n-nodes-straico || { echo "Không thể vào thư mục ~/n8n-nodes-straico"; exit 1; }

# Xóa các thư mục và file không cần thiết
rm -rf dist node_modules package-lock.json

# Cài đặt lại các gói
npm install

# Biên dịch lại gói
npm run build

# Liên kết gói
npm link

# Quay lại thư mục custom của n8n
cd ~/.n8n/custom || { echo "Không thể vào thư mục ~/.n8n/custom"; exit 1; }

# Liên kết gói n8n-nodes-straico
npm link n8n-nodes-straico

# Khởi động n8n
n8n start
