/* KenEasy PDF Converter — domain layer for validation, rendering, merging, and naming. */
(function (global) {
  "use strict";

  function createEngine(config, translate) {
    var t = typeof translate === "function" ? translate : function (key) { return key; };
    var PT_TO_CSS_PX = 96 / 72;

    function extensionFromName(name) {
      var match = String(name || "").toLowerCase().match(/\.([^.]+)$/);
      return match ? match[1] : "";
    }

    function formatBytes(bytes) {
      var value = Number(bytes) || 0;
      if (value < 1024) return value + " B";
      if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
      return (value / (1024 * 1024)).toFixed(1) + " MB";
    }

    function detectKind(file) {
      var extension = extensionFromName(file && file.name);
      var mime = String(file && file.type || "").toLowerCase();
      for (var i = 0; i < config.input.rules.length; i++) {
        var extensionRule = config.input.rules[i];
        if (extensionRule.extensions && extensionRule.extensions.indexOf(extension) >= 0) return extensionRule.kind;
      }
      for (var j = 0; j < config.input.rules.length; j++) {
        var mimeRule = config.input.rules[j];
        if (mimeRule.mimeTypes && mimeRule.mimeTypes.indexOf(mime) >= 0) return mimeRule.kind;
        if (mimeRule.mimePrefixes && mimeRule.mimePrefixes.some(function (prefix) { return mime.indexOf(prefix) === 0; })) return mimeRule.kind;
      }
      return "unknown";
    }

    function kindRule(kind) {
      return config.kinds[kind] || config.kinds.unknown;
    }

    function kindLabel(kind) {
      return kindRule(kind).label;
    }

    function isConvertible(kind) {
      return !!kindRule(kind).convertible;
    }

    function errorKeyForKind(kind) {
      return kindRule(kind).errorKey || "unsupportedFormat";
    }

    function sanitizeFilename(name) {
      var fallback = config.defaults.filename || "converted";
      var base = String(name || fallback).trim() || fallback;
      return base.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").slice(0, config.limits.maxFilenameLength);
    }

    function baseName(name) {
      return String(name || "").replace(/\.[^.]+$/, "") || "file";
    }

    function separateOutputName(item, index, usedNames) {
      var root = sanitizeFilename(baseName(item && item.name) || "file-" + (index + 1));
      var candidate = root + ".pdf";
      var suffix = 1;
      while (usedNames && usedNames[candidate.toLowerCase()]) {
        suffix += 1;
        candidate = root + "-" + suffix + ".pdf";
      }
      if (usedNames) usedNames[candidate.toLowerCase()] = true;
      return candidate;
    }

    function pageRule(value) {
      var rules = config.pageSizes;
      for (var i = 0; i < rules.length; i++) if (rules[i].value === value) return rules[i];
      return rules[0];
    }

    function mmToPt(mm) {
      return (mm * 72) / 25.4;
    }

    function loadImage(file) {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(file);
        var image = new Image();
        image.onload = function () {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = function () {
          URL.revokeObjectURL(url);
          reject(new Error(t("cannotReadImage", { name: file.name })));
        };
        image.src = url;
      });
    }

    function imageToDataUrl(image) {
      var canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      if (!canvas.width || !canvas.height) throw new Error(t("invalidImageSize"));
      var longest = Math.max(canvas.width, canvas.height);
      if (longest > config.limits.maxRasterEdge) {
        var scale = config.limits.maxRasterEdge / longest;
        canvas.width = Math.max(1, Math.round(canvas.width * scale));
        canvas.height = Math.max(1, Math.round(canvas.height * scale));
      }
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    function imageToCoverDataUrl(image, boxAspect) {
      var width = image.naturalWidth || image.width;
      var height = image.naturalHeight || image.height;
      if (!width || !height) throw new Error(t("invalidImageSize"));
      var aspect = boxAspect > 0 ? boxAspect : width / height;
      var sourceAspect = width / height;
      var sourceX = 0;
      var sourceY = 0;
      var sourceWidth = width;
      var sourceHeight = height;
      if (sourceAspect > aspect) {
        sourceWidth = height * aspect;
        sourceX = (width - sourceWidth) / 2;
      } else {
        sourceHeight = width / aspect;
        sourceY = (height - sourceHeight) / 2;
      }
      var outputWidth = Math.max(1, Math.round(sourceWidth));
      var outputHeight = Math.max(1, Math.round(sourceHeight));
      var longest = Math.max(outputWidth, outputHeight);
      if (longest > config.limits.maxRasterEdge) {
        var scale = config.limits.maxRasterEdge / longest;
        outputWidth = Math.max(1, Math.round(outputWidth * scale));
        outputHeight = Math.max(1, Math.round(outputHeight * scale));
      }
      var canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      var context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    function containRect(sourceWidth, sourceHeight, boxWidth, boxHeight) {
      var scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
      var width = sourceWidth * scale;
      var height = sourceHeight * scale;
      return { x: (boxWidth - width) / 2, y: (boxHeight - height) / 2, width: width, height: height };
    }

    function addImageToPage(documentPdf, image, pageWidth, pageHeight, margin, mode) {
      if (mode === "cover" || mode === "stretch") {
        var fullBleed = mode === "cover" ? imageToCoverDataUrl(image, pageWidth / pageHeight) : imageToDataUrl(image);
        documentPdf.addImage(fullBleed, "JPEG", 0, 0, pageWidth, pageHeight);
        return;
      }
      var boxWidth = Math.max(pageWidth - margin * 2, 10);
      var boxHeight = Math.max(pageHeight - margin * 2, 10);
      var width = image.naturalWidth || image.width;
      var height = image.naturalHeight || image.height;
      var rectangle = containRect(width, height, boxWidth, boxHeight);
      documentPdf.addImage(imageToDataUrl(image), "JPEG", margin + rectangle.x, margin + rectangle.y, rectangle.width, rectangle.height);
    }

    function waitForImages(root) {
      var images = Array.prototype.slice.call(root.querySelectorAll("img"));
      if (!images.length) return Promise.resolve();
      return Promise.all(images.map(function (image) {
        if (image.complete && image.naturalWidth) return Promise.resolve();
        return new Promise(function (resolve) {
          var done = function () { resolve(); };
          image.onload = done;
          image.onerror = done;
          setTimeout(done, 8000);
        });
      }));
    }

    var DOCX_STYLE = "box-sizing:border-box;margin:0;padding:0;" +
      'font-family:"Microsoft YaHei","PingFang SC","Noto Sans SC","Segoe UI",sans-serif;' +
      "font-size:11pt;line-height:1.55;color:#111;background:#fff;word-wrap:break-word;overflow-wrap:anywhere;";
    var DOCX_RULES = [
      ["h1", "font-size:20pt;font-weight:700;margin:0 0 12px;line-height:1.3;color:#111"],
      ["h2", "font-size:16pt;font-weight:700;margin:18px 0 10px;line-height:1.35;color:#111"],
      ["h3", "font-size:13.5pt;font-weight:700;margin:14px 0 8px;line-height:1.4;color:#111"],
      ["h4,h5,h6", "font-size:12pt;font-weight:700;margin:12px 0 6px;line-height:1.4;color:#111"],
      ["p", "margin:0 0 10px;text-align:justify"], ["p:empty::before", "content:'\\00a0'"],
      ["ul,ol", "margin:0 0 10px;padding-left:1.4em"], ["li", "margin:0 0 4px"],
      ["strong,b", "font-weight:700"], ["em,i", "font-style:italic"], ["u", "text-decoration:underline"],
      ["a", "color:#0b57d0;text-decoration:none"],
      ["table", "border-collapse:collapse;width:100%;margin:0 0 12px;font-size:10.5pt"],
      ["th,td", "border:1px solid #444;padding:6px 8px;vertical-align:top;text-align:left"],
      ["th", "background:#f3f4f6;font-weight:700"], ["img", "max-width:100%;height:auto;display:block;margin:8px 0"],
      ["blockquote", "margin:0 0 10px;padding:6px 12px;border-left:3px solid #bbb;color:#333"],
      ["hr", "border:none;border-top:1px solid #ccc;margin:14px 0"],
      ["pre,code", "font-family:ui-monospace,Consolas,monospace;font-size:10pt"],
      ["pre", "white-space:pre-wrap;background:#f7f7f8;border:1px solid #e5e7eb;padding:8px;margin:0 0 10px;border-radius:4px"],
    ];

    async function writeHtmlDocument(documentPdf, html, options) {
      if (!global.html2canvas) throw new Error(t("html2canvasMissing"));
      var pageWidth = options.pageWidth;
      var pageHeight = options.pageHeight;
      var margin = options.margin;
      var contentWidthPoints = Math.max(pageWidth - margin * 2, 40);
      var contentHeightPoints = Math.max(pageHeight - margin * 2, 40);
      var contentWidthPixels = Math.floor(contentWidthPoints * PT_TO_CSS_PX);
      var contentHeightPixels = Math.floor(contentHeightPoints * PT_TO_CSS_PX);
      var host = document.createElement("div");
      host.setAttribute("aria-hidden", "true");
      host.style.cssText = "position:fixed;left:-100000px;top:0;width:" + contentWidthPixels + "px;background:#fff;z-index:-1;pointer-events:none;overflow:visible;";
      var style = document.createElement("style");
      style.textContent = ".ke-docx-root{" + DOCX_STYLE + "width:" + contentWidthPixels + "px;}" + DOCX_RULES.map(function (rule) {
        return rule[0].split(",").map(function (selector) { return ".ke-docx-root " + selector.trim(); }).join(",") + "{" + rule[1] + "}";
      }).join("");
      var root = document.createElement("div");
      root.className = "ke-docx-root";
      root.innerHTML = html && html.trim() ? html : "<p>" + t("emptyDocument") + "</p>";
      host.appendChild(style);
      host.appendChild(root);
      document.body.appendChild(host);
      try {
        await waitForImages(root);
        await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
        var scale = Math.min(2, global.devicePixelRatio || 1.5);
        var fullCanvas = await global.html2canvas(root, {
          backgroundColor: "#ffffff", scale: scale, useCORS: true, logging: false,
          width: contentWidthPixels, windowWidth: contentWidthPixels,
        });
        var sliceHeight = Math.max(1, Math.floor(contentHeightPixels * scale));
        var pageIndex = 0;
        for (var y = 0; y < fullCanvas.height; y += sliceHeight) {
          var height = Math.min(sliceHeight, fullCanvas.height - y);
          if (height < 8 * scale && pageIndex > 0) break;
          var pageCanvas = document.createElement("canvas");
          pageCanvas.width = fullCanvas.width;
          pageCanvas.height = height;
          var context = pageCanvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          context.drawImage(fullCanvas, 0, y, fullCanvas.width, height, 0, 0, fullCanvas.width, height);
          if (pageIndex > 0) documentPdf.addPage([pageWidth, pageHeight]);
          var drawHeight = (height / scale) * (72 / 96);
          documentPdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.93), "JPEG", margin, margin, contentWidthPoints, drawHeight);
          pageIndex += 1;
          await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        if (pageIndex === 0) {
          documentPdf.setFont("helvetica", "normal");
          documentPdf.setFontSize(12);
          documentPdf.text(t("emptyDocument"), margin, margin + 14);
        }
      } finally {
        if (host.parentNode) host.parentNode.removeChild(host);
      }
    }

    function hasNonLatin(text) {
      for (var i = 0; i < text.length; i++) if (text.charCodeAt(i) > 255) return true;
      return false;
    }

    async function writeTextDocument(documentPdf, text, options) {
      var pageWidth = options.pageWidth;
      var pageHeight = options.pageHeight;
      var margin = options.margin;
      var maxWidth = Math.max(pageWidth - margin * 2, 40);
      var lineHeight = 16;
      var fontSize = 11;
      var y = margin;
      var paragraphs = text.split("\n");
      function ensurePage(required) {
        if (y + required > pageHeight - margin) {
          documentPdf.addPage([pageWidth, pageHeight]);
          y = margin;
        }
      }
      if (!hasNonLatin(text)) {
        documentPdf.setFont("helvetica", "normal");
        documentPdf.setFontSize(fontSize);
        paragraphs.forEach(function (paragraph) {
          var lines = documentPdf.splitTextToSize(paragraph.length ? paragraph : " ", maxWidth);
          lines.forEach(function (line) {
            ensurePage(lineHeight);
            documentPdf.text(line, margin, y + fontSize);
            y += lineHeight;
          });
        });
        return;
      }
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      var cssWidth = Math.floor(maxWidth);
      var font = fontSize + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
      function wrapLine(value) {
        if (!value) return [" "];
        var output = [];
        var current = "";
        Array.from(value).forEach(function (character) {
          var test = current + character;
          if (context.measureText(test).width > cssWidth && current) {
            output.push(current);
            current = character;
          } else current = test;
        });
        if (current) output.push(current);
        return output.length ? output : [" "];
      }
      context.font = font;
      paragraphs.forEach(function (paragraph) {
        wrapLine(paragraph).forEach(function (line) {
          ensurePage(lineHeight);
          canvas.width = Math.ceil(cssWidth * dpr);
          canvas.height = Math.ceil(lineHeight * dpr);
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          context.clearRect(0, 0, cssWidth, lineHeight);
          context.font = font;
          context.fillStyle = "#111111";
          context.textBaseline = "top";
          context.fillText(line, 0, 2);
          documentPdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, maxWidth, lineHeight);
          y += lineHeight;
        });
      });
    }

    async function itemToPdfBytes(item, options) {
      if (item.kind === "pdf") return new Uint8Array(await item.file.arrayBuffer());
      if (!global.jspdf || !global.jspdf.jsPDF) throw new Error(t("coreMissing"));
      var JsPdf = global.jspdf.jsPDF;
      var margin = mmToPt(options.marginMm);
      var requested = pageRule(options.pageSize);
      var fixed = requested.imageOnly ? pageRule("a4") : requested;

      if (item.kind === "image") {
        var image = await loadImage(item.file);
        var imageWidth = image.naturalWidth || image.width;
        var imageHeight = image.naturalHeight || image.height;
        var pageWidth;
        var pageHeight;
        if (requested.imageOnly) {
          var pointScale = 72 / 96;
          pageWidth = Math.max(imageWidth * pointScale, 72);
          pageHeight = Math.max(imageHeight * pointScale, 72);
          var longest = Math.max(pageWidth, pageHeight);
          if (longest > config.limits.imagePageMaxPoints) {
            var scale = config.limits.imagePageMaxPoints / longest;
            pageWidth *= scale;
            pageHeight *= scale;
          }
        } else {
          pageWidth = fixed.width;
          pageHeight = fixed.height;
        }
        var imagePdf = new JsPdf({ unit: "pt", format: [pageWidth, pageHeight], compress: true });
        addImageToPage(imagePdf, image, pageWidth, pageHeight, margin, options.imageFit);
        return new Uint8Array(imagePdf.output("arraybuffer"));
      }

      var documentPdf = new JsPdf({ unit: "pt", format: [fixed.width, fixed.height], compress: true });
      if (item.kind === "docx") {
        if (!global.mammoth) throw new Error(t("mammothMissing"));
        var result = await global.mammoth.convertToHtml(
          { arrayBuffer: await item.file.arrayBuffer() },
          {
            convertImage: global.mammoth.images.imgElement(function (image) {
              return image.read("base64").then(function (buffer) { return { src: "data:" + image.contentType + ";base64," + buffer }; });
            }),
            styleMap: [
              "p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh",
              "p[style-name='Heading 1'] => h1:fresh", "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh", "p[style-name='Heading 4'] => h4:fresh",
              "r[style-name='Strong'] => strong",
            ],
          }
        );
        if (result.messages && result.messages.length) console.info("mammoth:", result.messages);
        await writeHtmlDocument(documentPdf, result.value || "", { pageWidth: fixed.width, pageHeight: fixed.height, margin: margin });
        return new Uint8Array(documentPdf.output("arraybuffer"));
      }

      var text = String(await item.file.text()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      if (!text.trim()) text = t("emptyFile");
      await writeTextDocument(documentPdf, text, { pageWidth: fixed.width, pageHeight: fixed.height, margin: margin });
      return new Uint8Array(documentPdf.output("arraybuffer"));
    }

    async function mergePdfBytesList(list) {
      if (!global.PDFLib || !global.PDFLib.PDFDocument) throw new Error(t("coreMissing"));
      var output = await global.PDFLib.PDFDocument.create();
      for (var i = 0; i < list.length; i++) {
        var source = await global.PDFLib.PDFDocument.load(list[i], { ignoreEncryption: true });
        var pages = await output.copyPages(source, source.getPageIndices());
        pages.forEach(function (page) { output.addPage(page); });
      }
      return output.save();
    }

    return {
      extensionFromName: extensionFromName,
      formatBytes: formatBytes,
      detectKind: detectKind,
      kindLabel: kindLabel,
      isConvertible: isConvertible,
      errorKeyForKind: errorKeyForKind,
      sanitizeFilename: sanitizeFilename,
      separateOutputName: separateOutputName,
      itemToPdfBytes: itemToPdfBytes,
      mergePdfBytesList: mergePdfBytesList,
      pageRule: pageRule,
    };
  }

  global.KenEasyPdfEngine = { create: createEngine };
})(window);
