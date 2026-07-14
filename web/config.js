/* KenEasy PDF Converter — declarative product rules and defaults. */
(function (global) {
  "use strict";

  var config = {
    version: "0.3.0",
    storageKeys: {
      language: "keneasy-pdf-lang",
      appearance: "keneasy-pdf-appearance",
      settings: "keneasy-pdf-settings-v3",
    },
    limits: {
      maxFiles: 80,
      maxFileBytes: 40 * 1024 * 1024,
      maxFilenameLength: 80,
      maxRasterEdge: 4096,
      imagePageMaxPoints: 2000,
    },
    input: {
      accept: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "docx", "txt", "md", "markdown", "csv", "log", "json", "pdf"],
      rules: [
        { kind: "image", extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"], mimePrefixes: ["image/"] },
        { kind: "pdf", extensions: ["pdf"], mimeTypes: ["application/pdf"] },
        { kind: "docx", extensions: ["docx"], mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
        { kind: "unsupported-doc", extensions: ["doc"], mimeTypes: ["application/msword"] },
        { kind: "text", extensions: ["txt", "md", "markdown", "csv", "log", "json"], mimePrefixes: ["text/"] },
      ],
    },
    kinds: {
      image: { label: "IMG", convertible: true },
      pdf: { label: "PDF", convertible: true },
      docx: { label: "DOCX", convertible: true },
      text: { label: "TXT", convertible: true },
      "unsupported-doc": { label: "DOC", convertible: false, errorKey: "unsupportedDoc" },
      unknown: { label: "?", convertible: false, errorKey: "unsupportedFormat" },
    },
    pageSizes: [
      { value: "a4", label: "A4", width: 595.28, height: 841.89 },
      { value: "letter", label: "Letter", width: 612, height: 792 },
      { value: "auto", labelKey: "pageAuto", imageOnly: true },
    ],
    imageFits: [
      { value: "contain", labelKey: "fitContain", helpKey: "fitContainHelp" },
      { value: "cover", labelKey: "fitCover", helpKey: "fitCoverHelp" },
      { value: "stretch", labelKey: "fitStretch", helpKey: "fitStretchHelp" },
    ],
    defaults: {
      merge: true,
      pageSize: "a4",
      imageFit: "contain",
      marginMm: 12,
      filename: "converted",
    },
    presets: [
      {
        id: "document",
        nameKey: "presetDocument",
        descKey: "presetDocumentDesc",
        values: { merge: true, pageSize: "a4", imageFit: "contain", marginMm: 12 },
      },
      {
        id: "fullbleed",
        nameKey: "presetFullBleed",
        descKey: "presetFullBleedDesc",
        values: { merge: true, pageSize: "a4", imageFit: "cover", marginMm: 0 },
      },
      {
        id: "letter",
        nameKey: "presetLetter",
        descKey: "presetLetterDesc",
        values: { merge: true, pageSize: "letter", imageFit: "contain", marginMm: 12 },
      },
      {
        id: "separate",
        nameKey: "presetSeparate",
        descKey: "presetSeparateDesc",
        values: { merge: false, pageSize: "a4", imageFit: "contain", marginMm: 12 },
      },
    ],
  };

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
    return value;
  }

  global.KenEasyPdfConfig = deepFreeze(config);
})(window);
