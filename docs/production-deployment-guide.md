# Production Deployment Guide — T-Shop POD

Hướng dẫn triển khai hệ thống T-Shop Print-on-Demand lên Cloud VPS (Ubuntu 22.04 / Debian 12).

---

## 1. Yêu cầu phần cứng VPS
- **CPU**: 2 Cores tối thiểu (khuyến nghị 4 Cores nếu build Docker trực tiếp trên VPS).
- **RAM**: 4GB tối thiểu (nếu 2GB cần tạo ít nhất 4GB Swap để tránh OOM khi build Next.js).
- **Disk**: 20GB+ SSD/NVMe.
- **OS**: Ubuntu 22.04 LTS hoặc 24.04 LTS.

---

## 2. Chuẩn bị VPS (Lần đầu cài đặt)

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Tạo Swap 4GB (nếu RAM VPS <= 4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 3. Clone source code & Cấu hình môi trường

```bash
# Clone repository
git clone https://github.com/hthmkt12/t-shop.git /opt/t-shop
cd /opt/t-shop

# Tạo file cấu hình production
cp .env.example .env.production
nano .env.production
```

**Các biến quan trọng trong `.env.production`**:
```env
PORT=3000
DATABASE_URI=mongodb://mongo:27017/payload-template-ecommerce
PAYLOAD_SECRET=your-strong-random-payload-secret-here
PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
NEXT_PUBLIC_SERVER_URL=https://your-domain.com

# Stripe keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY=false
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# S3 / Cloudflare R2 (Khuyến nghị dùng R2 để lưu file in POD vĩnh viễn)
S3_BUCKET=t-shop-pod-production
S3_ACCESS_KEY_ID=your-key-id
S3_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_FORCE_PATH_STYLE=false

# SMTP gửi email xác nhận đơn hàng tự động
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-smtp-api-key
SMTP_FROM_NAME="T-Shop POD Studio"
SMTP_FROM_ADDRESS="orders@your-domain.com"
```

---

## 4. Khởi chạy hệ thống bằng Docker Compose

```bash
# Build và chạy ngầm (detached)
docker compose -f docker-compose.prod.yml up -d --build

# Kiểm tra logs khởi động
docker compose -f docker-compose.prod.yml logs -f payload
```

Khi thấy dòng `Next.js App URL: https://your-domain.com` và `Connected to MongoDB server successfully!` là hệ thống đã sẵn sàng.

---

## 5. Cấu hình Reverse Proxy & SSL (Nginx + Let's Encrypt)

Cài đặt Nginx:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Tạo cấu hình `/etc/nginx/sites-available/t-shop`:
```nginx
server {
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 50M; # Cho phép upload file in ấn kích thước lớn

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt và cấp chứng chỉ SSL miễn phí:
```bash
sudo ln -s /etc/nginx/sites-available/t-shop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 6. Lệnh bảo trì thường dùng

- **Xem logs**: `docker compose -f docker-compose.prod.yml logs --tail 100 -f payload`
- **Khởi động lại**: `docker compose -f docker-compose.prod.yml restart payload`
- **Cập nhật code mới**:
  ```bash
  git pull origin main
  docker compose -f docker-compose.prod.yml up -d --build payload
  ```
- **Backup Database**:
  ```bash
  docker compose -f docker-compose.prod.yml exec mongo mongodump --out /data/db/backup-$(date +%Y%m%d)
  ```
