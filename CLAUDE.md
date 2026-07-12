# CLAUDE.md — KenEasy PDF Converter

Browser-only drag-and-drop converter: Word / images / text → PDF, merge + reorder. No server upload. Offline vendor bundle.

## Project layout

```text
web/
  index.html      # UI entry (static)
  styles.css
  app.js          # queue, convert, merge, download
  vendor/         # offline JS libs + NOTICE.txt
scratch/
  fetch-vendor.ps1
README.md
README.en.md
LICENSE
```

Ship / host only the `web/` folder (includes `vendor/`).

## Product goals

1. **Open a link → works** — static hosting, no install, no account
2. **Local only** — files never leave the browser tab
3. **Simple UX** — drag in → reorder → one PDF (or separate)
4. **Offline-capable** — vendored deps under `web/vendor/`
5. **Better Word** — mammoth HTML + html2canvas page slices (not raw text only)

## Hard rules (do not break)

1. **Never commit secrets** — `*.pem`, `*.p12`, `*.key`, `.env`, credentials
2. **Workspace parent** `../` may hold signing keys / raw recordings — do not copy them here
3. **Do not `git init` in the parent workspace** — this folder is the git root
4. **No backend / no file upload API** unless product direction explicitly changes
5. Prefer small, layered changes; keep conversion logic in `web/app.js`
6. Vendor pins are intentional — bump via `scratch/fetch-vendor.ps1` + retest

## Tech notes

| Concern | Approach |
| --- | --- |
| Image PDF | jsPDF |
| Merge PDFs | pdf-lib |
| DOCX | mammoth `convertToHtml` + images as data URLs |
| DOCX layout | html2canvas full render → slice by page height → jsPDF images |
| Plain text | jsPDF vector (Latin) or canvas lines (CJK) |
| Reorder UI | SortableJS |
| Offline | local `web/vendor/*` only (no CDN at runtime) |

## Safe commit checklist

```text
[ ] git status — no secrets / unexpected binaries
[ ] vendor/ complete (5 min js + NOTICE)
[ ] index.html script tags match vendor filenames
[ ] Version badges if releasing
```

## Daily workflow

| Task | Path / command |
| --- | --- |
| Open project | this folder |
| Local preview | `python -m http.server 5173 --directory web` |
| Refresh vendors | `.\scratch\fetch-vendor.ps1` |
| Deploy unit | `web/` directory only |
| Workspace status | `..\scripts\status-all.ps1` |

## Out of scope (v0.2)

- OCR for scanned images
- Perfect Word print fidelity / editable text layer for CJK Word pages
- Server-side conversion
- User accounts / cloud storage
