# Job 1 Evaluation: Dockerfile Linux Production Readiness

## Context
Production deployment targets Linux Alpine container (`node:20-alpine`). Native binaries for `node-canvas` and `sharp` require specific C/C++ libraries.

## Verification
1. **System dependencies (`base` stage)**:
   - `cairo`, `pango`, `jpeg`, `giflib`, `librsvg`, `libc6-compat` are installed via `apk add --no-cache`.
   - Dynamic shared objects (`.so`) are present at runtime for `canvas.node` and SVG parsing.
2. **Build headers (`deps` stage)**:
   - `build-base`, `cairo-dev`, `pango-dev`, `jpeg-dev`, `giflib-dev`, `librsvg-dev`, `python3` installed.
   - Allows node-gyp native compilation during `yarn install --frozen-lockfile` if prebuilt N-API binary is absent on Alpine x64.
3. **Multi-stage bundling**:
   - `node_modules` compiled in `deps` copied to `builder`.
   - `dist` (Payload server + endpoints) & `.next` (Next.js app router bundle) copied to lightweight `runner`.
4. **Permissions**:
   - Unprivileged user `payload:nodejs` (UID 1001) owns `/app` and `media/` directory.

## Verdict
Ready for Linux production. libcairo, libpango, and librsvg libraries are configured correctly.
