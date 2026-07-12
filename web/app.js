/* KenEasy PDF Converter — browser-only, no uploads */
(function () {
  "use strict";

  const PAGE_SIZES = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 },
  };

  const MAX_FILES = 80;
  const MAX_FILE_BYTES = 40 * 1024 * 1024;

  /** @type {{id:string,file:File,kind:string,name:string,size:number,previewUrl?:string,error?:string}[]} */
  let items = [];
  let converting = false;
  let sortable = null;

  const $ = (id) => document.getElementById(id);
  const dropzone = $("dropzone");
  const fileInput = $("fileInput");
  const fileList = $("fileList");
  const emptyState = $("emptyState");
  const fileCount = $("fileCount");
  const btnClear = $("btnClear");
  const btnConvert = $("btnConvert");
  const statusPanel = $("statusPanel");
  const statusText = $("statusText");
  const statusPct = $("statusPct");
  const statusDetail = $("statusDetail");
  const progressBar = $("progressBar");

  function toast(msg, isError) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 3200);
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
    const name = (file.name || "").toLowerCase();
    const type = (file.type || "").toLowerCase();
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

  function addFiles(fileListLike) {
    const incoming = Array.from(fileListLike || []);
    if (!incoming.length) return;

    let added = 0;
    for (const file of incoming) {
      if (items.length >= MAX_FILES) {
        toast("一次最多 " + MAX_FILES + " 个文件", true);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast(file.name + " 超过 40MB，已跳过", true);
        continue;
      }
      const kind = detectKind(file);
      const item = {
        id: uid(),
        file: file,
        kind: kind,
        name: file.name,
        size: file.size,
      };
      if (!isConvertible(kind)) {
        item.error =
          kind === "unsupported-doc"
            ? "旧版 .doc 不支持，请另存为 .docx"
            : "不支持的格式";
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
      toast("已添加 " + added + " 个文件");
    }
  }

  function removeItem(id) {
    const idx = items.findIndex(function (x) {
      return x.id === id;
    });
    if (idx < 0) return;
    const it = items[idx];
    if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    items.splice(idx, 1);
    renderList();
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
      return isConvertible(x.kind) && !x.error;
    }).length;
    btnConvert.disabled = okCount === 0 || converting;

    fileList.innerHTML = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var li = document.createElement("li");
      li.className = "file-item" + (it.error ? " error" : "");
      li.dataset.id = it.id;

      var handle = document.createElement("div");
      handle.className = "handle";
      handle.title = "拖动排序";
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
      sub.textContent = it.error
        ? it.error
        : formatBytes(it.size) + " · " + (it.file.type || "未知类型");
      meta.appendChild(name);
      meta.appendChild(sub);

      var kind = document.createElement("span");
      kind.className = "kind " + (it.error ? "unknown" : it.kind);
      kind.textContent = kindLabel(it.kind);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.title = "移除";
      del.setAttribute("aria-label", "移除 " + it.name);
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
      li.appendChild(kind);
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
        reject(new Error("无法读取图片: " + file.name));
      };
      img.src = url;
    });
  }

  function imageToDataUrl(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    if (!canvas.width || !canvas.height) throw new Error("图片尺寸无效");
    var ctx = canvas.getContext("2d");
    // White underlay for transparent PNGs so PDF doesn't look black
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  function fitRect(srcW, srcH, boxW, boxH, mode) {
    if (mode === "stretch") {
      return { x: 0, y: 0, w: boxW, h: boxH };
    }
    var scale =
      mode === "cover"
        ? Math.max(boxW / srcW, boxH / srcH)
        : Math.min(boxW / srcW, boxH / srcH);
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
   * Build a PDF ArrayBuffer for one item using jsPDF.
   * PDF inputs are returned as raw bytes (already PDF).
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
      var dataUrl = imageToDataUrl(img);
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;

      var pageW;
      var pageH;
      if (pageSizeKey === "auto") {
        // ~96dpi CSS pixels → points
        var scale = 72 / 96;
        pageW = Math.max(iw * scale, 72);
        pageH = Math.max(ih * scale, 72);
        // Cap huge images
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

      var boxW = Math.max(pageW - margin * 2, 10);
      var boxH = Math.max(pageH - margin * 2, 10);
      var r = fitRect(iw, ih, boxW, boxH, options.imageFit);
      doc.addImage(dataUrl, "JPEG", margin + r.x, margin + r.y, r.w, r.h);
      return new Uint8Array(doc.output("arraybuffer"));
    }

    // text / docx → textual PDF
    var pageW2 = fixed.w;
    var pageH2 = fixed.h;
    var doc2 = new jsPDF({ unit: "pt", format: [pageW2, pageH2], compress: true });

    var text = "";
    if (item.kind === "text") {
      text = await readAsText(item.file);
    } else if (item.kind === "docx") {
      if (!window.mammoth) throw new Error("Mammoth 未加载");
      var result = await window.mammoth.extractRawText({
        arrayBuffer: await readAsArrayBuffer(item.file),
      });
      text = result.value || "";
    }

    text = (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!text.trim()) text = "（空文件）";

    await writeTextDocument(doc2, text, {
      pageW: pageW2,
      pageH: pageH2,
      margin: margin,
      title: item.name,
    });

    return new Uint8Array(doc2.output("arraybuffer"));
  }

  function hasNonLatin(str) {
    // Code points above Latin-1 → canvas path so CJK / emoji render via system fonts
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) return true;
    }
    return false;
  }

  /**
   * Write multi-page text. Uses jsPDF text for Latin; canvas→image lines for CJK.
   */
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

    // Canvas path for CJK / mixed scripts — keeps glyphs visible
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
        var cssH = lineHeight;
        canvas.width = Math.ceil(cssW * dpr);
        canvas.height = Math.ceil(cssH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
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
      return isConvertible(x.kind) && !x.error;
    });
    if (!queue.length) {
      toast("没有可转换的文件", true);
      return;
    }

    if (!window.jspdf || !window.PDFLib) {
      toast("核心库未加载，请检查网络后刷新", true);
      return;
    }

    converting = true;
    btnConvert.disabled = true;
    btnClear.disabled = true;
    setStatus(true, "正在转换…", 0, "");

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
          "处理中 " + (i + 1) + " / " + queue.length,
          (i / queue.length) * 90,
          it.name
        );
        var bytes = await itemToPdfBytes(it, options);
        pdfParts.push({ name: it.name, bytes: bytes });
        await new Promise(function (r) {
          setTimeout(r, 0);
        });
      }

      setStatus(true, "生成下载…", 95, "");

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
        setStatus(true, "完成", 100, "已下载 " + options.filename + ".pdf");
        toast("已下载 " + options.filename + ".pdf");
      } else {
        for (var j = 0; j < pdfParts.length; j++) {
          var p = pdfParts[j];
          var base = p.name.replace(/\.[^.]+$/, "") || "file-" + (j + 1);
          var fname = sanitizeFilename(base) + ".pdf";
          downloadBlob(new Blob([p.bytes], { type: "application/pdf" }), fname);
          setStatus(true, "下载中…", 95 + (j / pdfParts.length) * 5, fname);
          await new Promise(function (r) {
            setTimeout(r, 350);
          });
        }
        setStatus(true, "完成", 100, "已分别下载 " + pdfParts.length + " 个 PDF");
        toast("已分别下载 " + pdfParts.length + " 个 PDF");
      }
    } catch (err) {
      console.error(err);
      setStatus(true, "失败", 0, (err && err.message) || String(err));
      toast((err && err.message) || "转换失败", true);
    } finally {
      converting = false;
      renderList();
    }
  }

  // --- events ---
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

  renderList();
})();
