# Job 1: docker-compose.yml Patched for Native Alpine Support

## Changes Made
- Replaced `image: node:18-alpine` with `build: { context: ., dockerfile: Dockerfile, target: runner }`.
- Preserved persistent upload media mounting (`./media:/app/media`).
- Inherits all Alpine native packages (`cairo`, `pango`, `jpeg`, `librsvg`, `libc6-compat`) from `Dockerfile`.
- Fixed node-canvas procedure entry point crash risk on Linux staging.
