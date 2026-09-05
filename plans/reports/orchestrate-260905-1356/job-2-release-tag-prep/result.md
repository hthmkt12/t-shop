# Job 2: Release Notes — v1.1.0-pod-render

## Summary
Release `v1.1.0-pod-render` introduces the hybrid client/server POD customizer and production batch rendering architecture.

## Highlights
- **Dual-Side Vector Customizer**: Fabric.js canvas with zero SSR lag, front and back canvas states serialized to JSON (`fabricJsonFront`, `fabricJsonBack`).
- **300 DPI Server-Side Renderer**: `renderPodPrintBuffer()` re-projects client canvas onto physical print dimensions with sharp DPI chunk stamping.
- **Production ZIP Batch Exporter**: `/api/export-production-batch?status=in_production&format=zip` streams an archive containing ready-to-print PNGs and customer `manifest.csv`.
- **Admin Fulfillment Inspect**: Payload admin displays collapsible JSON trees for front/back geometry.
- **UX Quick Wins**: Satisfaction Guarantee badge, POD FAQ accordion, and dynamic free shipping progress bar.
- **Docker Alpine Hardening**: Multi-stage runner includes `cairo`, `pango`, and `librsvg` for Linux container stability.
