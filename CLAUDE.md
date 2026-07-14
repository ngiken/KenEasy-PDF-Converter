# CLAUDE.md — KenEasy PDF Converter

Browser-only mixed-file PDF tool: drop images, DOCX, text, or existing PDFs → reorder → choose a layout → merge or download separately. No backend, upload, install, or account.

## Layered architecture

```text
web/
  index.html       # semantic UI shell only
  styles.css       # adaptive Apple-inspired light/dark design system
  config.js        # data layer: limits, input rules, page sizes, fit rules, presets, defaults
  i18n.js          # content layer: bilingual copy + translation service
  pdf-engine.js    # domain layer: detection, rendering, merging, naming
  app.js           # application layer: state, persistence, queue, DOM orchestration
  vendor/          # pinned offline libraries + NOTICE.txt
docs/screenshots/  # README screenshots and animated tour
scratch/e2e/       # real-browser regression and screenshot tooling
```

Dependency direction is one-way: `config → i18n/engine → app → DOM`.

Do not hard-code a new input rule, page size, fit strategy, preset, limit, default, or storage key inside an event handler. Put rules in `config.js`, user-facing copy in `i18n.js`, PDF behavior in `pdf-engine.js`, and workflow coordination in `app.js`.

## Product goals

1. Open a link and it works — static hosting, no install or account.
2. Local only — files never leave the browser tab.
3. Mixed-file flow — import, reorder, choose a recipe, generate one or many PDFs.
4. Offline-capable — all runtime dependencies are vendored under `web/vendor/`.
5. Stable and extensible — rules are data-driven and layers remain decoupled.
6. Accessible and adaptive — keyboard sorting, semantic labels, reduced motion, mobile layout, and equivalent light/dark experiences.

## Hard rules

1. Never commit secrets: `*.pem`, `*.p12`, `*.key`, `.env`, credentials.
2. Never copy signing keys or raw recordings from the parent workspace.
3. This directory is its own repository; never commit it through the parent `D:\code` repository.
4. No backend, file-upload API, runtime CDN, analytics, or tracking unless product direction explicitly changes.
5. Preserve the dependency direction and the Layering / Decoupling / Rule-based / Data-driven design philosophy.
6. Vendor pins are intentional; bump through `scratch/fetch-vendor.ps1`, update `NOTICE.txt`, and rerun E2E.
7. Preserve the adaptive design system: neutral canvas, blue primary action, restrained KenEasy pink/cyan accents, and equivalent light/dark behavior.
8. README screenshots must come from the real app through `npm run capture:readme`, not hand-made mockups.

## Conversion rules

| Concern | Rule |
| --- | --- |
| Image | jsPDF; auto/A4/Letter; contain, center-crop cover, or stretch |
| Full bleed | Cover/stretch ignore margin and occupy the complete PDF page |
| DOCX | Mammoth HTML + embedded data-URL images + html2canvas page slices |
| Latin text | jsPDF vector text with automatic wrapping and pagination |
| CJK text | Canvas line rendering to avoid missing glyphs across devices |
| Existing PDF | pdf-lib loads and copies source pages in queue order |
| Separate output | Sanitized source-based names, deduplicated case-insensitively |
| Safety | 40 MB/file, 80 files, 4,096 px raster edge, max 2,000 pt auto page edge |
| Offline | CSP `connect-src 'none'`; no runtime external request |

## Testing

```powershell
cd scratch/e2e
npm ci
npm test                 # expect: 30/30 checks passed + ALL GREEN
npm run capture:readme   # rebuild docs/screenshots/*.png and quick-tour.gif
```

The suite uses real Chromium and verifies actual downloaded PDF signatures/page counts, merge and separate delivery, presets, persistence, keyboard ordering, i18n, appearance, invalid formats, responsive layout, and offline behavior.

## Safe change checklist

```text
[ ] git status contains no secrets or unexpected binaries
[ ] new product rules live in config.js, not UI handlers
[ ] new copy exists in both zh and en
[ ] vendor files and NOTICE are complete
[ ] index.html versioned assets match the release version
[ ] node --check passes for every first-party JS file
[ ] npm test reports 30/30 + ALL GREEN
[ ] README visuals regenerated and visually inspected when UI changes
[ ] README badges/changelog match the release version
```

## Local preview

```powershell
python -m http.server 5173 --directory web
```

Open <http://localhost:5173/>. Ship or host the `web/` directory only.

## Out of scope for v0.3

- OCR for scanned images
- Legacy `.doc` conversion
- Pixel-perfect Word print fidelity
- Editable CJK text layer for rasterized lines
- PDF encryption, signing, annotation, or page-level editing
- Server processing, accounts, cloud storage, or analytics
