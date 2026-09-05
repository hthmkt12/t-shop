#!/usr/bin/env bash
# ==============================================================================
# T-Shop Automated MongoDB Backup Script
# Usage:
#   chmod +x scripts/backup-mongo.sh
#   sudo ./scripts/backup-mongo.sh
# Add to crontab for daily backup at 2 AM:
#   0 2 * * * /opt/t-shop/scripts/backup-mongo.sh > /dev/null 2>&1
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/opt/t-shop/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/t-shop-mongo-${TIMESTAMP}.tar.gz"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Bắt đầu backup database T-Shop..."

# Tạo dump trực tiếp từ container mongo
docker compose -f /opt/t-shop/docker-compose.prod.yml exec -T mongo \
  mongodump --db payload-template-ecommerce --archive --gzip > "$BACKUP_FILE"

echo "[$(date)] Backup thành công: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Xóa các bản backup cũ hơn 14 ngày
find "$BACKUP_DIR" -type f -name "t-shop-mongo-*.tar.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \;
echo "[$(date)] Đã dọn dẹp các bản backup cũ hơn $RETENTION_DAYS ngày."
