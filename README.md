<div align="center">

  <h1>KenEasy PDF Converter</h1>

  <p>
    浏览器内把 Word、图片、文本转成 PDF。拖入、排序、合并，文件不离开本机。
  </p>

  <p>
    中文
    ·
    <a href="README.en.md">English</a>
  </p>

  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-fb7299">
    <img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-27c499">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-00aeec">
  </p>

</div>

## 项目简介

KenEasy PDF Converter 是一个**纯前端**的在线 PDF 转换器。打开链接即可使用，无需安装、无需账号。文件在浏览器内存中处理，**不会上传到任何服务器**。

适合：把几张截图 / 一张 Word / 若干文本快速合成一个可分享的 PDF。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 拖入即用 | 拖拽或点选多个文件进入队列 |
| 排序 | 按住手柄拖动，决定合并后的页序 |
| 合并 / 分开 | 默认全部合成一个 PDF；也可关掉合并，逐个下载 |
| 图片 → PDF | PNG / JPG / WEBP / GIF / BMP |
| Word → PDF | `.docx` 提取文字写入 PDF（复杂版式会简化） |
| 文本 → PDF | TXT / MD / CSV 等 |
| PDF 合并 | 已有 PDF 也可加入队列，按顺序合并 |
| 零后端 | 静态页面，任意静态托管 / 本地打开 |

## 使用方法

1. 打开 `web/index.html`（本地或部署后的链接）。
2. 把文件拖进虚线区域，或点击选择。
3. 需要时拖动手柄调整顺序。
4. 勾选「全部合并成一个 PDF」（默认开）。
5. 点「生成 PDF」，浏览器会下载结果。

## 本地运行

**方式 A — 直接打开（最简单）**

双击 / 用浏览器打开：

```text
web/index.html
```

首次需要能访问 jsDelivr CDN（加载 jsPDF / pdf-lib / mammoth / Sortable）。

**方式 B — 本地静态服务（推荐调试）**

在本项目根目录：

```powershell
# Python 3
python -m http.server 5173 --directory web

# 或 Node（若已安装 npx）
npx --yes serve web -p 5173
```

然后打开 <http://localhost:5173/>。

## 部署（有链接就能用）

把 `web/` 目录发布到任意静态托管即可，例如：

- GitHub Pages（仓库 Settings → Pages，根目录选 `web` 或 `/docs`）
- Cloudflare Pages / Netlify / Vercel 静态站点
- 任意 Nginx / OSS 静态桶

没有服务端、没有 API、没有环境变量。

## 支持格式与限制

| 输入 | 行为 |
| --- | --- |
| 图片 | 按页放入 PDF；可选 A4 / Letter / 按图尺寸 |
| `.docx` | 提取纯文本写入 PDF；表格/复杂排版会丢失 |
| `.doc`（旧 Word） | **不支持**，请先另存为 `.docx` |
| 文本 | 按行分页写入 |
| `.pdf` | 原样并入合并结果（加密 PDF 可能失败） |

其它限制：

- 单文件建议 &lt; 40MB，队列最多 80 个
- 中文 Word/文本通过本机系统字体画到画布再嵌入，**可阅读**，但不是可编辑的文字层（拉丁字母文本仍为可选中文字）
- 复杂 Office 版式、嵌入字体、页眉页脚不会 1:1 还原

## 技术栈

| 库 | 用途 |
| --- | --- |
| [jsPDF](https://github.com/parallax/jsPDF) | 从图片 / 文本生成 PDF |
| [pdf-lib](https://github.com/Hopding/pdf-lib) | 合并多个 PDF |
| [mammoth](https://github.com/mwilliamson/mammoth.js) | 读取 `.docx` 文本 |
| [SortableJS](https://github.com/SortableJS/Sortable) | 队列拖拽排序 |

均通过 CDN 加载，页面本身无构建步骤。

## 目录结构

```text
02-KenEasy-PDF-Converter/
  web/
    index.html    # 入口页面
    styles.css
    app.js        # 转换 / 合并 / 排序逻辑
  scratch/        # 维护者临时脚本
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
