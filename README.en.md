<div align="center">

# KenEasy PDF Converter

**Open the link and convert** — drop Word / images / text, reorder, merge into one PDF.  
Everything runs in your browser. **No upload. No install. No account.**

<br/>

### 👉 Use it now

# [🚀 Open the converter](https://ngiken.github.io/KenEasy-PDF-Converter/)

**https://ngiken.github.io/KenEasy-PDF-Converter/**

> That link is the **live app**.  
> This GitHub page is **source code only** — not the tool itself.

<br/>

[中文](README.md) · [English](README.en.md)

<br/>

<img alt="Use online" src="https://img.shields.io/badge/use%20online-ngiken.github.io-fb7299?style=for-the-badge">
<img alt="Version" src="https://img.shields.io/badge/version-0.2.3-27c499?style=for-the-badge">
<img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-00aeec?style=for-the-badge">
<img alt="License" src="https://img.shields.io/badge/license-MIT-9aa4b2?style=for-the-badge">

</div>

---

## 30-second start

1. Open the **[live converter](https://ngiken.github.io/KenEasy-PDF-Converter/)**
2. Drop files (multi-select supported)
3. Drag `⠿` to reorder (optional)
4. Keep “merge into one PDF” on (default)
5. Click **Generate PDF** → download

---

## What it does

| Goal | How |
| --- | --- |
| Screenshots → one PDF | Drop images → reorder → merge |
| Word → PDF | Drop `.docx` (headings, lists, tables, images kept as much as possible) |
| Text / Markdown → PDF | Drop TXT / MD / CSV |
| Stitch PDFs | Add PDFs to the same queue |
| Private files | Fully client-side — nothing is uploaded |

The UI is **bilingual (中文 / English)**. Use the switcher in the header; your choice is remembered. First visit follows the browser language.

---

## Supported inputs

| Kind | Formats |
| --- | --- |
| Images | PNG / JPG / WEBP / GIF / BMP |
| Word | **`.docx` only** (save legacy `.doc` as docx first) |
| Text | TXT / MD / CSV … |
| PDF | Merge / reorder with other files |

---

## Privacy

Files never leave your browser tab. There is no backend and no file upload API.

---

## Run locally (optional)

```powershell
python -m http.server 5173 --directory web
```

Open <http://localhost:5173/>. Vendored libs live in `web/vendor/` for offline use.

```powershell
.\scratch\fetch-vendor.ps1
```

---

## Limits

- Complex Word layout is simplified (headers/footers, text boxes, floats)
- ~40MB per file suggested, ~80 files per queue
- Encrypted PDFs may fail to merge

---

## Changelog

### v0.2.3
- **Bilingual UI (中文 / English)** with header switcher; remembers choice; first visit follows browser language
- **Polish**: clearer copy and toasts; queue/error strings update when language changes
- **Offline Release**: downloadable static bundle on GitHub Releases

---

## Links

| | |
| --- | --- |
| **Use now** | https://ngiken.github.io/KenEasy-PDF-Converter/ |
| **Download (Release)** | https://github.com/ngiken/KenEasy-PDF-Converter/releases/latest |
| Source | https://github.com/ngiken/KenEasy-PDF-Converter |
| Issues | https://github.com/ngiken/KenEasy-PDF-Converter/issues |

## License

MIT — see [LICENSE](./LICENSE).
