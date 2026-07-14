<div align="center">

# KenEasy PDF Converter

**打开就能用的本地 PDF 工具** — 拖入 Word、图片、文本或已有 PDF，排序、转换、合并，一键下载。
文件只在你的浏览器里处理，**不上传、不安装、不注册**。

<br/>

### 👉 点这里直接使用

# [🚀 打开 PDF Converter（在线）](https://ngiken.github.io/KenEasy-PDF-Converter/)

**https://ngiken.github.io/KenEasy-PDF-Converter/**

> 上面这个才是**工具网页**。
> 你现在看的 GitHub 页面只是**源代码**，不能当工具点着用。

<br/>

[中文](README.md) · [English](README.en.md)

<br/>

<img alt="Use online" src="https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E4%BD%BF%E7%94%A8-ngiken.github.io-fb7299?style=for-the-badge">
<img alt="Version" src="https://img.shields.io/badge/version-0.3.0-0071e3?style=for-the-badge">
<img alt="Privacy" src="https://img.shields.io/badge/privacy-local%20only-00aeec?style=for-the-badge">
<img alt="Tests" src="https://img.shields.io/badge/e2e-30%2F30-27c499?style=for-the-badge">
<img alt="License" src="https://img.shields.io/badge/license-MIT-9aa4b2?style=for-the-badge">

<br/><br/>

<img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/hero-light.png" alt="KenEasy PDF Converter v0.3.0 浅色主界面" width="1200">

<sub>Apple-inspired 自适应界面 · 在线工具链接见上方</sub>

</div>

---

## 30 秒上手

1. 打开：**[在线工具](https://ngiken.github.io/KenEasy-PDF-Converter/)**
2. 拖入图片、`.docx`、TXT / MD / CSV 或已有 PDF（支持多选）
3. 选择「标准文档 / 图片铺满 / Letter 文档 / 分别输出」预设，或手动调整
4. 拖动 `⠿` 改变顺序；键盘用户可聚焦手柄后按 ↑ / ↓
5. 点 **生成 PDF** → 合并为一个 PDF，或按原文件名分别下载

就这么多。没有账号、没有安装包、没有服务器上传。

### 操作演示

<p align="center">
  <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/quick-tour.gif" alt="导入混合文件、选择版式、生成 PDF 的三步动画演示" width="960">
</p>

<p align="center"><strong>① 导入混合文件　→　② 选择版式与顺序　→　③ 本地生成 PDF</strong></p>

---

## 这是什么

KenEasy PDF Converter 是一个**纯前端、可离线**的混合文件转 PDF 工具：

| 你想做的事 | 它怎么帮你 |
| --- | --- |
| 多张截图合成 PDF | 拖入图片、排序，选择完整放入或铺满裁切 |
| Word 转 PDF | 读取 `.docx`，尽量保留标题、段落、列表、表格和内嵌图片 |
| 文本快速归档 | TXT / MD / CSV / LOG / JSON 直接生成分页 PDF |
| 合并已有 PDF | 把 PDF 与其它文件放入同一队列，按顺序合并 |
| 每个文件分别输出 | 使用「分别输出」预设，沿用原文件名下载 |
| 处理隐私文件 | 全程在当前浏览器标签页完成，不经过服务器 |

界面支持 **中文 / English** 和 **浅色 / 深色**外观，会记住选择；首次打开会跟随浏览器语言与系统外观。

---

## 界面预览

| 浅色工作区 | 深色工作区 |
| --- | --- |
| <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/workspace-light.png" alt="浅色输出设置与混合文件队列"> | <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/workspace-dark.png" alt="深色输出设置与混合文件队列"> |

<p align="center">
  <img src="https://raw.githubusercontent.com/ngiken/KenEasy-PDF-Converter/main/docs/screenshots/mobile-light.png" alt="KenEasy PDF Converter 手机界面" width="360">
</p>

<p align="center"><sub>桌面双栏、手机单栏；浅色／深色模式与设置都会记住。</sub></p>

---

## 支持什么

| 输入类型 | 格式与说明 |
| --- | --- |
| 图片 | PNG / JPG / JPEG / WEBP / GIF / BMP |
| Word | **`.docx`**；旧版 `.doc` 请先另存为 docx |
| 文本 | TXT / MD / Markdown / CSV / LOG / JSON |
| PDF | 直接参与排序和合并 |

| 输出选项 | 说明 |
| --- | --- |
| 页面尺寸 | A4 / Letter / 按图片尺寸（仅图片） |
| 图片适配 | 完整放入 / 铺满裁切 / 拉伸铺满 |
| 页边距 | 0–40 mm；对文档、文本和「完整放入」图片生效 |
| 生成方式 | 合并为一个 PDF / 每个输入分别生成 |
| 快捷预设 | 标准文档 / 图片铺满 / Letter 文档 / 分别输出；规则由配置数据驱动 |

---

## 隐私与离线

- 文件**不会上传**到任何服务器（项目没有后端）
- 转换只发生在当前浏览器标签页的内存里
- 运行时不请求 CDN；第三方依赖已固定在 `web/vendor/`
- Content Security Policy 禁止运行时网络连接
- 关闭页面后，队列中的本地文件引用会释放

---

## 本地使用（可选）

```powershell
# 在仓库根目录
python -m http.server 5173 --directory web
```

然后打开 <http://localhost:5173/>。

> 不推荐直接双击 `index.html`（`file://`）；浏览器可能限制脚本。使用本地静态服务最稳。

重新下载离线依赖（维护者可选）：

```powershell
.\scratch\fetch-vendor.ps1
```

---

## 已知限制

- `.docx` 转换以「尽量保留内容结构」为目标，不保证与 Word 打印排版像素级一致
- 页眉页脚、文本框、分栏、复杂浮动图片和特殊字体可能简化
- 中文文本为了跨设备显示会栅格化成行；拉丁文本仍使用 PDF 向量文字
- GIF 作为静态图片读取；动画不会进入 PDF
- 加密、权限受限或损坏的 PDF 可能无法合并
- 单文件上限 40 MB、每队列最多 80 个文件；超大任务仍受浏览器内存限制

---

## 分层架构

依赖方向保持单向：**配置 → 内容／引擎 → 应用编排 → DOM**。

```text
web/                    ← 可直接部署的静态站点
  index.html            ← 语义化界面外壳
  styles.css            ← 自适应浅色／深色设计系统
  config.js             ← 格式、限制、页面规则、预设、默认值
  i18n.js               ← 中英文内容与翻译服务
  pdf-engine.js         ← 检测、图片／DOCX／文本转换、PDF 合并、命名
  app.js                ← 状态、队列、设置持久化、工作流编排
  vendor/               ← 固定版本的离线依赖
docs/screenshots/       ← README 真实截图与演示动图
scratch/e2e/            ← Chromium 回归测试与截图生成工具
.github/workflows/      ← GitHub Pages 自动部署
```

| 库 | 用途 |
| --- | --- |
| jsPDF | 图片与文本生成 PDF |
| pdf-lib | 读取并合并 PDF 页 |
| Mammoth | `.docx` 转语义化 HTML |
| html2canvas | 将 Word HTML 分页渲染到 PDF |
| SortableJS | 队列拖动排序 |

第三方许可：[`web/vendor/NOTICE.txt`](./web/vendor/NOTICE.txt)

---

## 测试与截图

```powershell
cd scratch/e2e
npm ci
npm test                 # 真实 Chromium：期望 30/30 + ALL GREEN
npm run capture:readme   # 重建 README 截图与 GIF
```

回归测试会实际生成、下载并解析 PDF，覆盖：规则配置、混合队列、键盘排序、预设、持久化、双语、深浅色、合并页数、分别输出、错误格式、移动端溢出和零外部网络请求。

---

## 更新记录

### v0.3.0

- 以与 KenEasy Image Kit 一致的 Apple-inspired 自适应设计重做完整界面
- 增加深浅色外观、三步工作流、快捷预设、队列摘要、清晰进度与移动端布局
- 将单体脚本拆成配置层、国际化层、PDF 领域引擎和应用编排层
- 把格式、限制、页面尺寸、图片适配、预设和默认值全部数据化
- 增加设置持久化、键盘排序、CSP 离线约束与更安全的文件命名
- 增加真实浅色／深色／移动端截图和三步操作 GIF
- 新增 30 项真实 Chromium 回归检查，验证实际 PDF 签名与合并页数

### v0.2.4

- 修复图片「铺满裁切 / 拉伸铺满」仍出现白边的问题
- 修复 cover 模式的居中裁切比例
- 改善图片适配选项文案

### v0.2.3

- 增加中文 / English 界面切换和语言记忆
- 增加离线 Release 静态包

---

## 链接

| 用途 | 链接 |
| --- | --- |
| **立即使用（推荐）** | https://ngiken.github.io/KenEasy-PDF-Converter/ |
| 下载 Release | https://github.com/ngiken/KenEasy-PDF-Converter/releases/latest |
| 源代码 | https://github.com/ngiken/KenEasy-PDF-Converter |
| 问题反馈 | https://github.com/ngiken/KenEasy-PDF-Converter/issues |

---

## License

[MIT](LICENSE) © 2026
