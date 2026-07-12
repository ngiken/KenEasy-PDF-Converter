<div align="center">

  <h1>KenEasy PDF Converter</h1>

  <p>
    Convert Word, images, and text to PDF in the browser. Drag, reorder, merge — files never leave your device.
  </p>

  <p>
    <a href="README.md">中文</a>
    ·
    English
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-fb7299">
    <img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-27c499">
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
| Word | `.docx` text extraction → PDF |
| Text | TXT / MD / CSV → PDF |
| PDF merge | Existing PDFs can join the queue |
| Zero backend | Static site; host anywhere |

## Run locally

```powershell
python -m http.server 5173 --directory web
```

Open <http://localhost:5173/>. Or open `web/index.html` directly (CDN required for libraries).

## Deploy

Publish the `web/` folder to any static host (GitHub Pages, Cloudflare Pages, Netlify, Nginx, etc.).

## Limits

- `.doc` (legacy Word) is not supported — save as `.docx` first
- Complex Word layout is simplified to plain text
- Suggested max ~40MB per file, 80 files per queue
- CJK text is rendered via canvas (readable; not a full selectable text layer)

## License

MIT — see [LICENSE](./LICENSE).
