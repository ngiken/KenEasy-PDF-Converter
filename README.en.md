<div align="center">

  <h1>KenEasy PDF Converter</h1>

  <p>
    Convert Word, images, and text to PDF in the browser. Drag, reorder, merge — files never leave your device. Offline-ready vendor bundle included.
  </p>

  <p>
    <a href="README.md">中文</a>
    ·
    English
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-fb7299">
    <img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-27c499">
    <img alt="Offline" src="https://img.shields.io/badge/offline-vendored-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-00aeec">
  </p>

</div>

## Overview

KenEasy PDF Converter is a **client-only** PDF tool. Open the link and use it — no install, no account. Processing stays in browser memory; **nothing is uploaded**.

## Features

| Feature | Details |
| --- | --- |
| Drag & drop | Drop or pick multiple files into a queue |
| Reorder | Drag handles to set merge order |
| Merge / split | Default: one combined PDF; optional per-file downloads |
| Images | PNG / JPG / WEBP / GIF / BMP → PDF |
| Word | `.docx` with headings, lists, tables, emphasis, embedded images |
| Text | TXT / MD / CSV → PDF |
| PDF merge | Existing PDFs can join the queue |
| Offline | Libraries vendored under `web/vendor/` |
| Zero backend | Static site; host anywhere |

## Run locally

```powershell
python -m http.server 5173 --directory web
```

Open <http://localhost:5173/>.

Refresh vendors:

```powershell
.\scratch\fetch-vendor.ps1
```

## Deploy

Publish the `web/` folder to any static host (GitHub Pages, Cloudflare Pages, Netlify, Nginx, etc.).

## Limits

- `.doc` (legacy Word) is not supported — save as `.docx` first
- Word layout is improved but not print-engine perfect (headers/footers, text boxes, complex floats still simplified)
- Word pages are rasterized for reliable CJK/layout; Latin plain text remains vector text
- Suggested max ~40MB per file, 80 files per queue

## License

MIT — see [LICENSE](./LICENSE).
