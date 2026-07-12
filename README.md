<div align="center">

# KenEasy PDF Converter

**打开就能用的 PDF 转换器** — 拖入 Word / 图片 / 文本，排序后一键合并成 PDF。  
文件只在你浏览器里处理，**不上传、不安装、不注册**。

<br/>

### 👉 点这里直接使用

# [🚀 打开转换器（在线）](https://ngiken.github.io/KenEasy-PDF-Converter/)

**https://ngiken.github.io/KenEasy-PDF-Converter/**

> 上面这个才是**工具网页**。  
> 你现在看的 GitHub 页面只是**源代码**，不能当转换器点着用。

<br/>

[中文](README.md) · [English](README.en.md)

<br/>

<img alt="Use online" src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E4%BD%BF%E7%94%A8-ngiken.github.io-fb7299?style=for-the-badge">
<img alt="Version" src="https://img.shields.io/badge/version-0.2.4-27c499?style=for-the-badge">
<img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-00aeec?style=for-the-badge">
<img alt="License" src="https://img.shields.io/badge/license-MIT-9aa4b2?style=for-the-badge">

</div>

---

## 30 秒上手

1. 打开：**[在线转换器](https://ngiken.github.io/KenEasy-PDF-Converter/)**
2. 把文件拖进页面（支持多选）
3. 按住 `⠿` 拖动调整顺序（可选）
4. 确认「全部合并成一个 PDF」（默认已开）
5. 点 **生成 PDF** → 自动下载

就这么多。没有账号、没有安装包、没有服务器上传。

---

## 这是什么

KenEasy PDF Converter 是一个**纯前端**小工具：

| 你想做的事 | 它怎么帮你 |
| --- | --- |
| 几张截图合成一份 PDF | 拖入图片 → 排序 → 合并下载 |
| Word 转 PDF | 拖入 `.docx`（尽量保留标题、列表、表格、图片） |
| 文本 / Markdown 转 PDF | 拖入 TXT / MD / CSV |
| 多个 PDF 拼在一起 | 把 PDF 也丢进队列，按顺序合并 |
| 隐私敏感文件 | 全程在本机浏览器完成，不经过服务器 |

界面支持 **中文 / English** 一键切换（右上角），会记住你的选择；首次打开按浏览器语言自动选择。

适合：交材料、发截图合集、临时把杂文件收成一个 PDF。

---

## 支持什么

| 类型 | 格式 | 说明 |
| --- | --- | --- |
| 图片 | PNG / JPG / WEBP / GIF / BMP | 可调 A4、Letter、按图尺寸 |
| Word | **`.docx`** | 旧版 `.doc` 请先另存为 docx |
| 文本 | TXT / MD / CSV 等 | 自动分页 |
| PDF | `.pdf` | 可与其它文件一起排序合并 |

**选项：** 合并 / 分开下载、页面尺寸、图片适配、页边距、输出文件名。

---

## 隐私说明

- 文件**不会上传**到任何服务器（本项目也没有后端）
- 转换只在当前浏览器标签页的内存里进行
- 关掉页面后，队列里的文件引用会被释放

---

## 本地使用（可选）

不想走在线链接时，可在本机跑同样的页面（依赖已打包在 `web/vendor/`，可离线）：

```powershell
# 在仓库根目录
python -m http.server 5173 --directory web
```

然后打开 <http://localhost:5173/>。

> 不推荐直接双击 `index.html`（`file://`），部分浏览器会限制脚本；用上面的本地服务最稳。

重新下载离线依赖（可选）：

```powershell
.\scratch\fetch-vendor.ps1
```

---

## 已知限制

- 复杂 Word 版式会简化（页眉页脚、文本框、浮动环绕等）
- Word 页为清晰可读的渲染结果，不是印刷机级 1:1
- 建议单文件 &lt; 40MB，队列最多约 80 个
- 加密 PDF 可能无法合并

---

## 技术与目录

纯静态站点，推送到 `main` 后由 GitHub Actions 自动发布 Pages。

| 库 | 用途 |
| --- | --- |
| SortableJS | 队列拖拽 |
| jsPDF | 生成 PDF |
| pdf-lib | 合并 PDF |
| mammoth | 读取 `.docx` |
| html2canvas | Word 版式分页渲染 |

```text
web/                 ← 网站本体（也是 Pages 发布内容）
  index.html
  styles.css
  app.js
  vendor/            ← 离线依赖
.github/workflows/   ← 自动部署
scratch/             ← 维护脚本
```

第三方许可：[`web/vendor/NOTICE.txt`](./web/vendor/NOTICE.txt)

---

## 更新说明

### v0.2.4
- **修复图片适配白边**：选择「铺满裁切 / 拉伸铺满」时真正整页铺满，不再被页边距挤出白边
- **修复铺满裁切**：按页面比例居中裁切源图，避免只放大却仍留白、或错误压扁
- **文案更清楚**：选项说明区分「完整放入（可留白）」与「无白边」两种铺满模式
### v0.2.3
- **中英双语界面**：右上角一键切换，记住选择；首次按浏览器语言
- **体验优化**：文案与提示更完整，语言切换后队列/错误信息同步更新
- **离线包 Release**：GitHub Releases 提供可本地下载的静态包

---

## 链接一览

| 用途 | 链接 |
| --- | --- |
| **立即使用（推荐）** | https://ngiken.github.io/KenEasy-PDF-Converter/ |
| **本地下载（Release）** | https://github.com/ngiken/KenEasy-PDF-Converter/releases/latest |
| 源代码仓库 | https://github.com/ngiken/KenEasy-PDF-Converter |
| 问题反馈 | https://github.com/ngiken/KenEasy-PDF-Converter/issues |

---

## License

MIT — 见 [LICENSE](./LICENSE)。
