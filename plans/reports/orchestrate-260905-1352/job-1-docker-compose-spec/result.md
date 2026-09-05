# Job 1: docker-compose.yml Audit for Linux Staging Readiness

## Findings & Discrepancies
1. **Node Image & Native Packages**:
   - `docker-compose.yml` currently specifies `image: node:18-alpine` and mounts the host directory with `command: sh -c "yarn install && yarn dev"`.
   - **Risk**: `node:18-alpine` lacks `cairo`, `pango`, `jpeg`, and `librsvg` native packages. If dev container runs `node-canvas` without these packages, runtime fails with `Error: Cannot find module '../build/Release/canvas.node'`.
2. **Production vs Dev Alignment**:
   - `Dockerfile` has multi-stage build installing all required Alpine native build headers (`apk add build-base cairo-dev pango-dev ...`).
   - `docker-compose.yml` should reference `build: .` or use an environment definition that installs system libraries if run in dev mode.
3. **Internal Server Communication**:
   - Docker container correctly maps port `3000:3000` and depends on `mongo` service (`27017:27017`).
   - `INTERNAL_SERVER_URL=http://localhost:3000` should resolve to `http://payload:3000` when services communicate over Docker bridge network.

## Remediation Recommendation
Update `docker-compose.yml` payload service to build from `Dockerfile` or add system package installation before `yarn dev`.
