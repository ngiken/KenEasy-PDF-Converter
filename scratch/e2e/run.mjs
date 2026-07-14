// KenEasy PDF Converter — real-browser, offline end-to-end regression suite.
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, "../../web");
const OUT = path.join(HERE, "out");
const PORT = 5198;
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(request.url.split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  const target = path.resolve(WEB, "." + pathname);
  if (!target.startsWith(WEB) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    response.writeHead(404); response.end("404"); return;
  }
  response.writeHead(200, { "Content-Type": MIME[path.extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(target).pipe(response);
});

const results = [];
function check(name, condition, detail = "") {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`[${condition ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
}
function signature(file) { return fs.readFileSync(file).subarray(0, 5).toString("ascii"); }
async function waitForDownloads(list, count, timeout = 12000) {
  const started = Date.now();
  while (list.length < count && Date.now() - started < timeout) await new Promise((resolve) => setTimeout(resolve, 60));
}

await new Promise((resolve) => server.listen(PORT, resolve));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true, locale: "zh-CN", colorScheme: "light" });
const page = await context.newPage();
const external = [];
const errors = [];
const downloads = [];
page.on("request", (request) => {
  const url = request.url();
  if (!url.startsWith(`http://localhost:${PORT}`) && !url.startsWith("data:") && !url.startsWith("blob:")) external.push(url);
});
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(String(error)));
page.on("download", async (download) => {
  const name = download.suggestedFilename();
  const target = path.join(OUT, `${downloads.length + 1}-${name}`);
  await download.saveAs(target);
  downloads.push({ name, target });
});

try {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  check("page loads without console errors", errors.length === 0, errors.join(" | "));
  check("all vendor libraries load offline", await page.evaluate(() => Boolean(window.Sortable && window.jspdf && window.PDFLib && window.mammoth && window.html2canvas)));
  check("layered modules load", await page.evaluate(() => Boolean(window.KenEasyPdfConfig && window.KenEasyPdfI18n && window.KenEasyPdfEngine && window.__KenEasyPdfApp)));
  check("four data-driven presets render", await page.locator("#presetList .preset-btn").count() === 4);
  check("page and fit rules render from configuration", await page.evaluate(() => document.querySelectorAll("#optPageSize option").length === 3 && document.querySelectorAll("#optImageFit option").length === 3));
  check("workflow starts at import", await page.locator('#workflowSteps [aria-current="step"]').getAttribute("data-workflow-step") === "1");
  check("CSP blocks runtime connections", (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content")).includes("connect-src 'none'"));

  await page.evaluate(async () => {
    function canvas(width, height, colors) {
      const surface = document.createElement("canvas"); surface.width = width; surface.height = height;
      const context = surface.getContext("2d");
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors[0]); gradient.addColorStop(1, colors[1]);
      context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(255,255,255,.9)"; context.font = "700 56px sans-serif"; context.fillText("KenEasy", 50, 90);
      return surface;
    }
    function fileFromCanvas(surface, name, type) { return new Promise((resolve) => surface.toBlob((blob) => resolve(new File([blob], name, { type })), type, .9)); }
    const transfer = new DataTransfer();
    transfer.items.add(await fileFromCanvas(canvas(900, 600, ["#fb7299", "#725cff"]), "cover-image.jpg", "image/jpeg"));
    transfer.items.add(await fileFromCanvas(canvas(600, 900, ["#00aeec", "#10b981"]), "portrait.png", "image/png"));
    transfer.items.add(new File(["KenEasy PDF Converter\nLocal conversion\n中文内容测试"], "notes.txt", { type: "text/plain" }));
    const input = document.getElementById("fileInput"); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelectorAll("#fileList .file-item").length === 3);
  check("mixed files enter one queue", await page.locator("#fileList .file-item").count() === 3);
  check("kind rules classify images and text", await page.evaluate(() => Array.from(document.querySelectorAll(".kind")).map((node) => node.textContent).join(",") === "IMG,IMG,TXT"));
  check("queue total and action summary update", await page.evaluate(() => /3/.test(document.getElementById("fileCount").textContent) && /3/.test(document.getElementById("actionHint").textContent)));
  check("workflow advances to layout", await page.locator('#workflowSteps [aria-current="step"]').getAttribute("data-workflow-step") === "2");
  check("image previews use local blob URLs", await page.evaluate(() => Array.from(document.querySelectorAll(".thumb img")).every((image) => image.src.startsWith("blob:"))));

  const firstBefore = await page.locator("#fileList .name").first().textContent();
  await page.locator("#fileList .handle").first().press("ArrowDown");
  const firstAfter = await page.locator("#fileList .name").first().textContent();
  check("keyboard reordering moves queue items", firstBefore !== firstAfter, `${firstBefore} -> ${firstAfter}`);

  await page.click('[data-preset-id="fullbleed"]');
  check("preset applies rule bundle", await page.evaluate(() => document.getElementById("optPageSize").value === "a4" && document.getElementById("optImageFit").value === "cover" && document.getElementById("optMargin").value === "0" && document.getElementById("optMerge").checked));
  await page.fill("#optFilename", "mixed-demo");
  await page.waitForTimeout(180);
  check("settings persist as a normalized data object", await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("keneasy-pdf-settings-v3"));
    return saved.filename === "mixed-demo" && saved.imageFit === "cover" && saved.marginMm === 0;
  }));

  await page.click("#langEn");
  check("language switch updates dynamic queue UI", (await page.locator("#btnConvertLabel").textContent()) === "Generate PDF" && (await page.locator("#fileCount").textContent()).includes("files"));
  await page.click("#langZh");
  await page.click("#themeToggle");
  check("appearance switch persists dark mode", await page.evaluate(() => document.documentElement.dataset.theme === "dark" && localStorage.getItem("keneasy-pdf-appearance") === "dark"));
  await page.click("#themeToggle");

  const mergeStart = downloads.length;
  await page.click("#btnConvert");
  await waitForDownloads(downloads, mergeStart + 1);
  await page.waitForFunction(() => document.getElementById("btnConvert").getAttribute("aria-busy") === "false");
  check("merged conversion triggers one PDF download", downloads.length === mergeStart + 1 && downloads.at(-1).name === "mixed-demo.pdf");
  check("download has a real PDF signature", signature(downloads.at(-1).target) === "%PDF-");
  const mergedPdf = await PDFDocument.load(fs.readFileSync(downloads.at(-1).target));
  check("merged PDF preserves one page per simple input", mergedPdf.getPageCount() === 3, `${mergedPdf.getPageCount()} pages`);
  check("progress reaches complete state", await page.evaluate(() => document.getElementById("progressTrack").getAttribute("aria-valuenow") === "100" && /完成/.test(document.getElementById("statusText").textContent)));
  check("workflow marks generation complete", await page.locator('#workflowSteps [data-workflow-step="3"]').evaluate((node) => node.classList.contains("complete")));

  await page.click('[data-preset-id="separate"]');
  const separateStart = downloads.length;
  await page.click("#btnConvert");
  await waitForDownloads(downloads, separateStart + 3);
  await page.waitForFunction(() => document.getElementById("btnConvert").getAttribute("aria-busy") === "false");
  const separate = downloads.slice(separateStart);
  check("separate preset downloads every item", separate.length === 3, separate.map((item) => item.name).join(", "));
  check("separate names are source-based and unique", new Set(separate.map((item) => item.name.toLowerCase())).size === 3 && separate.every((item) => item.name.endsWith(".pdf")));
  check("every separate output is a real PDF", separate.every((item) => signature(item.target) === "%PDF-"));

  await page.evaluate(() => {
    const transfer = new DataTransfer(); transfer.items.add(new File(["legacy"], "old.doc", { type: "application/msword" }));
    const input = document.getElementById("fileInput"); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelectorAll("#fileList .file-item").length === 4);
  check("legacy DOC is retained with an actionable error", await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll("#fileList .file-item")).find((item) => item.querySelector(".name").textContent === "old.doc");
    return row.classList.contains("is-error") && /docx/i.test(row.querySelector(".sub").textContent);
  }));
  check("invalid items do not increase conversion count", await page.locator("#btnCount").textContent() === "3");

  await page.setViewportSize({ width: 390, height: 844 });
  check("mobile layout has no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
  check("runtime makes no external network requests", external.length === 0, external.join(" | "));
  check("no browser errors after full workflow", errors.length === 0, errors.join(" | "));
} finally {
  await context.close();
  await browser.close();
  server.close();
}

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exitCode = 1;
else console.log("ALL GREEN");
