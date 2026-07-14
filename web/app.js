/* KenEasy PDF Converter — application layer: state, UI, queue, and workflow orchestration. */
(function (global) {
  "use strict";

  var config = global.KenEasyPdfConfig;
  var i18nFactory = global.KenEasyPdfI18n;
  var engineFactory = global.KenEasyPdfEngine;
  if (!config || !i18nFactory || !engineFactory) {
    console.error("KenEasy PDF Converter core modules are missing.");
    return;
  }

  var i18n = i18nFactory.create(config);
  var t = i18n.t;
  var engine = engineFactory.create(config, function (key, variables) { return t(key, variables); });
  var state = { items: [], busy: false, completed: false, sortable: null, saveTimer: null };
  var byId = function (id) { return document.getElementById(id); };
  var els = {
    dropzone: byId("dropzone"), chooseFilesButton: byId("chooseFilesButton"), fileInput: byId("fileInput"),
    fileList: byId("fileList"), emptyState: byId("emptyState"), fileCount: byId("fileCount"), queueTotal: byId("queueTotal"),
    btnClear: byId("btnClear"), btnConvert: byId("btnConvert"), btnConvertLabel: byId("btnConvertLabel"), btnCount: byId("btnCount"),
    actionHint: byId("actionHint"), statusPanel: byId("statusPanel"), statusText: byId("statusText"),
    statusPct: byId("statusPct"), statusDetail: byId("statusDetail"), progressBar: byId("progressBar"), progressTrack: byId("progressTrack"),
    presetList: byId("presetList"), optPageSize: byId("optPageSize"), optImageFit: byId("optImageFit"),
    imageFitHelp: byId("imageFitHelp"), optMargin: byId("optMargin"), optMerge: byId("optMerge"),
    optFilename: byId("optFilename"), filenameHelp: byId("filenameHelp"), themeToggle: byId("themeToggle"),
    langZh: byId("langZh"), langEn: byId("langEn"), workflowSteps: byId("workflowSteps"),
  };

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toast(message, isError) {
    var element = document.querySelector(".toast");
    if (!element) {
      element = document.createElement("div");
      element.className = "toast";
      element.setAttribute("role", "status");
      document.body.appendChild(element);
    }
    element.textContent = message;
    element.classList.toggle("error", !!isError);
    element.classList.add("show");
    clearTimeout(element._timer);
    element._timer = setTimeout(function () { element.classList.remove("show"); }, 3200);
  }

  function detectAppearance() {
    try {
      var saved = localStorage.getItem(config.storageKeys.appearance);
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {}
    return global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setAppearance(appearance, persist) {
    var next = appearance === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#111318" : "#f5f5f7");
    if (persist) {
      try { localStorage.setItem(config.storageKeys.appearance, next); } catch (error) {}
    }
    syncThemeControl();
  }

  function syncThemeControl() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    els.themeToggle.setAttribute("aria-label", t(dark ? "themeToLight" : "themeToDark"));
    els.themeToggle.setAttribute("aria-pressed", String(dark));
  }

  function applyStaticI18n() {
    var language = i18n.getLanguage();
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = t("pageTitle");
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", t("pageDesc"));
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-html]"), function (node) {
      node.innerHTML = t(node.getAttribute("data-i18n-html"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-aria-label]"), function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria-label")));
    });
    var formatNode = document.querySelector('[data-i18n="dropFormats"]');
    if (formatNode) formatNode.textContent = t("dropFormats", { maxFileSize: engine.formatBytes(config.limits.maxFileBytes) });
    els.langZh.setAttribute("aria-pressed", String(language === "zh"));
    els.langEn.setAttribute("aria-pressed", String(language === "en"));
    syncThemeControl();
    syncWorkflowState();
    syncPrimaryAction();
  }

  function setLanguage(next) {
    if (!i18n.setLanguage(next)) return;
    renderRuleOptions();
    renderPresets();
    applyStaticI18n();
    renderList();
    syncControlPresentation();
  }

  function normalizeSettings(candidate) {
    var defaults = config.defaults;
    var pageValues = config.pageSizes.map(function (rule) { return rule.value; });
    var fitValues = config.imageFits.map(function (rule) { return rule.value; });
    var margin = Number(candidate && candidate.marginMm);
    return {
      merge: candidate && typeof candidate.merge === "boolean" ? candidate.merge : defaults.merge,
      pageSize: candidate && pageValues.indexOf(candidate.pageSize) >= 0 ? candidate.pageSize : defaults.pageSize,
      imageFit: candidate && fitValues.indexOf(candidate.imageFit) >= 0 ? candidate.imageFit : defaults.imageFit,
      marginMm: isFinite(margin) ? clamp(margin, 0, 40) : defaults.marginMm,
      filename: engine.sanitizeFilename(candidate && candidate.filename || defaults.filename),
    };
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(config.storageKeys.settings);
      return normalizeSettings(raw ? JSON.parse(raw) : config.defaults);
    } catch (error) {
      return normalizeSettings(config.defaults);
    }
  }

  function applySettings(settings) {
    els.optMerge.checked = settings.merge;
    els.optPageSize.value = settings.pageSize;
    els.optImageFit.value = settings.imageFit;
    els.optMargin.value = String(settings.marginMm);
    els.optFilename.value = settings.filename;
  }

  function readOptions() {
    var settings = normalizeSettings({
      merge: els.optMerge.checked,
      pageSize: els.optPageSize.value,
      imageFit: els.optImageFit.value,
      marginMm: els.optMargin.value,
      filename: els.optFilename.value,
    });
    els.optMargin.value = String(settings.marginMm);
    return settings;
  }

  function scheduleSettingsSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(function () {
      try { localStorage.setItem(config.storageKeys.settings, JSON.stringify(readOptions())); } catch (error) {}
    }, 120);
  }

  function renderRuleOptions() {
    var selectedPage = els.optPageSize.value || config.defaults.pageSize;
    var selectedFit = els.optImageFit.value || config.defaults.imageFit;
    els.optPageSize.innerHTML = "";
    config.pageSizes.forEach(function (rule) {
      var option = document.createElement("option");
      option.value = rule.value;
      option.textContent = rule.labelKey ? t(rule.labelKey) : rule.label;
      els.optPageSize.appendChild(option);
    });
    els.optImageFit.innerHTML = "";
    config.imageFits.forEach(function (rule) {
      var option = document.createElement("option");
      option.value = rule.value;
      option.textContent = t(rule.labelKey);
      els.optImageFit.appendChild(option);
    });
    els.optPageSize.value = config.pageSizes.some(function (rule) { return rule.value === selectedPage; }) ? selectedPage : config.defaults.pageSize;
    els.optImageFit.value = config.imageFits.some(function (rule) { return rule.value === selectedFit; }) ? selectedFit : config.defaults.imageFit;
    els.fileInput.accept = config.input.accept.map(function (extension) { return "." + extension; }).concat([
      "image/*", "text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]).join(",");
  }

  function renderPresets() {
    els.presetList.innerHTML = "";
    config.presets.forEach(function (preset) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "preset-btn";
      button.dataset.presetId = preset.id;
      button.setAttribute("aria-pressed", "false");
      var title = document.createElement("strong");
      title.textContent = t(preset.nameKey);
      var description = document.createElement("small");
      description.textContent = t(preset.descKey);
      button.appendChild(title);
      button.appendChild(description);
      button.addEventListener("click", function () { if (!state.busy) applyPreset(preset); });
      els.presetList.appendChild(button);
    });
    updateActivePreset();
  }

  function applyPreset(preset) {
    els.optMerge.checked = preset.values.merge;
    els.optPageSize.value = preset.values.pageSize;
    els.optImageFit.value = preset.values.imageFit;
    els.optMargin.value = String(preset.values.marginMm);
    state.completed = false;
    hideStatus();
    syncControlPresentation();
    scheduleSettingsSave();
    toast(t("presetApplied", { name: t(preset.nameKey) }));
  }

  function updateActivePreset() {
    var options = readOptions();
    Array.prototype.forEach.call(els.presetList.querySelectorAll(".preset-btn"), function (button) {
      var preset = config.presets.find(function (candidate) { return candidate.id === button.dataset.presetId; });
      var active = preset && Object.keys(preset.values).every(function (key) { return options[key] === preset.values[key]; });
      button.classList.toggle("active", !!active);
      button.setAttribute("aria-pressed", String(!!active));
    });
  }

  function syncControlPresentation() {
    var options = readOptions();
    var fit = config.imageFits.find(function (rule) { return rule.value === options.imageFit; }) || config.imageFits[0];
    els.imageFitHelp.textContent = t(fit.helpKey);
    els.filenameHelp.textContent = options.merge
      ? t("filenameHelpMerge", { name: options.filename })
      : t("filenameHelpSeparate");
    els.optFilename.disabled = state.busy || !options.merge;
    updateActivePreset();
    syncPrimaryAction();
  }

  function validItems() {
    return state.items.filter(function (item) { return engine.isConvertible(item.kind) && !item.errorKey; });
  }

  function totalBytes(items) {
    return items.reduce(function (sum, item) { return sum + item.size; }, 0);
  }

  function itemErrorText(item) {
    return item.errorKey ? t(item.errorKey) : item.error || "";
  }

  function addFiles(fileListLike) {
    if (state.busy) return;
    var incoming = Array.from(fileListLike || []);
    if (!incoming.length) return;
    var added = 0;
    for (var i = 0; i < incoming.length; i++) {
      var file = incoming[i];
      if (state.items.length >= config.limits.maxFiles) {
        toast(t("maxFiles", { n: config.limits.maxFiles }), true);
        break;
      }
      if (file.size > config.limits.maxFileBytes) {
        toast(t("fileTooLarge", { name: file.name, size: engine.formatBytes(config.limits.maxFileBytes) }), true);
        continue;
      }
      var kind = engine.detectKind(file);
      var item = { id: uid(), file: file, kind: kind, name: file.name, size: file.size, isNew: true };
      if (!engine.isConvertible(kind)) item.errorKey = engine.errorKeyForKind(kind);
      if (kind === "image") {
        try { item.previewUrl = URL.createObjectURL(file); } catch (error) {}
      }
      state.items.push(item);
      added += 1;
    }
    if (added) {
      state.completed = false;
      hideStatus();
      renderList();
      toast(t("addedFiles", { n: added }));
    }
  }

  function releaseItem(item) {
    if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }

  function removeItem(id) {
    if (state.busy) return;
    var row = els.fileList.querySelector('[data-id="' + id + '"]');
    var done = false;
    function removeNow() {
      if (done) return;
      done = true;
      var index = state.items.findIndex(function (item) { return item.id === id; });
      if (index < 0) return;
      releaseItem(state.items[index]);
      state.items.splice(index, 1);
      state.completed = false;
      hideStatus();
      renderList();
    }
    if (!row) { removeNow(); return; }
    row.classList.add("removing");
    row.addEventListener("animationend", removeNow, { once: true });
    setTimeout(removeNow, 360);
  }

  function clearAll() {
    if (state.busy) return;
    state.items.forEach(releaseItem);
    state.items = [];
    state.completed = false;
    hideStatus();
    renderList();
    toast(t("queueCleared"));
  }

  function syncOrderFromDom() {
    var map = new Map(state.items.map(function (item) { return [item.id, item]; }));
    var ordered = Array.prototype.map.call(els.fileList.children, function (row) { return map.get(row.dataset.id); }).filter(Boolean);
    if (ordered.length === state.items.length) state.items = ordered;
    renderList();
  }

  function moveItem(id, direction) {
    if (state.busy) return;
    var index = state.items.findIndex(function (item) { return item.id === id; });
    var next = index + direction;
    if (index < 0 || next < 0 || next >= state.items.length) return;
    var moved = state.items[index];
    state.items.splice(index, 1);
    state.items.splice(next, 0, moved);
    renderList();
    var handle = els.fileList.querySelector('[data-id="' + id + '"] .handle');
    if (handle) handle.focus();
    toast(t("reordered", { name: moved.name, position: next + 1 }));
  }

  function createFileRow(item, newIndex) {
    var row = document.createElement("li");
    row.className = "file-item" + (item.errorKey ? " is-error" : "") + (state.completed && !item.errorKey ? " is-done" : "");
    row.dataset.id = item.id;
    if (item.isNew) {
      row.classList.add("new-item");
      row.style.animationDelay = newIndex * 55 + "ms";
      delete item.isNew;
    }
    var handle = document.createElement("button");
    handle.type = "button";
    handle.className = "handle";
    handle.title = t("dragSort");
    handle.setAttribute("aria-label", t("dragSort") + ": " + item.name);
    handle.textContent = "⠿";
    handle.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        moveItem(item.id, event.key === "ArrowUp" ? -1 : 1);
      }
    });
    var thumb = document.createElement("div");
    thumb.className = "thumb";
    if (item.previewUrl) {
      var image = document.createElement("img");
      image.src = item.previewUrl;
      image.alt = "";
      thumb.appendChild(image);
    } else thumb.textContent = engine.kindLabel(item.kind);
    var meta = document.createElement("div");
    meta.className = "meta";
    var name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;
    name.title = item.name;
    var sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = item.errorKey ? itemErrorText(item) : engine.formatBytes(item.size) + " · " + (item.file.type || t("unknownType"));
    meta.appendChild(name);
    meta.appendChild(sub);
    var kind = document.createElement("span");
    kind.className = "kind " + item.kind;
    kind.textContent = engine.kindLabel(item.kind);
    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn";
    remove.title = t("remove");
    remove.setAttribute("aria-label", t("removeAria", { name: item.name }));
    remove.textContent = "×";
    remove.disabled = state.busy;
    remove.addEventListener("click", function () { removeItem(item.id); });
    row.appendChild(handle); row.appendChild(thumb); row.appendChild(meta); row.appendChild(kind); row.appendChild(remove);
    return row;
  }

  function renderList() {
    var hasItems = state.items.length > 0;
    var usable = validItems();
    var bytes = totalBytes(state.items);
    els.fileCount.textContent = hasItems ? t("queueCount", { n: state.items.length }) : t("queueEmptyCount");
    els.queueTotal.textContent = t("queueTotal", { size: engine.formatBytes(bytes) });
    els.emptyState.hidden = hasItems;
    els.fileList.hidden = !hasItems;
    els.dropzone.classList.toggle("has-files", hasItems);
    els.fileList.innerHTML = "";
    var newIndex = 0;
    state.items.forEach(function (item) {
      els.fileList.appendChild(createFileRow(item, item.isNew ? newIndex++ : newIndex));
    });
    els.btnClear.disabled = !hasItems || state.busy;
    if (!state.sortable && global.Sortable) {
      state.sortable = global.Sortable.create(els.fileList, {
        handle: ".handle", animation: 160, ghostClass: "sortable-ghost", dragClass: "sortable-drag", onEnd: syncOrderFromDom,
      });
    }
    if (state.sortable) state.sortable.option("disabled", state.busy);
    syncBusyControls();
    syncPrimaryAction();
    syncWorkflowState();
  }

  function syncBusyControls() {
    var controls = [els.optPageSize, els.optImageFit, els.optMargin, els.optMerge, els.optFilename];
    controls.forEach(function (control) { control.disabled = state.busy; });
    if (!state.busy && !els.optMerge.checked) els.optFilename.disabled = true;
    Array.prototype.forEach.call(els.presetList.querySelectorAll("button"), function (button) { button.disabled = state.busy; });
    els.dropzone.setAttribute("aria-disabled", String(state.busy));
    els.fileInput.disabled = state.busy;
    els.btnConvert.setAttribute("aria-busy", String(state.busy));
    els.btnConvert.classList.toggle("is-busy", state.busy);
  }

  function syncPrimaryAction() {
    var usable = validItems();
    var bytes = totalBytes(usable);
    els.btnConvert.disabled = !usable.length || state.busy;
    els.btnConvertLabel.textContent = t(state.busy ? "btnWorking" : "btnConvert");
    els.btnCount.hidden = !usable.length;
    els.btnCount.textContent = String(usable.length);
    els.actionHint.textContent = usable.length ? t("actionReady", { n: usable.length, size: engine.formatBytes(bytes) }) : t("actionEmpty");
  }

  function syncWorkflowState() {
    var stage = !state.items.length ? 1 : (state.busy || state.completed ? 3 : 2);
    Array.prototype.forEach.call(els.workflowSteps.children, function (step) {
      var number = Number(step.dataset.workflowStep);
      var current = number === stage;
      var complete = number < stage || (state.completed && number === 3);
      step.classList.toggle("active", current && !state.completed);
      step.classList.toggle("complete", complete);
      if (current && !state.completed) step.setAttribute("aria-current", "step"); else step.removeAttribute("aria-current");
      var name = t(number === 1 ? "workflowImport" : number === 2 ? "workflowTune" : "workflowExport");
      var status = complete ? t("workflowStateComplete") : current ? t("workflowStateCurrent") : t("workflowStateUpcoming");
      step.setAttribute("aria-label", t("workflowStepLabel", { n: number, name: name, state: status }));
    });
  }

  function setStatus(show, text, percent, detail) {
    els.statusPanel.hidden = !show;
    if (!show) {
      els.progressBar.style.width = "0%";
      els.progressTrack.setAttribute("aria-valuenow", "0");
      return;
    }
    if (text != null) els.statusText.textContent = text;
    if (percent != null) {
      var value = clamp(Math.round(percent), 0, 100);
      els.statusPct.textContent = value + "%";
      els.progressBar.style.width = value + "%";
      els.progressTrack.setAttribute("aria-valuenow", String(value));
    }
    if (detail != null) els.statusDetail.textContent = detail;
  }

  function hideStatus() { setStatus(false); }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
  }

  async function convertAll() {
    if (state.busy) return;
    var queue = validItems();
    if (!queue.length) { toast(t("noConvertible"), true); return; }
    if (!global.jspdf || !global.PDFLib) { toast(t("coreMissing"), true); return; }
    var options = readOptions();
    state.busy = true;
    state.completed = false;
    renderList();
    setStatus(true, t("converting"), 0, "");
    try {
      var parts = [];
      for (var i = 0; i < queue.length; i++) {
        setStatus(true, t("processing", { i: i + 1, n: queue.length }), (i / queue.length) * 90, queue[i].name);
        parts.push({ item: queue[i], bytes: await engine.itemToPdfBytes(queue[i], options) });
        await new Promise(function (resolve) { setTimeout(resolve, 0); });
      }
      setStatus(true, t("generating"), 95, "");
      if (options.merge) {
        var finalBytes = parts.length === 1 ? parts[0].bytes : await engine.mergePdfBytesList(parts.map(function (part) { return part.bytes; }));
        var mergedName = engine.sanitizeFilename(options.filename) + ".pdf";
        downloadBlob(new Blob([finalBytes], { type: "application/pdf" }), mergedName);
        setStatus(true, t("done"), 100, t("downloaded", { name: mergedName }));
        toast(t("downloaded", { name: mergedName }));
      } else {
        var usedNames = {};
        for (var j = 0; j < parts.length; j++) {
          var filename = engine.separateOutputName(parts[j].item, j, usedNames);
          downloadBlob(new Blob([parts[j].bytes], { type: "application/pdf" }), filename);
          setStatus(true, t("downloading"), 95 + ((j + 1) / parts.length) * 5, filename);
          await new Promise(function (resolve) { setTimeout(resolve, 240); });
        }
        setStatus(true, t("done"), 100, t("downloadedMany", { n: parts.length }));
        toast(t("downloadedMany", { n: parts.length }));
      }
      state.completed = true;
    } catch (error) {
      console.error(error);
      state.completed = false;
      setStatus(true, t("failed"), 0, error && error.message || String(error));
      toast(error && error.message || t("convertFailed"), true);
    } finally {
      state.busy = false;
      renderList();
      syncControlPresentation();
    }
  }

  function bindDropzone() {
    function choose(event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      if (!state.busy) els.fileInput.click();
    }
    els.chooseFilesButton.addEventListener("click", choose);
    els.dropzone.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      choose(event);
    });
    els.dropzone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") choose(event);
    });
    els.fileInput.addEventListener("change", function () { addFiles(els.fileInput.files); els.fileInput.value = ""; });
    var depth = 0;
    function highlight(on) { els.dropzone.classList.toggle("dragover", !!on && !state.busy); }
    function clear() { depth = 0; highlight(false); }
    els.dropzone.addEventListener("dragenter", function (event) { event.preventDefault(); depth += 1; highlight(true); });
    els.dropzone.addEventListener("dragover", function (event) { event.preventDefault(); if (!depth) depth = 1; highlight(true); });
    els.dropzone.addEventListener("dragleave", function (event) {
      event.preventDefault();
      if (event.relatedTarget && els.dropzone.contains(event.relatedTarget)) return;
      depth = Math.max(0, depth - 1); if (!depth) highlight(false);
    });
    els.dropzone.addEventListener("drop", function (event) { event.preventDefault(); clear(); addFiles(event.dataTransfer.files); });
    global.addEventListener("dragover", function (event) { event.preventDefault(); });
    global.addEventListener("drop", function (event) { event.preventDefault(); clear(); });
    global.addEventListener("dragend", clear);
    document.addEventListener("dragleave", function (event) { if (event.relatedTarget == null) clear(); });
  }

  function bindControls() {
    [els.optPageSize, els.optImageFit, els.optMargin, els.optMerge, els.optFilename].forEach(function (control) {
      control.addEventListener(control === els.optFilename || control === els.optMargin ? "input" : "change", function () {
        state.completed = false;
        hideStatus();
        syncControlPresentation();
        scheduleSettingsSave();
      });
    });
    els.btnClear.addEventListener("click", clearAll);
    els.btnConvert.addEventListener("click", convertAll);
    els.langZh.addEventListener("click", function () { setLanguage("zh"); });
    els.langEn.addEventListener("click", function () { setLanguage("en"); });
    els.themeToggle.addEventListener("click", function () {
      setAppearance(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  function init() {
    setAppearance(detectAppearance(), false);
    renderRuleOptions();
    applySettings(loadSettings());
    renderPresets();
    bindDropzone();
    bindControls();
    applyStaticI18n();
    syncControlPresentation();
    renderList();
  }

  global.__KenEasyPdfApp = { addFiles: addFiles, readOptions: readOptions, state: state, engine: engine };
  init();
})(window);
