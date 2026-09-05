#!/usr/bin/env bash
# ==============================================================================
# T-Shop Print-on-Demand (POD) - Automated VPS Deployment & Setup Script
# Supported OS: Ubuntu 22.04 / 24.04 LTS, Debian 12
# Usage:
#   chmod +x scripts/deploy-vps.sh
#   sudo ./scripts/deploy-vps.sh [DOMAIN] [SSL_EMAIL]
# Example:
#   sudo ./scripts/deploy-vps.sh t-shop.vn admin@t-shop.vn
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"
SSL_EMAIL="${2:-}"
APP_DIR="/opt/t-shop"
REPO_URL="https://github.com/hthmkt12/t-shop.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  log_error "Vui lòng chạy script này với quyền root (sudo ./scripts/deploy-vps.sh)."
fi

# Prompt domain if not provided
if [ -z "$DOMAIN" ]; then
  read -rp "Nhập tên miền (Domain) của bạn (ví dụ: t-shop.com): " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
  log_error "Tên miền không được để trống!"
fi

if [ -z "$SSL_EMAIL" ]; then
  read -rp "Nhập Email đăng ký chứng chỉ SSL Let's Encrypt: " SSL_EMAIL
fi

log_info "=== BẮT ĐẦU CÀI ĐẶT T-SHOP CHO TÊN MIỀN: $DOMAIN ==="

# 2. Cập nhật hệ thống & Cài đặt gói phụ trợ
log_info "1/7. Cập nhật hệ thống và gói phụ trợ..."
apt-get update -y
apt-get install -y curl wget git ufw nginx certbot python3-certbot-nginx jq

# 3. Tạo 4GB Swap file chống lỗi OOM khi build Next.js
if [ ! -f /swapfile ]; then
  log_info "2/7. Tạo 4GB Swap file phòng ngừa tràn RAM khi build container..."
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  log_success "Đã kích hoạt 4GB Swap."
else
  log_info "2/7. Swap file đã tồn tại. Bỏ qua."
fi

# 4. Cài đặt Docker & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
  log_info "3/7. Cài đặt Docker Engine..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  systemctl enable docker
  systemctl start docker
  log_success "Docker đã cài đặt thành công."
else
  log_info "3/7. Docker đã được cài đặt từ trước."
fi

# 5. Thiết lập mã nguồn tại /opt/t-shop
log_info "4/7. Đồng bộ mã nguồn T-Shop tại $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git pull origin main || true
fi

cd "$APP_DIR"

# Tạo .env.production nếu chưa có
if [ ! -f "$APP_DIR/.env.production" ]; then
  log_info "Tạo cấu hình $APP_DIR/.env.production..."
  cp "$APP_DIR/.env.production.example" "$APP_DIR/.env.production"

  # Sinh chuỗi bí mật ngẫu nhiên cho Payload
  RANDOM_PAYLOAD_SECRET=$(openssl rand -hex 24)
  sed -i "s|generate_strong_random_secret_for_production_jwt|${RANDOM_PAYLOAD_SECRET}|g" "$APP_DIR/.env.production"
  sed -i "s|https://your-domain.com|https://${DOMAIN}|g" "$APP_DIR/.env.production"

  log_warn "File .env.production đã được tạo với PAYLOAD_SECRET ngẫu nhiên."
  log_warn "Hãy cập nhật các khóa STRIPE_SECRET_KEY, S3/R2 trong $APP_DIR/.env.production khi cần!"
fi

# 6. Khởi chạy Docker Compose Production Stack
log_info "5/7. Build và khởi động Docker Containers (Next.js + Payload + MongoDB 7)..."
docker compose -f docker-compose.prod.yml up -d --build

# Chờ container khởi động
log_info "Đang chờ dịch vụ Payload sẵn sàng..."
for i in {1..30}; do
  if curl -s "http://127.0.0.1:3000/" > /dev/null 2>&1; then
    log_success "Dịch vụ T-Shop container đã phản hồi HTTP 200 tại cổng 3000!"
    break
  fi
  sleep 3
done

# 7. Cấu hình Nginx Reverse Proxy
log_info "6/7. Cấu hình Nginx Reverse Proxy..."
NGINX_CONF="/etc/nginx/sites-available/t-shop"
cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
log_success "Nginx cấu hình thành công."

# 8. Cấu hình Tường lửa (UFW)
log_info "7/7. Kích hoạt tường lửa UFW (SSH, HTTP, HTTPS)..."
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

# 9. Cấp chứng chỉ SSL Let's Encrypt (nếu DNS đã trỏ)
if [ -n "$SSL_EMAIL" ]; then
  log_info "Đang cấp chứng chỉ SSL Let's Encrypt..."
  certbot --nginx --non-interactive --agree-tos --email "$SSL_EMAIL" -d "$DOMAIN" || {
    log_warn "Cấp SSL thất bại (có thể do DNS chưa trỏ về IP máy chủ). Hãy chạy lại lệnh sau khi DNS cập nhật:"
    log_warn "certbot --nginx -d $DOMAIN"
  }
fi

echo -e "\n=============================================================================="
log_success "HOÀN TẤT TRIỂN KHAI T-SHOP PRINT-ON-DEMAND TRÊN VPS!"
echo "Website URL: https://${DOMAIN}"
echo "Admin Panel: https://${DOMAIN}/admin"
echo "Theo dõi đơn: https://${DOMAIN}/track-order"
echo "Đường dẫn dự án: ${APP_DIR}"
echo "Xem logs: cd ${APP_DIR} && docker compose -f docker-compose.prod.yml logs -f payload"
echo "=============================================================================="
