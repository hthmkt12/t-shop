# Job 1: Dockerfile Multi-Stage & Native Dependencies Audit

## Stage Analysis
1. **`base` stage**:
   - Image: `node:20-alpine`
   - Shared runtime packages: `libc6-compat`, `cairo`, `pango`, `jpeg`, `giflib`, `librsvg`
   - Purpose: Runtime shared `.so` libraries required when `canvas.node` loads dynamically in production.
2. **`deps` stage**:
   - Build-time packages: `build-base`, `cairo-dev`, `pango-dev`, `jpeg-dev`, `giflib-dev`, `librsvg-dev`, `python3`
   - Action: `yarn install --frozen-lockfile` compiles native C++ bindings for `node-canvas` targeting Alpine Linux (musl libc).
3. **`builder` stage**:
   - Runs `yarn build` inside Alpine environment with native node modules in place.
4. **`runner` stage**:
   - Strips development tools and headers.
   - Non-root user `payload:nodejs` (UID 1001).
   - Only copies compiled `dist`, `.next`, `node_modules`, and runtime assets.

## Verdict
Specification is robust and solves the Linux native dependency requirement.
