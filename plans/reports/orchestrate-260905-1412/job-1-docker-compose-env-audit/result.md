# Job 1: Docker Compose Environment & Network Audit

## Findings
1. **Service `payload` environment**:
   - Hiện tại `docker-compose.yml` load `env_file: - .env`.
   - Trong `.env`, `DATABASE_URI` mặc định là `mongodb://127.0.0.1:27017/...`.
   - **Lưu ý mạng Docker**: Khi chạy container qua docker-compose, `127.0.0.1` bên trong container `payload` trỏ tới chính container đó, không phải service `mongo`.
   - Khi chạy bằng docker compose, service `payload` cần override:
     `DATABASE_URI: mongodb://mongo:27017/payload-template-ecommerce` để kết nối service `mongo` qua bridge network nội bộ.
2. **Khuyến nghị**:
   - Thêm phần `environment` trong service `payload` của `docker-compose.yml` để override `DATABASE_URI: mongodb://mongo:27017/payload-template-ecommerce`.
