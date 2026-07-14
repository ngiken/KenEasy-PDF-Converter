// Capture deterministic README visuals from the real local app.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const WEB = path.join(ROOT, "web");
const SHOTS = path.join(ROOT, "docs", "screenshots");
const TEMP = path.join(HERE, "out");
const PORT = 5197;
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(TEMP, { recursive: true });

const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(request.url.split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  const target = path.resolve(WEB, "." + pathname);
  if (!target.startsWith(WEB) || !fs.existsSync(target)) { response.writeHead(404); response.end("404"); return; }
  response.writeHead(200, { "Content-Type": MIME[path.extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(target).pipe(response);
});
await new Promise((resolve) => server.listen(PORT, resolve));
const url = `http://localhost:${PORT}/`;

function seedPreferences(appearance) {
  localStorage.setItem("keneasy-pdf-lang", "zh");
  localStorage.setItem("keneasy-pdf-appearance", appearance);
  localStorage.setItem("keneasy-pdf-settings-v3", JSON.stringify({ merge: true, pageSize: "a4", imageFit: "contain", marginMm: 12, filename: "project-notes" }));
}

async function addDemoFiles(page) {
  await page.evaluate(async () => {
    function canvas(width, height, colors, label) {
      const surface = document.createElement("canvas"); surface.width = width; surface.height = height;
      const context = surface.getContext("2d");
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors[0]); gradient.addColorStop(1, colors[1]);
      context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(255,255,255,.14)"; context.beginPath(); context.arc(width * .82, height * .28, width * .18, 0, Math.PI * 2); context.fill();
      context.fillStyle = "rgba(14,25,50,.24)"; context.fillRect(0, height * .72, width, height * .28);
      context.fillStyle = "rgba(255,255,255,.94)"; context.font = `700 ${Math.max(28, Math.round(width / 16))}px -apple-system, sans-serif`; context.fillText(label, width * .07, height * .15);
      return surface;
    }
    function toFile(surface, name, type) { return new Promise((resolve) => surface.toBlob((blob) => resolve(new File([blob], name, { type })), type, .92)); }
    const transfer = new DataTransfer();
    transfer.items.add(await toFile(canvas(1200, 800, ["#ff759f", "#8178ff"], "Quarterly Cover"), "quarterly-cover.jpg", "image/jpeg"));
    transfer.items.add(await toFile(canvas(850, 1100, ["#66d4ff", "#3478f6"], "Product Notes"), "product-notes.png", "image/png"));
    transfer.items.add(new File(["KenEasy PDF Converter\n\n会议纪要与项目摘要\n- 本地转换\n- 混合格式队列\n- 一键合并"], "meeting-notes.txt", { type: "text/plain" }));
    const input = document.getElementById("fileInput"); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(() => document.querySelectorAll("#fileList .file-item").length === 3);
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, locale: "zh-CN", colorScheme: "light", acceptDownloads: true });
  await context.addInitScript(seedPreferences, "light");
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SHOTS, "hero-light.png") });
  await page.screenshot({ path: path.join(TEMP, "readme-tour-01.png") });

  await page.locator(".header").evaluate((element) => { element.style.position = "absolute"; });
  await page.locator(".skip-link").evaluate((element) => { element.style.display = "none"; });
  await addDemoFiles(page);
  await page.click('[data-preset-id="document"]');
  await page.locator(".workspace-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.locator(".workspace-grid").screenshot({ path: path.join(SHOTS, "workspace-light.png") });
  await page.screenshot({ path: path.join(TEMP, "readme-tour-02.png") });

  await page.click("#themeToggle");
  await page.locator(".workspace-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.locator(".workspace-grid").screenshot({ path: path.join(SHOTS, "workspace-dark.png") });
  await page.click("#themeToggle");
  await page.locator(".workspace-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);

  const download = page.waitForEvent("download");
  await page.click("#btnConvert");
  await download;
  await page.waitForFunction(() => document.getElementById("btnConvert").getAttribute("aria-busy") === "false");
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(TEMP, "readme-tour-03.png") });
  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: "zh-CN", colorScheme: "light" });
  await mobile.addInitScript(seedPreferences, "light");
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(url, { waitUntil: "networkidle" });
  await mobilePage.evaluate(() => document.fonts && document.fonts.ready);
  await mobilePage.waitForTimeout(350);
  await mobilePage.screenshot({ path: path.join(SHOTS, "mobile-light.png") });
  await mobile.close();
  console.log("README screenshots captured in docs/screenshots/");
} finally {
  await browser.close();
  server.close();
}
