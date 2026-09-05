# Job 1: Docker Compose Stack Verification

## Status
- **Compose Version**: Docker Compose v2.x compatible.
- **Service Specs**:
  - `mongo`: Official `mongo:latest` with wiredTiger storage engine.
  - `payload`: Multi-stage runner image with native Cairo, Pango, and librsvg.
  - Environment: `DATABASE_URI` correctly configured to connect via internal container network.
  - Volume mounts: `./media:/app/media` preserved for persistent uploads.
