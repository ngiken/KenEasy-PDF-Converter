/* KenEasy PDF Converter — browser-only, offline-capable (vendored libs) */
(function () {
  "use strict";

  var PAGE_SIZES = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 },
  };

  var MAX_FILES = 80;
  var MAX_FILE_BYTES = 40 * 1024 * 1024;
  var PT_TO_CSS_PX = 96 / 72;
  var LANG_KEY = "keneasy-pdf-lang";

  var I18N = {
    zh: {
      pageTitle: "KenEasy PDF Converter — 打开就能用的 PDF 转换器",
      pageDesc:
        "打开链接即可使用：拖入 Word、图片、文本转 PDF，排序合并，文件不离开本机。无需安装。",
      tagline: "打开就能用 · 拖入 → 排序 → 一键 PDF · 文件不上传",
      badgeNoInstall: "无需安装",
      badgeLocal: "本地处理",
      dropzoneAria: "拖入或点击选择要转换的文件",
      dropTitle: "把文件拖到这里",
      dropHint: "或点击选择 · 支持多选",
      dropFormats:
        "图片 PNG / JPG / WEBP / GIF / BMP · Word DOCX · 文本 TXT / MD / CSV · PDF（合并排序）",
      optionsTitle: "选项",
      optMerge: "全部合并成<strong>一个 PDF</strong>（按下方顺序；每个文件从新页开始）",
      optKeepOrder: "按队列顺序输出（拖动手柄调整）",
      optPageSize: "页面尺寸",
      pageAuto: "按图片尺寸（仅图片）",
      optImageFit: "图片适配",
      fitContain: "完整放入（可留白，遵循页边距）",
      fitCover: "铺满裁切（无白边，可能裁切）",
      fitStretch: "拉伸铺满（无白边，可能变形）",
      optMargin: "页边距 (mm)",
      optFilename: "输出文件名",
      queueTitle: "文件队列",
      btnClear: "清空",
      btnConvert: "生成 PDF",
      queueHint:
        '按住手柄 <span class="handle-demo">⠿</span> 拖动可调整顺序。合并时从上到下就是 PDF 页序。',
      emptyState: "还没有文件。拖入后会出现在这里。",
      statusPreparing: "准备中…",
      tipsTitle: "说明",
      tip1: "转换在你的浏览器内存里完成，文件<strong>不会上传</strong>到任何服务器。",
      tip2: "Word 仅支持 <code>.docx</code>。会尽量保留标题、段落、列表、表格、粗斜体与内嵌图片。",
      tip3: "旧版 <code>.doc</code> 请先另存为 docx。页眉页脚、文本框、复杂浮动图仍会简化。",
      tip4: "已有 PDF 可加入队列，用于排序后与其它文件合并。",
      tip5: "依赖库已放在 <code>web/vendor/</code>，可用本地静态服务<strong>完全离线</strong>使用（推荐 <code>python -m http.server</code>）。",
      tip6: "图片适配：<strong>铺满裁切 / 拉伸铺满</strong>会铺满整页且无白边（忽略页边距）；只有「完整放入」会留白并使用页边距。",
      footerNote: "开源 · 纯前端 · 可离线",
      maxFiles: "一次最多 {n} 个文件",
      fileTooLarge: "{name} 超过 40MB，已跳过",
      unsupportedDoc: "旧版 .doc 不支持，请另存为 .docx",
      unsupportedFormat: "不支持的格式",
      addedFiles: "已添加 {n} 个文件",
      dragSort: "拖动排序",
      unknownType: "未知类型",
      remove: "移除",
      removeAria: "移除 {name}",
      cannotReadImage: "无法读取图片: {name}",
      invalidImageSize: "图片尺寸无效",
      html2canvasMissing: "html2canvas 未加载（离线包不完整）",
      emptyDocument: "（空文档）",
      mammothMissing: "Mammoth 未加载",
      emptyFile: "（空文件）",
      noConvertible: "没有可转换的文件",
      coreMissing: "核心库未加载，请确认 web/vendor 完整",
      converting: "正在转换…",
      processing: "处理中 {i} / {n}",
      generating: "生成下载…",
      done: "完成",
      downloaded: "已下载 {name}",
      downloading: "下载中…",
      downloadedMany: "已分别下载 {n} 个 PDF",
      failed: "失败",
      convertFailed: "转换失败",
    },
    en: {
      pageTitle: "KenEasy PDF Converter — open and convert to PDF",
      pageDesc:
        "Open the link and convert: drop Word, images, or text into PDF, reorder and merge. Files never leave your browser. No install.",
      tagline: "Open & go · drop → reorder → one PDF · no upload",
      badgeNoInstall: "No install",
      badgeLocal: "Local only",
      dropzoneAria: "Drop or click to choose files to convert",
      dropTitle: "Drop files here",
      dropHint: "or click to choose · multi-select supported",
      dropFormats:
        "Images PNG / JPG / WEBP / GIF / BMP · Word DOCX · Text TXT / MD / CSV · PDF (merge & reorder)",
      optionsTitle: "Options",
      optMerge:
        "Merge all into <strong>one PDF</strong> (queue order; each file starts on a new page)",
      optKeepOrder: "Output in queue order (drag the handle to reorder)",
      optPageSize: "Page size",
      pageAuto: "Fit image size (images only)",
      optImageFit: "Image fit",
      fitContain: "Fit inside (letterbox, uses margin)",
      fitCover: "Fill & crop (no border, may crop)",
      fitStretch: "Stretch to fill (no border, may distort)",
      optMargin: "Margin (mm)",
      optFilename: "Output filename",
      queueTitle: "File queue",
      btnClear: "Clear",
      btnConvert: "Generate PDF",
      queueHint:
        'Hold the handle <span class="handle-demo">⠿</span> to drag and reorder. Top to bottom becomes page order when merging.',
      emptyState: "No files yet. Drop some and they will show up here.",
      statusPreparing: "Preparing…",
      tipsTitle: "Notes",
      tip1: "Conversion runs in your browser memory. Files are <strong>never uploaded</strong> to any server.",
      tip2: "Word supports <code>.docx</code> only. Headings, paragraphs, lists, tables, emphasis, and embedded images are kept as much as possible.",
      tip3: "Save legacy <code>.doc</code> as docx first. Headers/footers, text boxes, and complex floating images are simplified.",
      tip4: "Existing PDFs can join the queue for reorder + merge with other files.",
      tip5: "Libraries live in <code>web/vendor/</code>. You can run fully <strong>offline</strong> with a local static server (recommended: <code>python -m http.server</code>).",
      tip6: "Image fit: <strong>Fill & crop / Stretch</strong> cover the full page with no white border (margin ignored). Only “Fit inside” letterboxes and uses margin.",
      footerNote: "Open source · frontend only · offline-ready",
      maxFiles: "Up to {n} files at a time",
      fileTooLarge: "{name} is over 40MB and was skipped",
      unsupportedDoc: "Legacy .doc is not supported — save as .docx",
      unsupportedFormat: "Unsupported format",
      addedFiles: "Added {n} file(s)",
      dragSort: "Drag to reorder",
      unknownType: "unknown type",
      remove: "Remove",
      removeAria: "Remove {name}",
      cannotReadImage: "Could not read image: {name}",
      invalidImageSize: "Invalid image size",
      html2canvasMissing: "html2canvas not loaded (offline bundle incomplete)",
      emptyDocument: "(empty document)",
      mammothMissing: "Mammoth not loaded",
      emptyFile: "(empty file)",
      noConvertible: "No convertible files",
      coreMissing: "Core libraries missing — check web/vendor",
      converting: "Converting…",
      processing: "Processing {i} / {n}",
      generating: "Preparing download…",
      done: "Done",
      downloaded: "Downloaded {name}",
      downloading: "Downloading…",
      downloadedMany: "Downloaded {n} PDF file(s)",
      failed: "Failed",
      convertFailed: "Conversion failed",
    },
  };

  /** @type {"zh"|"en"} */
  var lang = "zh";

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (_) {
      /* ignore */
    }
    var nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  function t(key, vars) {
    var dict = I18N[lang] || I18N.en;
    var s = dict[key];
    if (s == null) s = (I18N.en[key] != null ? I18N.en[key] : key);
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (_, k) {
        return vars[k] != null ? String(vars[k]) : "";
      });
    }
    return s;
  }

  function applyStaticI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t("pageTitle");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("pageDesc"));

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });

    var zhBtn = $("langZh");
    var enBtn = $("langEn");
    if (zhBtn) zhBtn.setAttribute("aria-pressed", lang === "zh" ? "true" : "false");
    if (enBtn) enBtn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
  }

  function setLang(next) {
    if (next !== "zh" && next !== "en") return;
    if (next === lang) return;
    lang = next;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (_) {
      /* ignore */
    }
    applyStaticI18n();
    renderList();
  }

  /** @type {{id:string,file:File,kind:string,name:string,size:number,previewUrl?:string,error?:string,errorKey?:string}[]} */
  var items = [];
  var converting = false;
  var sortable = null;

  var $ = function (id) {
    return document.getElementById(id);
  };
  var dropzone = $("dropzone");
  var fileInput = $("fileInput");
  var fileList = $("fileList");
  var emptyState = $("emptyState");
  var fileCount = $("fileCount");
  var btnClear = $("btnClear");
  var btnConvert = $("btnConvert");
  var statusPanel = $("statusPanel");
  var statusText = $("statusText");
  var statusPct = $("statusPct");
  var statusDetail = $("statusDetail");
  var progressBar = $("progressBar");

  function toast(msg, isError) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove("show");
    }, 3200);
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  function detectKind(file) {
    var name = (file.name || "").toLowerCase();
    var type = (file.type || "").toLowerCase();
    if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(name)) return "image";
    if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
    if (
      name.endsWith(".docx") ||
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "docx";
    }
    if (name.endsWith(".doc")) return "unsupported-doc";
    if (type.startsWith("text/") || /\.(txt|md|markdown|csv|log|json)$/i.test(name)) {
      return "text";
    }
    return "unknown";
  }

  function kindLabel(kind) {
    switch (kind) {
      case "image":
        return "IMG";
      case "docx":
        return "DOCX";
      case "text":
        return "TXT";
      case "pdf":
        return "PDF";
      case "unsupported-doc":
        return "DOC";
      default:
        return "?";
    }
  }

  function isConvertible(kind) {
    return kind === "image" || kind === "docx" || kind === "text" || kind === "pdf";
  }

  function itemErrorText(item) {
    if (item.errorKey === "unsupportedDoc") return t("unsupportedDoc");
    if (item.errorKey === "unsupportedFormat") return t("unsupportedFormat");
    return item.error || "";
  }

  function addFiles(fileListLike) {
    var incoming = Array.from(fileListLike || []);
    if (!incoming.length) return;

    var added = 0;
    for (var i = 0; i < incoming.length; i++) {
      var file = incoming[i];
      if (items.length >= MAX_FILES) {
        toast(t("maxFiles", { n: MAX_FILES }), true);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast(t("fileTooLarge", { name: file.name }), true);
        continue;
      }
      var kind = detectKind(file);
      var item = {
        id: uid(),
        file: file,
        kind: kind,
        name: file.name,
        size: file.size,
        isNew: true,
      };
      if (!isConvertible(kind)) {
        item.errorKey = kind === "unsupported-doc" ? "unsupportedDoc" : "unsupportedFormat";
        item.error = itemErrorText(item);
      }
      if (kind === "image") {
        try {
          item.previewUrl = URL.createObjectURL(file);
        } catch (_) {
          /* ignore */
        }
      }
      items.push(item);
      added++;
    }
    if (added) {
      renderList();
      toast(t("addedFiles", { n: added }));
    }
  }

  function removeItem(id) {
    var li = fileList.querySelector('[data-id="' + id + '"]');
    if (li) {
      li.classList.add("removing");
      var removed = false;
      var triggerRemove = function () {
        if (removed) return;
        removed = true;
        doRemove();
      };
      li.addEventListener("animationend", triggerRemove, { once: true });
      setTimeout(triggerRemove, 360);
    } else {
      doRemove();
    }

    function doRemove() {
      var idx = items.findIndex(function (x) {
        return x.id === id;
      });
      if (idx < 0) return;
      var it = items[idx];
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      items.splice(idx, 1);
      renderList();
    }
  }

  function clearAll() {
    for (var i = 0; i < items.length; i++) {
      if (items[i].previewUrl) URL.revokeObjectURL(items[i].previewUrl);
    }
    items = [];
    renderList();
    setStatus(false);
  }

  function syncOrderFromDom() {
    var ids = Array.from(fileList.children).map(function (li) {
      return li.dataset.id;
    });
    var map = new Map(
      items.map(function (x) {
        return [x.id, x];
      })
    );
    items = ids
      .map(function (id) {
        return map.get(id);
      })
      .filter(Boolean);
  }

  function renderList() {
    fileCount.textContent = String(items.length);
    var has = items.length > 0;
    emptyState.hidden = has;
    fileList.hidden = !has;
    btnClear.disabled = !has || converting;
    var okCount = items.filter(function (x) {
      return isConvertible(x.kind) && !x.errorKey;
    }).length;
    btnConvert.disabled = okCount === 0 || converting;

    fileList.innerHTML = "";
    var newIdx = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var li = document.createElement("li");
      li.className = "file-item" + (it.errorKey || it.error ? " error" : "");
      li.dataset.id = it.id;

      if (it.isNew) {
        li.classList.add("new-item");
        li.style.animationDelay = newIdx * 55 + "ms";
        newIdx++;
        delete it.isNew;
      }

      var handle = document.createElement("div");
      handle.className = "handle";
      handle.title = t("dragSort");
      handle.textContent = "⠿";

      var thumb = document.createElement("div");
      thumb.className = "thumb";
      if (it.previewUrl) {
        var img = document.createElement("img");
        img.src = it.previewUrl;
        img.alt = "";
        thumb.appendChild(img);
      } else {
        thumb.textContent = kindLabel(it.kind);
      }

      var meta = document.createElement("div");
      meta.className = "meta";
      var name = document.createElement("div");
      name.className = "name";
      name.textContent = it.name;
      name.title = it.name;
      var sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = it.errorKey
        ? itemErrorText(it)
        : formatBytes(it.size) + " · " + (it.file.type || t("unknownType"));
      meta.appendChild(name);
      meta.appendChild(sub);

      var kindEl = document.createElement("span");
      kindEl.className = "kind " + (it.errorKey || it.error ? "unknown" : it.kind);
      kindEl.textContent = kindLabel(it.kind);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.title = t("remove");
      del.setAttribute("aria-label", t("removeAria", { name: it.name }));
      del.textContent = "×";
      del.addEventListener(
        "click",
        (function (id) {
          return function () {
            removeItem(id);
          };
        })(it.id)
      );

      li.appendChild(handle);
      li.appendChild(thumb);
      li.appendChild(meta);
      li.appendChild(kindEl);
      li.appendChild(del);
      fileList.appendChild(li);
    }

    if (!sortable && window.Sortable) {
      sortable = Sortable.create(fileList, {
        handle: ".handle",
        animation: 150,
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        onEnd: syncOrderFromDom,
      });
    }
  }

  function setStatus(show, text, pct, detail) {
    statusPanel.hidden = !show;
    if (!show) {
      progressBar.style.width = "0%";
      return;
    }
    if (text != null) statusText.textContent = text;
    if (pct != null) {
      var p = Math.max(0, Math.min(100, Math.round(pct)));
      statusPct.textContent = p + "%";
      progressBar.style.width = p + "%";
    }
    if (detail != null) statusDetail.textContent = detail;
  }

  function mmToPt(mm) {
    return (mm * 72) / 25.4;
  }

  function readAsArrayBuffer(file) {
    return file.arrayBuffer();
  }

  function readAsText(file) {
    return file.text();
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error(t("cannotReadImage", { name: file.name })));
      };
      img.src = url;
    });
  }

  function imageToDataUrl(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    if (!canvas.width || !canvas.height) throw new Error(t("invalidImageSize"));
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  /**
   * Cover crop: take the largest centered source rect matching target aspect,
   * then rasterize. Drawing that bitmap to the full page box fills with no letterbox.
   */
  function imageToCoverDataUrl(img, boxAspect) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) throw new Error(t("invalidImageSize"));
    var aspect = boxAspect > 0 ? boxAspect : iw / ih;
    var srcAspect = iw / ih;
    var sx = 0;
    var sy = 0;
    var sw = iw;
    var sh = ih;
    if (srcAspect > aspect) {
      // wider than target — crop left/right
      sw = ih * aspect;
      sx = (iw - sw) / 2;
    } else {
      // taller than target — crop top/bottom
      sh = iw / aspect;
      sy = (ih - sh) / 2;
    }
    // Keep output resolution close to source crop, capped for memory
    var maxSide = 4096;
    var outW = Math.max(1, Math.round(sw));
    var outH = Math.max(1, Math.round(sh));
    if (outW > maxSide || outH > maxSide) {
      var s = maxSide / Math.max(outW, outH);
      outW = Math.max(1, Math.round(outW * s));
      outH = Math.max(1, Math.round(outH * s));
    }
    var canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  /** Contain (letterbox) placement inside a content box. */
  function fitContainRect(srcW, srcH, boxW, boxH) {
    var scale = Math.min(boxW / srcW, boxH / srcH);
    var w = srcW * scale;
    var h = srcH * scale;
    return {
      x: (boxW - w) / 2,
      y: (boxH - h) / 2,
      w: w,
      h: h,
    };
  }

  /**
   * Place an image on a PDF page.
   * - contain: keep aspect, may letterbox; respects margin
   * - cover: full-bleed crop to page (ignores margin so no white border)
   * - stretch: full-bleed stretch to page (ignores margin; may distort)
   */
  function addImageToPage(doc, img, pageW, pageH, margin, mode) {
    var fit = mode || "contain";
    if (fit === "cover" || fit === "stretch") {
      // Full page fill — no white edge from page margin
      var dataUrl =
        fit === "cover"
          ? imageToCoverDataUrl(img, pageW / pageH)
          : imageToDataUrl(img);
      doc.addImage(dataUrl, "JPEG", 0, 0, pageW, pageH);
      return;
    }
    // contain
    var boxW = Math.max(pageW - margin * 2, 10);
    var boxH = Math.max(pageH - margin * 2, 10);
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    var r = fitContainRect(iw, ih, boxW, boxH);
    doc.addImage(imageToDataUrl(img), "JPEG", margin + r.x, margin + r.y, r.w, r.h);
  }

  function waitForImages(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img"));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(function (img) {
        if (img.complete && img.naturalWidth) return Promise.resolve();
        return new Promise(function (resolve) {
          var done = function () {
            resolve();
          };
          img.onload = done;
          img.onerror = done;
          setTimeout(done, 8000);
        });
      })
    );
  }

  var DOCX_STYLE =
    "box-sizing:border-box;" +
    "margin:0;padding:0;" +
    'font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC","Segoe UI",sans-serif;' +
    "font-size:11pt;line-height:1.55;color:#111;background:#fff;" +
    "word-wrap:break-word;overflow-wrap:anywhere;";

  var DOCX_INNER_CSS =
    "h1{font-size:20pt;font-weight:700;margin:0 0 12px;line-height:1.3;color:#111}" +
    "h2{font-size:16pt;font-weight:700;margin:18px 0 10px;line-height:1.35;color:#111}" +
    "h3{font-size:13.5pt;font-weight:700;margin:14px 0 8px;line-height:1.4;color:#111}" +
    "h4,h5,h6{font-size:12pt;font-weight:700;margin:12px 0 6px;line-height:1.4;color:#111}" +
    "p{margin:0 0 10px;text-align:justify}" +
    "p:empty::before{content:'\\00a0'}" +
    "ul,ol{margin:0 0 10px;padding-left:1.4em}" +
    "li{margin:0 0 4px}" +
    "strong,b{font-weight:700}" +
    "em,i{font-style:italic}" +
    "u{text-decoration:underline}" +
    "a{color:#0b57d0;text-decoration:none}" +
    "table{border-collapse:collapse;width:100%;margin:0 0 12px;font-size:10.5pt}" +
    "th,td{border:1px solid #444;padding:6px 8px;vertical-align:top;text-align:left}" +
    "th{background:#f3f4f6;font-weight:700}" +
    "img{max-width:100%;height:auto;display:block;margin:8px 0}" +
    "blockquote{margin:0 0 10px;padding:6px 12px;border-left:3px solid #bbb;color:#333}" +
    "hr{border:none;border-top:1px solid #ccc;margin:14px 0}" +
    "pre,code{font-family:ui-monospace,Consolas,monospace;font-size:10pt}" +
    "pre{white-space:pre-wrap;background:#f7f7f8;border:1px solid #e5e7eb;padding:8px;margin:0 0 10px;border-radius:4px}";

  /**
   * Render HTML (from mammoth) into multipage PDF via html2canvas page slices.
   * Preserves headings, lists, tables, inline emphasis, and embedded images.
   */
  async function writeHtmlDocument(doc, html, opts) {
    if (!window.html2canvas) {
      throw new Error(t("html2canvasMissing"));
    }

    var pageW = opts.pageW;
    var pageH = opts.pageH;
    var margin = opts.margin;
    var contentWpt = Math.max(pageW - margin * 2, 40);
    var contentHpt = Math.max(pageH - margin * 2, 40);
    var contentWpx = Math.floor(contentWpt * PT_TO_CSS_PX);
    var contentHpx = Math.floor(contentHpt * PT_TO_CSS_PX);

    var host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:fixed;left:-100000px;top:0;width:" +
      contentWpx +
      "px;background:#fff;z-index:-1;pointer-events:none;overflow:visible;";

    var style = document.createElement("style");
    style.textContent =
      ".ke-docx-root{" +
      DOCX_STYLE +
      "width:" +
      contentWpx +
      "px;}" +
      DOCX_INNER_CSS.split("}")
        .filter(function (chunk) {
          return chunk.trim();
        })
        .map(function (chunk) {
          var parts = chunk.split("{");
          if (parts.length < 2) return "";
          var sel = parts[0].trim();
          var body = parts.slice(1).join("{");
          return (
            sel
              .split(",")
              .map(function (s) {
                return ".ke-docx-root " + s.trim();
              })
              .join(",") +
            "{" +
            body +
            "}"
          );
        })
        .join("");

    var root = document.createElement("div");
    root.className = "ke-docx-root";
    root.innerHTML = html && html.trim() ? html : "<p>" + t("emptyDocument") + "</p>";

    host.appendChild(style);
    host.appendChild(root);
    document.body.appendChild(host);

    try {
      await waitForImages(root);
      // layout settle
      await new Promise(function (r) {
        requestAnimationFrame(function () {
          requestAnimationFrame(r);
        });
      });

      var scale = Math.min(2, window.devicePixelRatio || 1.5);
      var fullCanvas = await window.html2canvas(root, {
        backgroundColor: "#ffffff",
        scale: scale,
        useCORS: true,
        logging: false,
        width: contentWpx,
        windowWidth: contentWpx,
      });

      var sliceH = Math.max(1, Math.floor(contentHpx * scale));
      var totalH = fullCanvas.height;
      var pageIndex = 0;

      for (var y = 0; y < totalH; y += sliceH) {
        var h = Math.min(sliceH, totalH - y);
        // Avoid tiny trailing blank pages (< 8 CSS px)
        if (h < 8 * scale && pageIndex > 0) break;

        var pageCanvas = document.createElement("canvas");
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = h;
        var ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          fullCanvas,
          0,
          y,
          fullCanvas.width,
          h,
          0,
          0,
          fullCanvas.width,
          h
        );

        var dataUrl = pageCanvas.toDataURL("image/jpeg", 0.93);
        if (pageIndex > 0) {
          doc.addPage([pageW, pageH]);
        }
        // Draw slice into content box; height scales if last partial page
        var drawH = (h / scale) * (72 / 96);
        doc.addImage(dataUrl, "JPEG", margin, margin, contentWpt, drawH);
        pageIndex++;

        // yield UI
        await new Promise(function (r) {
          setTimeout(r, 0);
        });
      }

      if (pageIndex === 0) {
        // empty canvas edge case
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text("(empty)", margin, margin + 14);
      }
    } finally {
      if (host.parentNode) host.parentNode.removeChild(host);
    }
  }

  /**
   * Build a PDF for one queue item.
   */
  async function itemToPdfBytes(item, options) {
    if (item.kind === "pdf") {
      return new Uint8Array(await readAsArrayBuffer(item.file));
    }

    var jsPDF = window.jspdf.jsPDF;
    var margin = mmToPt(options.marginMm);
    var pageSizeKey = options.pageSize;
    var fixed = PAGE_SIZES[pageSizeKey] || PAGE_SIZES.a4;

    if (item.kind === "image") {
      var img = await loadImage(item.file);
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;

      var pageW;
      var pageH;
      if (pageSizeKey === "auto") {
        // Page matches image aspect so contain/cover/stretch all fill naturally
        var scale = 72 / 96;
        pageW = Math.max(iw * scale, 72);
        pageH = Math.max(ih * scale, 72);
        var maxSide = 2000;
        if (pageW > maxSide || pageH > maxSide) {
          var s = maxSide / Math.max(pageW, pageH);
          pageW *= s;
          pageH *= s;
        }
      } else {
        pageW = fixed.w;
        pageH = fixed.h;
      }

      var doc = new jsPDF({
        unit: "pt",
        format: [pageW, pageH],
        compress: true,
      });

      addImageToPage(doc, img, pageW, pageH, margin, options.imageFit);
      return new Uint8Array(doc.output("arraybuffer"));
    }

    var pageW2 = fixed.w;
    var pageH2 = fixed.h;
    var doc2 = new jsPDF({ unit: "pt", format: [pageW2, pageH2], compress: true });

    if (item.kind === "docx") {
      if (!window.mammoth) throw new Error(t("mammothMissing"));
      var ab = await readAsArrayBuffer(item.file);
      var result = await window.mammoth.convertToHtml(
        { arrayBuffer: ab },
        {
          convertImage: window.mammoth.images.imgElement(function (image) {
            return image.read("base64").then(function (imageBuffer) {
              return {
                src: "data:" + image.contentType + ";base64," + imageBuffer,
              };
            });
          }),
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => h2:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "r[style-name='Strong'] => strong",
          ],
        }
      );
      var html = result.value || "";
      if (result.messages && result.messages.length) {
        console.info("mammoth:", result.messages);
      }
      await writeHtmlDocument(doc2, html, {
        pageW: pageW2,
        pageH: pageH2,
        margin: margin,
      });
      return new Uint8Array(doc2.output("arraybuffer"));
    }

    // plain text
    var text = await readAsText(item.file);
    text = (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!text.trim()) text = t("emptyFile");

    await writeTextDocument(doc2, text, {
      pageW: pageW2,
      pageH: pageH2,
      margin: margin,
    });

    return new Uint8Array(doc2.output("arraybuffer"));
  }

  function hasNonLatin(str) {
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) return true;
    }
    return false;
  }

  async function writeTextDocument(doc, text, opts) {
    var pageW = opts.pageW;
    var pageH = opts.pageH;
    var margin = opts.margin;
    var maxW = pageW - margin * 2;
    var lineHeight = 16;
    var fontSize = 11;
    var y = margin;

    var paragraphs = text.split("\n");
    var useCanvas = hasNonLatin(text);

    function newPageIfNeeded(need) {
      if (y + need > pageH - margin) {
        doc.addPage([pageW, pageH]);
        y = margin;
      }
    }

    if (!useCanvas) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      for (var pi = 0; pi < paragraphs.length; pi++) {
        var para = paragraphs[pi];
        var lines = doc.splitTextToSize(para.length ? para : " ", maxW);
        for (var li = 0; li < lines.length; li++) {
          newPageIfNeeded(lineHeight);
          doc.text(lines[li], margin, y + fontSize);
          y += lineHeight;
        }
      }
      return;
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var cssW = Math.floor(maxW);
    var padY = 2;
    var fontSpec =
      fontSize + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
    ctx.font = fontSpec;

    function wrapLine(str) {
      if (!str) return [" "];
      var out = [];
      var cur = "";
      var chars = Array.from(str);
      for (var ci = 0; ci < chars.length; ci++) {
        var c = chars[ci];
        var test = cur + c;
        if (ctx.measureText(test).width > cssW && cur) {
          out.push(cur);
          cur = c;
        } else {
          cur = test;
        }
      }
      if (cur) out.push(cur);
      return out.length ? out : [" "];
    }

    for (var p = 0; p < paragraphs.length; p++) {
      var plines = wrapLine(paragraphs[p]);
      for (var l = 0; l < plines.length; l++) {
        var line = plines[l];
        newPageIfNeeded(lineHeight);
        canvas.width = Math.ceil(cssW * dpr);
        canvas.height = Math.ceil(lineHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, lineHeight);
        ctx.font = fontSpec;
        ctx.fillStyle = "#111111";
        ctx.textBaseline = "top";
        ctx.fillText(line, 0, padY);
        var dataUrl = canvas.toDataURL("image/png");
        doc.addImage(dataUrl, "PNG", margin, y, maxW, lineHeight);
        y += lineHeight;
      }
    }
  }

  async function mergePdfBytesList(list) {
    var PDFDocument = PDFLib.PDFDocument;
    var out = await PDFDocument.create();
    for (var i = 0; i < list.length; i++) {
      var src = await PDFDocument.load(list[i], { ignoreEncryption: true });
      var pages = await out.copyPages(src, src.getPageIndices());
      for (var j = 0; j < pages.length; j++) {
        out.addPage(pages[j]);
      }
    }
    return out.save();
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
  }

  function sanitizeFilename(name) {
    var base = (name || "converted").trim() || "converted";
    return base.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);
  }

  async function convertAll() {
    if (converting) return;
    syncOrderFromDom();
    var queue = items.filter(function (x) {
      return isConvertible(x.kind) && !x.errorKey;
    });
    if (!queue.length) {
      toast(t("noConvertible"), true);
      return;
    }

    if (!window.jspdf || !window.PDFLib) {
      toast(t("coreMissing"), true);
      return;
    }

    converting = true;
    btnConvert.disabled = true;
    btnClear.disabled = true;
    setStatus(true, t("converting"), 0, "");

    var options = {
      merge: $("optMerge").checked,
      pageSize: $("optPageSize").value,
      imageFit: $("optImageFit").value,
      marginMm: Number($("optMargin").value) || 0,
      filename: sanitizeFilename($("optFilename").value),
    };

    try {
      var pdfParts = [];
      for (var i = 0; i < queue.length; i++) {
        var it = queue[i];
        setStatus(
          true,
          t("processing", { i: i + 1, n: queue.length }),
          (i / queue.length) * 90,
          it.name
        );
        var bytes = await itemToPdfBytes(it, options);
        pdfParts.push({ name: it.name, bytes: bytes });
        await new Promise(function (r) {
          setTimeout(r, 0);
        });
      }

      setStatus(true, t("generating"), 95, "");

      if (options.merge || pdfParts.length === 1) {
        var finalBytes;
        if (pdfParts.length === 1) {
          finalBytes = pdfParts[0].bytes;
        } else {
          finalBytes = await mergePdfBytesList(
            pdfParts.map(function (p) {
              return p.bytes;
            })
          );
        }
        var blob = new Blob([finalBytes], { type: "application/pdf" });
        downloadBlob(blob, options.filename + ".pdf");
        setStatus(true, t("done"), 100, t("downloaded", { name: options.filename + ".pdf" }));
        toast(t("downloaded", { name: options.filename + ".pdf" }));
      } else {
        for (var j = 0; j < pdfParts.length; j++) {
          var p = pdfParts[j];
          var base = p.name.replace(/\.[^.]+$/, "") || "file-" + (j + 1);
          var fname = sanitizeFilename(base) + ".pdf";
          downloadBlob(new Blob([p.bytes], { type: "application/pdf" }), fname);
          setStatus(true, t("downloading"), 95 + (j / pdfParts.length) * 5, fname);
          await new Promise(function (r) {
            setTimeout(r, 350);
          });
        }
        setStatus(true, t("done"), 100, t("downloadedMany", { n: pdfParts.length }));
        toast(t("downloadedMany", { n: pdfParts.length }));
      }
    } catch (err) {
      console.error(err);
      setStatus(true, t("failed"), 0, (err && err.message) || String(err));
      toast((err && err.message) || t("convertFailed"), true);
    } finally {
      converting = false;
      renderList();
    }
  }

  dropzone.addEventListener("click", function () {
    fileInput.click();
  });
  dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", function () {
    addFiles(fileInput.files);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (ev === "drop") {
        dropzone.classList.remove("dragover");
        addFiles(e.dataTransfer.files);
      } else if (e.target === dropzone) {
        dropzone.classList.remove("dragover");
      }
    });
  });

  window.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  window.addEventListener("drop", function (e) {
    e.preventDefault();
  });

  btnClear.addEventListener("click", clearAll);
  btnConvert.addEventListener("click", convertAll);

  var langZh = $("langZh");
  var langEn = $("langEn");
  if (langZh) {
    langZh.addEventListener("click", function () {
      setLang("zh");
    });
  }
  if (langEn) {
    langEn.addEventListener("click", function () {
      setLang("en");
    });
  }

  lang = detectLang();
  applyStaticI18n();
  renderList();
})();
