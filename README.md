<div align="center">

  <h1>KenEasy PDF Converter</h1>

  <p>
    浏览器内把 Word、图片、文本转成 PDF。拖入、排序、合并，文件不离开本机。支持离线包。
  </p>

  <p>
    中文
    ·
    <a href="README.en.md">English</a>
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-fb7299">
    <img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-27c499">
    <img alt="Offline" src="https://img.shields.io/badge/offline-vendored-00aeec">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-00aeec">
  </p>

</div>

## 项目简介

KenEasy PDF Converter 是一个**纯前端**的在线 PDF 转换器。打开链接即可使用，无需安装、无需账号。文件在浏览器内存中处理，**不会上传到任何服务器**。

适合：把几张截图 / 一份 Word / 若干文本快速合成一个可分享的 PDF。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 拖入即用 | 拖拽或点选多个文件进入队列 |
| 排序 | 按住手柄拖动，决定合并后的页序 |
| 合并 / 分开 | 默认全部合成一个 PDF；也可关掉合并，逐个下载 |
| 图片 → PDF | PNG / JPG / WEBP / GIF / BMP |
| Word → PDF | `.docx` 保留标题 / 段落 / 列表 / 表格 / 粗斜体 / 内嵌图（分页渲染） |
| 文本 → PDF | TXT / MD / CSV 等 |
| PDF 合并 | 已有 PDF 也可加入队列，按顺序合并 |
| 离线可用 | 依赖已 vendored 到 `web/vendor/`，本地静态服务即可断网使用 |
| 零后端 | 静态页面，任意静态托管 |

## 使用方法

1. 打开 `web/index.html`（本地服务或部署后的链接）。
2. 把文件拖进虚线区域，或点击选择。
3. 需要时拖动手柄调整顺序。
4. 勾选「全部合并成一个 PDF」（默认开）。
5. 点「生成 PDF」，浏览器会下载结果。

## 本地运行

```powershell
# 在项目根目录
python -m http.server 5173 --directory web
```

浏览器打开 <http://localhost:5173/>。

> 推荐用本地静态服务而不是 `file://` 直接打开，避免部分浏览器对本地脚本的限制。

### 重新拉取 vendor（可选）

```powershell
.\scratch\fetch-vendor.ps1
```

## 在线使用（打开链接就用）

部署后的页面（GitHub Pages）：

**https://ngiken.github.io/KenEasy-PDF-Converter/**

说明：

- 上面这个链接才是**转换器本身**
- `https://github.com/ngiken/KenEasy-PDF-Converter` 只是**源代码仓库**，不是工具页面
- 首次部署可能要等 1～2 分钟；若 404，稍后再刷新

本地同样可以：`python -m http.server 5173 --directory web` → http://localhost:5173/

## 部署（有链接就能用）

本仓库已配置 GitHub Actions：每次推送到 `main` 会自动把 `web/` 发布到 Pages。

也可把 `web/` 丢到任意静态托管（Cloudflare Pages / Netlify / Nginx / OSS）。没有服务端、没有 API、没有环境变量。

## 支持格式与限制

| 输入 | 行为 |
| --- | --- |
| 图片 | 按页放入 PDF；可选 A4 / Letter / 按图尺寸 |
| `.docx` | mammoth → HTML → 分页截图像素写入 PDF；标题/列表/表格/内嵌图尽量保留 |
| `.doc`（旧 Word） | **不支持**，请先另存为 `.docx` |
| 文本 | 按行分页写入 |
| `.pdf` | 原样并入合并结果（加密 PDF 可能失败） |

其它限制：

- 单文件建议 &lt; 40MB，队列最多 80 个
- Word 版式：**不是** 100% 打印引擎级还原；页眉页脚、文本框、浮动环绕、复杂分栏仍会简化
- Word 输出页是光栅化内容（清晰可读，可选中文字有限）
- 拉丁纯文本仍走矢量文字层

## 技术栈（离线 vendor）

| 库 | 用途 | 位置 |
| --- | --- | --- |
| SortableJS 1.15.6 | 队列拖拽排序 | `web/vendor/Sortable.min.js` |
| jsPDF 2.5.2 | 生成 PDF | `web/vendor/jspdf.umd.min.js` |
| pdf-lib 1.17.1 | 合并 PDF | `web/vendor/pdf-lib.min.js` |
| mammoth 1.9.0 | 读取 `.docx` → HTML | `web/vendor/mammoth.browser.min.js` |
| html2canvas 1.4.1 | Word HTML 分页渲染 | `web/vendor/html2canvas.min.js` |

许可说明见 [`web/vendor/NOTICE.txt`](./web/vendor/NOTICE.txt)。

## 目录结构

```text
02-KenEasy-PDF-Converter/
  web/
    index.html
    styles.css
    app.js
    vendor/          # 离线依赖
  scratch/
    fetch-vendor.ps1
  README.md
  README.en.md
  CLAUDE.md
  LICENSE
```

## 隐私

- 转换只在当前浏览器标签页内存中进行
- 不发送文件内容到后端（本项目也没有后端）
- 刷新或关闭页面后，队列中的文件引用会被释放

## License

MIT — 见 [LICENSE](./LICENSE)。
