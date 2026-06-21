# Phase 4 CSP Closure Report

Date: 2026-06-21

## CSP before

- `script-src 'self'`; inline script elements blocked.
- `script-src-attr 'unsafe-inline'` retained for 117 legacy click attributes.
- `style-src`, `style-src-elem`, and `style-src-attr` allowed `unsafe-inline` for 91 style attributes.
- No external script source; a bounded external QR image source was allowed.

## CSP after

- `default-src 'self'`
- `script-src 'self'`
- `script-src-elem 'self'`
- `script-src-attr 'none'`
- `style-src 'self'`
- `style-src-elem 'self'`
- `style-src-attr 'none'`
- `object-src 'none'`
- `base-uri 'self'`
- `frame-ancestors 'none'`
- `font-src 'self'`
- `connect-src 'self'`
- `form-action 'self'`
- `img-src 'self' data: blob: https://api.qrserver.com`
- `upgrade-insecure-requests` is appended when `HTTPS=true`; it is omitted from local HTTP development to avoid upgrading local subresources.

## Closure status

- `unsafe-inline` remains: no.
- First-party event attributes remaining: 0.
- First-party inline styles remaining: 0.
- First-party CSSOM inline style assignments remaining: 0.
- Inline `<script>` renderer fragments remaining: 0.
- Inline `<style>` renderer fragments remaining: 0.

The sole external CSP origin is `https://api.qrserver.com` under `img-src`, used to display/download facility QR images. It cannot execute script or load CSS. Removing it requires a self-hosted QR generation implementation and is not an inline-code exception.

## Production impact

The browser no longer accepts inline script/style attributes or inline script/style elements from the application. A successful automated test suite and source guards confirm the policy shape. Focused browser/device regression is still required for the migrated UI controls, generated print documents, QR/camera flows, charts, and responsive navigation.

## Next required step

Execute the physical browser/device checklist and production-environment CSP violation monitoring. No CSP inline migration step remains.
