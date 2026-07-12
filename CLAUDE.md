# CLAUDE.md — KenEasy PDF Converter

Browser-only drag-and-drop converter: Word / images / text → PDF, merge + reorder. No server upload.

## Project layout

```text
web/
  index.html      # UI entry (static)
  styles.css
  app.js          # queue, convert, merge, download
scratch/          # maintainer-only local scripts
README.md         # Chinese product README
README.en.md      # English README
LICENSE
```

Ship / host only the `web/` folder.

## Product goals

1. **Open a link → works** — static hosting, no install, no account
2. **Local only** — files never leave the browser tab
3. **Simple UX** — drag in → reorder → one PDF (or separate)
4. **Small surface** — no build step for the shipped page

## Hard rules (do not break)

1. **Never commit secrets** — `*.pem`, `*.p12`, `*.key`, `.env`, credentials
2. **Workspace parent** `../` may hold signing keys / raw recordings — do not copy them here
3. **Do not `git init` in the parent workspace** — this folder is the git root
4. **No backend / no file upload API** unless product direction explicitly changes
5. Prefer small, layered changes; keep conversion logic in `web/app.js`

## Tech notes

| Concern | Approach |
| --- | --- |
| Image / text PDF | jsPDF (CDN) |
| Merge PDFs | pdf-lib (CDN) |
| DOCX text | mammoth (CDN) |
| Reorder UI | SortableJS (CDN) |
| CJK text | canvas line raster → embed as image (Helvetica cannot draw CJK) |
| Legacy `.doc` | Reject with message to resave as `.docx` |

Pinned CDN versions live in `web/index.html` — bump deliberately and re-test.

## Safe commit checklist

```text
[ ] git status — no secrets / unexpected binaries
[ ] Only intentional media tracked
[ ] CDN version pins still intentional
[ ] Version badge / README if releasing
```

## Daily workflow

| Task | Path / command |
| --- | --- |
| Open project | this folder (`02-KenEasy-PDF-Converter`) |
| Local preview | `python -m http.server 5173 --directory web` |
| Deploy unit | `web/` directory only |
| Workspace status | `..\scripts\status-all.ps1` |
| Workspace backup | `..\scripts\backup-workspace.ps1` |

## Out of scope (v0.1)

- OCR for scanned images
- Perfect Word layout fidelity / embedded fonts packaging
- Server-side conversion
- User accounts / cloud storage
