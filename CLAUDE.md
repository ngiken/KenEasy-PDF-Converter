# CLAUDE.md ??KenEasy-PDF-Converter

Browser-only drag-and-drop converter: Word/images/text → PDF, merge + reorder, open via link, no server upload

## Project layout

```text
(add layout as the project grows)
```

## Hard rules (do not break)

1. **Never commit secrets** ??`*.pem`, `*.p12`, `*.key`, `.env`, credentials
2. **Workspace parent** `../` may hold signing keys / raw recordings ??do not copy them here
3. **Do not `git init` in the parent workspace** ??this folder is the git root
4. Prefer small, layered changes

## Safe commit checklist

```text
[ ] git status ??no secrets / unexpected binaries
[ ] Only intentional media tracked
[ ] Version bump consistent if releasing
```

## Daily workflow

| Task | Path |
| --- | --- |
| Open project | this folder |
| Workspace status | `..\scripts\status-all.ps1` |
| Workspace backup | `..\scripts\backup-workspace.ps1` |
