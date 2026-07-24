<div align="center">

# KenEasy PDF Converter

**An open-and-go local PDF tool** — drop Word, images, text, or existing PDFs; reorder, convert, merge, and download.<br/>
Everything runs in your browser: **no upload, install, or account**.

<br/>

### 👉 Use it now

# [🚀 Open PDF Converter](https://ngiken.github.io/KenEasy-PDF-Converter/)

**https://ngiken.github.io/KenEasy-PDF-Converter/**

> The link above is the **live tool**.<br/>
> This GitHub page is the **source repository**, not the converter itself.

<br/>

[中文](README.md) · [English](README.en.md)

<br/>

<img alt="Use online" src="https://img.shields.io/badge/use%20online-ngiken.github.io-fb7299?style=for-the-badge">
<img alt="Version" src="https://img.shields.io/badge/version-0.3.1-0071e3?style=for-the-badge">
<img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-00aeec?style=for-the-badge">
<img alt="Tests" src="https://img.shields.io/badge/e2e-30%2F30-27c499?style=for-the-badge">
<img alt="License" src="https://img.shields.io/badge/license-MIT-9aa4b2?style=for-the-badge">

<br/><br/>

<img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/hero-light.png" alt="KenEasy PDF Converter v0.3.1 light interface" width="1200">

<sub>Apple-inspired adaptive interface · live tool link above</sub>

</div>

---

## 30-second start

1. Open the **[live tool](https://ngiken.github.io/KenEasy-PDF-Converter/)**
2. Drop images, `.docx`, TXT / MD / CSV, or existing PDFs (multi-select supported)
3. Pick Standard document, Full-bleed images, Letter document, or Separate files — or tune the controls
4. Drag `⠿` to reorder; keyboard users can focus the handle and press ↑ / ↓
5. Click **Generate PDF** to download one merged PDF or separate source-named PDFs

That's it. No account, installer, or server upload.

### Quick tour

<p align="center">
  <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/quick-tour.gif" alt="Three-step tour: import mixed files, choose a layout, generate PDF" width="960">
</p>

<p align="center"><strong>① Import mixed files　→　② Choose layout and order　→　③ Generate locally</strong></p>

---

## What it is

KenEasy PDF Converter is a **frontend-only, offline-ready** mixed-file PDF tool:

| Goal | How it helps |
| --- | --- |
| Screenshots into one PDF | Drop images, reorder, and choose Fit inside or Fill and crop |
| Word into PDF | Read `.docx` while keeping headings, paragraphs, lists, tables, and embedded images where possible |
| Archive plain text | Turn TXT / MD / CSV / LOG / JSON into paginated PDFs |
| Merge existing PDFs | Put PDFs and other file types in the same ordered queue |
| Export every file separately | Use the Separate files preset and keep source-based filenames |
| Handle private files | Finish entirely inside the current browser tab without a server |

The interface supports **中文 / English** and **light / dark** appearances. Choices are remembered; the first visit follows browser language and system appearance.

---

## Interface preview

| Light workspace | Dark workspace |
| --- | --- |
| <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/workspace-light.png" alt="Light output settings and mixed-file queue"> | <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/workspace-dark.png" alt="Dark output settings and mixed-file queue"> |

<p align="center">
  <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/mobile-light.png" alt="KenEasy PDF Converter mobile interface" width="360">
</p>

<p align="center"><sub>Two-column desktop, single-column mobile, with persisted appearance and settings.</sub></p>

---

## Supported

| Input | Formats and notes |
| --- | --- |
| Images | PNG / JPG / JPEG / WEBP / GIF / BMP |
| Word | **`.docx`**; save legacy `.doc` as docx first |
| Text | TXT / MD / Markdown / CSV / LOG / JSON |
| PDF | Joins the same reorder and merge queue directly |

| Output control | Options |
| --- | --- |
| Page size | A4 / Letter / Match image size (images only) |
| Image fit | Fit inside / Fill and crop / Stretch to fill |
| Margin | 0–40 mm; used for documents, text, and Fit inside images |
| Delivery | Merge into one PDF / generate one PDF per input |
| Quick presets | Standard / Full-bleed / Letter / Separate; all rules come from configuration data |

---

## Privacy and offline behavior

- Files are **never uploaded** (the project has no backend)
- Conversion happens only in the current browser tab's memory
- Runtime does not request a CDN; dependencies are pinned under `web/vendor/`
- Content Security Policy blocks runtime network connections
- Closing the page releases local file references held by the queue

---

## Local use (optional)

```powershell
# from the repository root
python -m http.server 5173 --directory web
```

Then open <http://localhost:5173/>.

> Double-clicking `index.html` (`file://`) is not recommended because browsers may restrict scripts. A local static server is the reliable path.

Re-fetch vendored dependencies (maintainers only, optional):

```powershell
.\scratch\fetch-vendor.ps1
```

---

## Known limits

- `.docx` conversion aims to preserve content structure, not pixel-perfect Word print layout
- Headers, footers, text boxes, columns, complex floating images, and unusual fonts may be simplified
- CJK plain text is rasterized line by line for cross-device rendering; Latin text stays as PDF vector text
- GIF is read as a still image; animation is not carried into the PDF
- Encrypted, permission-restricted, or damaged PDFs may fail to merge
- Limits are 40 MB per file and 80 files per queue; very large jobs still depend on browser memory

---

## Layered architecture

Dependency direction stays one-way: **configuration → content / engine → application orchestration → DOM**.

```text
web/                    ← deployable static site
  index.html            ← semantic UI shell
  styles.css            ← adaptive light / dark design system
  config.js             ← formats, limits, page rules, presets, defaults
  i18n.js               ← bilingual copy and translation service
  pdf-engine.js         ← detection, image / DOCX / text conversion, merging, naming
  app.js                ← state, queue, persistence, workflow orchestration
  vendor/               ← pinned offline dependencies
docs/screenshots/       ← real README screenshots and animated tour
scratch/e2e/            ← Chromium regression and capture tooling
.github/workflows/      ← GitHub Pages deployment
```

| Library | Use |
| --- | --- |
| jsPDF | Build PDFs from images and text |
| pdf-lib | Read and merge PDF pages |
| Mammoth | Convert `.docx` into semantic HTML |
| html2canvas | Paginate Word HTML into PDF images |
| SortableJS | Drag-reorder the queue |

Third-party licenses: [`web/vendor/NOTICE.txt`](./web/vendor/NOTICE.txt)

---

## Tests and screenshots

```powershell
cd scratch/e2e
npm ci
npm test                 # real Chromium: expect 30/30 + ALL GREEN
npm run capture:readme   # rebuild README screenshots and GIF
```

The suite creates, downloads, and parses real PDFs. It covers data rules, mixed queues, keyboard sorting, presets, persistence, i18n, appearance, merged page count, separate output, invalid formats, mobile overflow, and zero external runtime requests.

---

## Changelog

### v0.3.1

- Persist output settings immediately, including when generating or reloading directly after several changes
- Keep merge mode, page size, image fit, margins, and filename unchanged after conversion
- Expanded regression coverage to 32 checks with post-conversion and immediate-reload persistence tests

### v0.3.0

- Reimagined the entire interface with the same Apple-inspired adaptive system as KenEasy Image Kit
- Added light/dark appearance, a three-step workflow, quick presets, queue summaries, clear progress, and a mobile layout
- Split the monolith into configuration, i18n, PDF domain engine, and application orchestration layers
- Moved formats, limits, page sizes, fit strategies, presets, and defaults into declarative data
- Added persisted settings, keyboard sorting, CSP offline constraints, and safer output naming
- Added real light, dark, mobile, and animated three-step README visuals
- Added 30 real Chromium checks, including real PDF signatures and merged page counts

### v0.2.4

- Fixed white borders in Fill and crop / Stretch to fill
- Fixed centered aspect-ratio cropping in cover mode
- Clarified image-fit labels

### v0.2.3

- Added bilingual 中文 / English UI with language persistence
- Added a downloadable offline release bundle

---

## Links

| Purpose | Link |
| --- | --- |
| **Use now (recommended)** | https://ngiken.github.io/KenEasy-PDF-Converter/ |
| Download Release | https://github.com/ngiken/KenEasy-PDF-Converter/releases/latest |
| Source | https://github.com/ngiken/KenEasy-PDF-Converter |
| Issues | https://github.com/ngiken/KenEasy-PDF-Converter/issues |

---


## Friends / 友情链接

- [LINUX DO](https://linux.do)

## License

[MIT](LICENSE) © 2026
