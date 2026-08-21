// My Gospel Journey — main application logic
"use strict";

const state = {
  order: "chronological", // "chronological" | "canonical"
  translation: "ESV", // preferred translation; falls back to WEB if unavailable
  activeTranslation: "WEB", // translation actually rendered for the current chapter
  bookCode: null,
  chapter: 1,
  verses: [],
  notesPanelRef: null, // reference string notes panel is currently scoped to
  editingNoteId: null,
  panelTab: "notes", // "notes" | "commentary"
  commentarySource: "matthew-henry" // "matthew-henry" | "adam-clarke"
};

const el = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Reference parsing & wiki-link support
// ---------------------------------------------------------------------------

const NAME_TO_CODE = {};
for (const b of BOOKS) {
  NAME_TO_CODE[b.name.toLowerCase()] = b.code;
  NAME_TO_CODE[b.code.toLowerCase()] = b.code;
}
// common aliases
Object.assign(NAME_TO_CODE, {
  "psalm": "Ps", "psalms": "Ps", "ps": "Ps",
  "song of songs": "Song", "canticles": "Song",
  "1st samuel": "1Sam", "2nd samuel": "2Sam",
  "1st kings": "1Kgs", "2nd kings": "2Kgs",
  "1st chronicles": "1Chr", "2nd chronicles": "2Chr",
  "1st corinthians": "1Cor", "2nd corinthians": "2Cor",
  "1st thessalonians": "1Thess", "2nd thessalonians": "2Thess",
  "1st timothy": "1Tim", "2nd timothy": "2Tim",
  "1st peter": "1Pet", "2nd peter": "2Pet",
  "1st john": "1John", "2nd john": "2John", "3rd john": "3John",
  "rev": "Rev", "mt": "Matt", "jn": "John", "jas": "Jas"
});

// Parses strings like "John 3:16", "Gen 1:1-3", "1 John 2", "Romans 8"
function parseReference(text) {
  const m = text.trim().match(/^((?:[1-3]\s?)?[A-Za-z. ]+?)\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/);
  if (!m) return null;
  const rawName = m[1].trim().toLowerCase().replace(/\.$/, "");
  const code = NAME_TO_CODE[rawName];
  if (!code) return null;
  const book = BOOKS_BY_CODE[code];
  const chapter = parseInt(m[2], 10);
  if (chapter < 1 || chapter > book.chapters) return null;
  const verseStart = m[3] ? parseInt(m[3], 10) : null;
  const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart;
  return { book, chapter, verseStart, verseEnd };
}

function referenceLabel(ref) {
  if (!ref) return "";
  let s = `${ref.book.name} ${ref.chapter}`;
  if (ref.verseStart) s += `:${ref.verseStart}${ref.verseEnd && ref.verseEnd !== ref.verseStart ? "-" + ref.verseEnd : ""}`;
  return s;
}

function normalizeTarget(t) {
  return t.trim().toLowerCase();
}

// Extract [[wiki links]] and #tags from note content, return render-ready HTML + metadata.
function parseNoteContent(content) {
  const links = [];
  const tags = [];
  const tagRe = /#([A-Za-z0-9_-]+)/g;
  let tm;
  while ((tm = tagRe.exec(content))) tags.push(tm[1].toLowerCase());

  const escaped = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = escaped
    .replace(/\[\[([^\]]+)\]\]/g, (full, target) => {
      links.push(target.trim());
      return `<a href="#" class="wikilink" data-target="${target.trim().replace(/"/g, "&quot;")}">${target.trim()}</a>`;
    })
    .replace(/#([A-Za-z0-9_-]+)/g, `<span class="tag">#$1</span>`)
    .replace(/\n/g, "<br>");

  return { html, links: [...new Set(links)], tags: [...new Set(tags)] };
}

// ---------------------------------------------------------------------------
// Reading plan (chronological / canonical)
// ---------------------------------------------------------------------------

function planEntries(order) {
  const codes = order === "chronological" ? CHRONOLOGICAL_ORDER : CANONICAL_ORDER;
  const entries = [];
  for (const code of codes) {
    const book = BOOKS_BY_CODE[code];
    for (let c = 1; c <= book.chapters; c++) entries.push({ book, chapter: c });
  }
  return entries;
}

async function renderSidebar() {
  const container = el("planList");
  container.innerHTML = "";
  const codes = state.order === "chronological" ? CHRONOLOGICAL_ORDER : CANONICAL_ORDER;
  const progressRecords = await DB.allProgress();
  const doneSet = new Set(progressRecords.filter(p => p.key.startsWith(state.order + ":")).map(p => p.key));

  let doneCount = 0;
  let totalCount = 0;

  for (const code of codes) {
    const book = BOOKS_BY_CODE[code];
    const details = document.createElement("details");
    details.className = "plan-book";
    if (book.code === state.bookCode) details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = book.name;
    details.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "chapter-grid";
    for (let c = 1; c <= book.chapters; c++) {
      totalCount++;
      const key = `${state.order}:${book.code}:${c}`;
      const isDone = doneSet.has(key);
      if (isDone) doneCount++;
      const chip = document.createElement("button");
      chip.className = "chapter-chip" + (isDone ? " done" : "") + (book.code === state.bookCode && c === state.chapter ? " active" : "");
      chip.textContent = c;
      chip.title = `${book.name} ${c}`;
      chip.addEventListener("click", () => navigateTo(book.code, c));
      chip.addEventListener("dblclick", async (e) => {
        e.stopPropagation();
        await DB.setProgress(state.order, book.code, c, !isDone);
        renderSidebar();
      });
      grid.appendChild(chip);
    }
    details.appendChild(grid);
    container.appendChild(details);
  }

  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  el("progressFill").style.width = pct + "%";
  el("progressLabel").textContent = `${doneCount} / ${totalCount} chapters read (${pct}%) — ${state.order}`;
}

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

async function resolveTranslationForChapter(book, chapter) {
  const pref = state.translation;
  if (pref === "WEB") return { translation: "WEB", verses: await getWebChapter(book.code, chapter) };
  try {
    const verses = await getChapter(pref, book, chapter);
    return { translation: pref, verses };
  } catch (err) {
    console.warn("Falling back to WEB:", err.message);
    const verses = await getWebChapter(book.code, chapter);
    return { translation: "WEB", verses, fallbackReason: err.message };
  }
}

async function navigateTo(bookCode, chapter) {
  const book = BOOKS_BY_CODE[bookCode];
  if (!book) return;
  chapter = Math.max(1, Math.min(book.chapters, chapter));
  state.bookCode = bookCode;
  state.chapter = chapter;
  await DB.setSetting("lastPosition", { bookCode, chapter });

  el("readerBody").innerHTML = `<p class="loading">Loading ${book.name} ${chapter}…</p>`;
  try {
    const { translation, verses, fallbackReason } = await resolveTranslationForChapter(book, chapter);
    state.activeTranslation = translation;
    state.verses = verses;
    renderReader(book, chapter, verses, translation, fallbackReason);
  } catch (err) {
    el("readerBody").innerHTML = `<p class="error">Could not load ${book.name} ${chapter}: ${err.message}</p>`;
  }
  renderSidebar();
  renderNotesPanelForRef(`${book.name} ${chapter}`);
  if (state.panelTab === "commentary") renderCommentaryPanel();
  location.hash = `#/${book.code}/${chapter}`;
}

function renderReader(book, chapter, verses, translation, fallbackReason) {
  el("readerTitle").textContent = `${book.name} ${chapter}`;
  el("translationBadge").textContent = TRANSLATIONS[translation].label;
  el("fallbackNote").textContent = fallbackReason
    ? `Showing offline WEB text (preferred translation unavailable: ${fallbackReason}).`
    : "";

  const body = el("readerBody");
  body.innerHTML = "";
  for (const v of verses) {
    const row = document.createElement("div");
    row.className = "verse";
    row.dataset.verse = v.verse;
    row.innerHTML = `<span class="vnum">${v.verse}</span><span class="vtext">${escapeHtml(v.text)}</span>`;
    const addBtn = document.createElement("button");
    addBtn.className = "add-note-btn";
    addBtn.textContent = "+ Note";
    addBtn.title = `Add a note on verse ${v.verse}`;
    addBtn.addEventListener("click", () => openNoteEditor({
      ref: `${book.name} ${chapter}:${v.verse}`,
      book: book.code,
      title: ""
    }));
    row.appendChild(addBtn);
    body.appendChild(row);
  }

  const nav = el("chapterNav");
  nav.innerHTML = "";
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Prev";
  prevBtn.disabled = chapter <= 1 && isFirstBookInOrder(book.code);
  prevBtn.addEventListener("click", () => stepChapter(-1));
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next →";
  nextBtn.addEventListener("click", () => stepChapter(1));
  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isFirstBookInOrder(code) {
  const codes = state.order === "chronological" ? CHRONOLOGICAL_ORDER : CANONICAL_ORDER;
  return codes[0] === code;
}

function stepChapter(direction) {
  const codes = state.order === "chronological" ? CHRONOLOGICAL_ORDER : CANONICAL_ORDER;
  const idx = codes.indexOf(state.bookCode);
  const book = BOOKS_BY_CODE[state.bookCode];
  let targetChapter = state.chapter + direction;
  if (targetChapter >= 1 && targetChapter <= book.chapters) {
    navigateTo(state.bookCode, targetChapter);
    return;
  }
  const nextIdx = idx + direction;
  if (nextIdx < 0 || nextIdx >= codes.length) return;
  const nextBook = BOOKS_BY_CODE[codes[nextIdx]];
  navigateTo(nextBook.code, direction > 0 ? 1 : nextBook.chapters);
}

// ---------------------------------------------------------------------------
// Notes (Obsidian-style: wiki links, backlinks, tags)
// ---------------------------------------------------------------------------

async function renderNotesPanelForRef(refLabel) {
  state.notesPanelRef = refLabel;
  const allNotes = await DB.allNotes();
  const scoped = allNotes.filter(n => n.ref && n.ref.startsWith(refLabel));
  const list = el("notesList");
  list.innerHTML = "";
  el("notesPanelTitle").textContent = `Notes on ${refLabel}`;
  if (scoped.length === 0) {
    list.innerHTML = `<p class="muted">No notes yet. Click "+ Note" on a verse, or use "New Note" below.</p>`;
  }
  for (const note of scoped.sort((a, b) => b.updatedAt - a.updatedAt)) {
    list.appendChild(renderNoteCard(note));
  }
  renderBacklinks(refLabel);
}

function renderNoteCard(note) {
  const { html, tags } = parseNoteContent(note.content || "");
  const card = document.createElement("div");
  card.className = "note-card";
  card.innerHTML = `
    <div class="note-header">
      <strong>${escapeHtml(note.title || note.ref || "Untitled")}</strong>
      <span class="note-ref">${escapeHtml(note.ref || "")}</span>
    </div>
    <div class="note-body">${html}</div>
    <div class="note-tags">${tags.map(t => `<span class="tag">#${t}</span>`).join(" ")}</div>
    <div class="note-actions">
      <button class="edit-note">Edit</button>
      <button class="delete-note">Delete</button>
    </div>
  `;
  card.querySelector(".edit-note").addEventListener("click", () => openNoteEditor(note));
  card.querySelector(".delete-note").addEventListener("click", async () => {
    if (confirm("Delete this note?")) {
      await DB.deleteNote(note.id);
      renderNotesPanelForRef(state.notesPanelRef);
    }
  });
  card.querySelectorAll(".wikilink").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      followWikiLink(a.dataset.target);
    });
  });
  return card;
}

async function followWikiLink(target) {
  const ref = parseReference(target);
  if (ref) {
    await navigateTo(ref.book.code, ref.chapter);
    return;
  }
  const allNotes = await DB.allNotes();
  const match = allNotes.find(n => (n.title || "").toLowerCase() === normalizeTarget(target));
  if (match) {
    openNoteEditor(match);
  } else {
    openNoteEditor({ title: target, ref: state.notesPanelRef, content: "" });
  }
}

async function renderBacklinks(target) {
  const allNotes = await DB.allNotes();
  const norm = normalizeTarget(target);
  const backlinks = allNotes.filter(n => {
    const { links } = parseNoteContent(n.content || "");
    return links.some(l => normalizeTarget(l) === norm);
  });
  const container = el("backlinksList");
  container.innerHTML = "";
  if (backlinks.length === 0) {
    container.innerHTML = `<p class="muted">No backlinks yet.</p>`;
    return;
  }
  for (const n of backlinks) {
    const item = document.createElement("div");
    item.className = "backlink-item";
    item.innerHTML = `<a href="#" class="wikilink">${escapeHtml(n.title || n.ref)}</a> <span class="muted">(${escapeHtml(n.ref || "")})</span>`;
    item.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); openNoteEditor(n); });
    container.appendChild(item);
  }
}

function openNoteEditor(note) {
  state.editingNoteId = note.id || null;
  el("noteEditorModal").classList.add("open");
  el("noteTitleInput").value = note.title || "";
  el("noteRefInput").value = note.ref || state.notesPanelRef || "";
  el("noteContentInput").value = note.content || "";
}

function closeNoteEditor() {
  el("noteEditorModal").classList.remove("open");
  state.editingNoteId = null;
}

async function saveNoteFromEditor() {
  const title = el("noteTitleInput").value.trim();
  const ref = el("noteRefInput").value.trim();
  const content = el("noteContentInput").value;
  const { links, tags } = parseNoteContent(content);
  const note = {
    id: state.editingNoteId || undefined,
    title, ref, content, links, tags,
    book: (parseReference(ref) || {}).book ? parseReference(ref).book.code : null
  };
  await DB.saveNote(note);
  closeNoteEditor();
  renderNotesPanelForRef(state.notesPanelRef);
}

// ---------------------------------------------------------------------------
// Commentary (Matthew Henry / Adam Clarke, live-fetched and cached indefinitely)
// ---------------------------------------------------------------------------

function switchPanelTab(tab) {
  state.panelTab = tab;
  el("tabNotesBtn").classList.toggle("active", tab === "notes");
  el("tabCommentaryBtn").classList.toggle("active", tab === "commentary");
  el("notesTabContent").classList.toggle("hidden", tab !== "notes");
  el("commentaryTabContent").classList.toggle("hidden", tab !== "commentary");
  if (tab === "commentary") renderCommentaryPanel();
}

let commentaryRequestId = 0;

async function renderCommentaryPanel() {
  const book = BOOKS_BY_CODE[state.bookCode];
  if (!book) return;
  const requestId = ++commentaryRequestId; // guards against a slower, stale request (e.g. from
  // an earlier chapter/source) resolving after a newer one and overwriting the current view.
  const container = el("commentaryBody");
  container.innerHTML = `<p class="loading">Loading ${COMMENTARIES[state.commentarySource].label} on ${book.name} ${state.chapter}\u2026</p>`;

  const otherSource = Object.keys(COMMENTARIES).find((id) => id !== state.commentarySource);
  try {
    const result = await getCommentaryForChapter(
      state.commentarySource, book, state.chapter, state.verses.length, otherSource
    );
    if (requestId !== commentaryRequestId) return; // a newer request has since taken over
    container.innerHTML = "";
    if (result.fallbackFrom) {
      const note = document.createElement("p");
      note.className = "fallback-note";
      note.textContent = result.fallbackReason === "not_covered"
        ? `${COMMENTARIES[result.fallbackFrom].label} doesn't cover ${book.name} \u2014 showing ${COMMENTARIES[result.source].label} instead.`
        : `Couldn't load ${COMMENTARIES[result.fallbackFrom].label}'s commentary right now \u2014 showing ${COMMENTARIES[result.source].label} instead.`;
      container.appendChild(note);
    }
    if (result.bookIntro) {
      const intro = document.createElement("div");
      intro.className = "commentary-block commentary-intro";
      intro.innerHTML = `<h4 class="commentary-range">Introduction to ${escapeHtml(book.name)}</h4>` +
        result.bookIntro.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      container.appendChild(intro);
    }
    if (result.chapterIntro) {
      const intro = document.createElement("div");
      intro.className = "commentary-block commentary-intro";
      intro.innerHTML = `<h4 class="commentary-range">Chapter Summary</h4>` +
        result.chapterIntro.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      container.appendChild(intro);
    }
    if (result.ranges.length === 0 && !result.chapterIntro && !result.bookIntro) {
      container.innerHTML += `<p class="muted">No commentary notes for this chapter.</p>`;
      return;
    }
    for (const range of result.ranges) {
      const block = document.createElement("div");
      block.className = "commentary-block";
      const label = range.verseStart === range.verseEnd
        ? `Verse ${range.verseStart}`
        : `Verses ${range.verseStart}\u2013${range.verseEnd}`;
      block.innerHTML = `<h4 class="commentary-range">${label}</h4>` +
        range.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      container.appendChild(block);
    }
  } catch (err) {
    if (requestId !== commentaryRequestId) return; // a newer request has since taken over
    const offline = !navigator.onLine;
    container.innerHTML = `<p class="error">${
      offline
        ? "You're offline and this chapter's commentary hasn't been cached yet. Connect once to fetch it, and it'll stay available offline after that."
        : `Commentary not available for ${book.name} ${state.chapter} from either source.`
    }</p>`;
  }
}

// ---------------------------------------------------------------------------
// Search (offline WEB full text + notes)
// ---------------------------------------------------------------------------

async function searchAll(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { verses: [], notes: [] };

  const notesResults = (await DB.allNotes()).filter(n =>
    (n.title || "").toLowerCase().includes(q) ||
    (n.content || "").toLowerCase().includes(q) ||
    (n.tags || []).some(t => t.includes(q))
  );

  const verseResults = [];
  for (const b of BOOKS) {
    const book = await loadWebBook(b.code);
    for (const ch of book.chapters) {
      for (const v of ch.verses) {
        if (v.text.toLowerCase().includes(q)) {
          verseResults.push({ book: b, chapter: ch.chapter, verse: v.number, text: v.text });
          if (verseResults.length >= 200) break;
        }
      }
      if (verseResults.length >= 200) break;
    }
    if (verseResults.length >= 200) break;
  }
  return { verses: verseResults, notes: notesResults };
}

function renderSearchResults(results, query) {
  const modal = el("searchModal");
  const container = el("searchResults");
  container.innerHTML = "";
  container.innerHTML += `<h3>Notes (${results.notes.length})</h3>`;
  if (results.notes.length === 0) container.innerHTML += `<p class="muted">No matching notes.</p>`;
  for (const n of results.notes) {
    const item = document.createElement("div");
    item.className = "search-item";
    item.innerHTML = `<strong>${escapeHtml(n.title || n.ref)}</strong> <span class="muted">${escapeHtml(n.ref || "")}</span>`;
    item.addEventListener("click", () => { modal.classList.remove("open"); openNoteEditor(n); });
    container.appendChild(item);
  }
  const versesHeader = document.createElement("h3");
  versesHeader.textContent = `Verses in WEB translation (${results.verses.length}${results.verses.length >= 200 ? "+" : ""})`;
  container.appendChild(versesHeader);
  if (results.verses.length === 0) container.innerHTML += `<p class="muted">No matching verses.</p>`;
  for (const v of results.verses.slice(0, 200)) {
    const item = document.createElement("div");
    item.className = "search-item";
    item.innerHTML = `<strong>${v.book.name} ${v.chapter}:${v.verse}</strong> — ${escapeHtml(v.text)}`;
    item.addEventListener("click", () => { modal.classList.remove("open"); navigateTo(v.book.code, v.chapter); });
    container.appendChild(item);
  }
  modal.classList.add("open");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

async function openSettings() {
  el("esvApiKeyInput").value = (await DB.getSetting("esvApiKey")) || "";
  el("apiBibleKeyInput").value = (await DB.getSetting("apiBibleKey")) || "";
  el("apiBibleNivIdInput").value = (await DB.getSetting("apiBibleNivId")) || "";
  el("nltApiKeyInput").value = (await DB.getSetting("nltApiKey")) || "";
  el("translationSelect").value = state.translation;
  el("orderSelect").value = state.order;
  el("settingsModal").classList.add("open");
}

async function saveSettings() {
  await DB.setSetting("esvApiKey", el("esvApiKeyInput").value.trim());
  await DB.setSetting("apiBibleKey", el("apiBibleKeyInput").value.trim());
  await DB.setSetting("apiBibleNivId", el("apiBibleNivIdInput").value.trim());
  await DB.setSetting("nltApiKey", el("nltApiKeyInput").value.trim());
  state.translation = el("translationSelect").value;
  state.order = el("orderSelect").value;
  await DB.setSetting("translation", state.translation);
  await DB.setSetting("order", state.order);
  el("settingsModal").classList.remove("open");
  renderSidebar();
  navigateTo(state.bookCode, state.chapter);
}

// ---------------------------------------------------------------------------
// Export / Import (manual Drive-folder sync)
// ---------------------------------------------------------------------------

async function exportData() {
  const includeApiKeys = el("includeKeysCheckbox").checked;
  const passphrase = el("exportPassphraseInput").value;
  if (includeApiKeys && !passphrase) {
    alert("Please choose a passphrase to encrypt your API keys with, or uncheck that box.");
    return;
  }
  let data;
  try {
    data = await DB.exportAll({ includeApiKeys, passphrase: includeApiKeys ? passphrase : null });
  } catch (err) {
    alert("Export failed: " + err.message);
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `my-gospel-journey-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (includeApiKeys) el("exportPassphraseInput").value = "";
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (err) {
      alert("Import failed: this doesn't look like a valid export file.");
      return;
    }
    const merge = confirm("Merge with existing notes/progress? Click Cancel to replace everything instead.");
    try {
      await DB.importAll(data, { merge });
      alert("Import complete.");
    } catch (err) {
      if (err.message === "PASSPHRASE_REQUIRED") {
        const passphrase = prompt("This export includes encrypted API keys. Enter the passphrase used when it was exported (leave blank to skip importing the keys):");
        if (passphrase) {
          try {
            await DB.importAll(data, { merge, passphrase });
            alert("Import complete, including your API keys.");
          } catch (err2) {
            alert("Could not decrypt the API keys (" + err2.message + "). Your notes and progress were still imported.");
          }
        }
      } else {
        alert("Import failed: " + err.message);
        return;
      }
    }
    renderSidebar();
    renderNotesPanelForRef(state.notesPanelRef);
  };
  reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init() {
  state.translation = (await DB.getSetting("translation")) || "ESV";
  state.order = (await DB.getSetting("order")) || "chronological";
  state.commentarySource = (await DB.getSetting("commentarySource")) || "matthew-henry";
  el("commentarySourceSelect").value = state.commentarySource;

  let startBook = CHRONOLOGICAL_ORDER[0];
  let startChapter = 1;
  const hashMatch = location.hash.match(/^#\/(\w+)\/(\d+)/);
  if (hashMatch) {
    startBook = hashMatch[1];
    startChapter = parseInt(hashMatch[2], 10);
  } else {
    const last = await DB.getSetting("lastPosition");
    if (last && BOOKS_BY_CODE[last.bookCode]) {
      startBook = last.bookCode;
      startChapter = last.chapter;
    } else {
      startBook = (state.order === "chronological" ? CHRONOLOGICAL_ORDER : CANONICAL_ORDER)[0];
    }
  }

  el("orderSelectQuick").value = state.order;

  bindUI();
  await navigateTo(startBook, startChapter);
  renderSidebar();

  if ("serviceWorker" in navigator) {
    try { await navigator.serviceWorker.register("service-worker.js"); } catch (e) { console.warn("SW registration failed", e); }
  }
}

function bindUI() {
  el("settingsBtn").addEventListener("click", openSettings);
  el("closeSettings").addEventListener("click", () => el("settingsModal").classList.remove("open"));
  el("saveSettings").addEventListener("click", saveSettings);

  el("searchBtn").addEventListener("click", () => el("searchModal").classList.add("open"));
  el("closeSearch").addEventListener("click", () => el("searchModal").classList.remove("open"));
  el("searchInput").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const results = await searchAll(el("searchInput").value);
      renderSearchResults(results, el("searchInput").value);
    }
  });
  el("searchGo").addEventListener("click", async () => {
    const results = await searchAll(el("searchInput").value);
    renderSearchResults(results, el("searchInput").value);
  });

  el("newNoteBtn").addEventListener("click", () => openNoteEditor({ ref: state.notesPanelRef }));
  el("closeNoteEditor").addEventListener("click", closeNoteEditor);
  el("saveNoteBtn").addEventListener("click", saveNoteFromEditor);
  el("deleteNoteBtn").addEventListener("click", async () => {
    if (state.editingNoteId && confirm("Delete this note?")) {
      await DB.deleteNote(state.editingNoteId);
      closeNoteEditor();
      renderNotesPanelForRef(state.notesPanelRef);
    } else {
      closeNoteEditor();
    }
  });

  el("includeKeysCheckbox").addEventListener("change", (e) => {
    el("exportPassphraseWrap").classList.toggle("hidden", !e.target.checked);
  });

  el("exportBtn").addEventListener("click", exportData);
  el("importInput").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });

  el("orderSelectQuick").addEventListener("change", async (e) => {
    state.order = e.target.value;
    await DB.setSetting("order", state.order);
    renderSidebar();
  });

  el("bookJump").addEventListener("change", (e) => {
    if (e.target.value) navigateTo(e.target.value, 1);
  });

  el("toggleSidebarBtn").addEventListener("click", () => {
    el("sidebar").classList.toggle("open");
    el("notesPanel").classList.remove("open");
  });
  el("toggleNotesBtn").addEventListener("click", () => {
    el("notesPanel").classList.toggle("open");
    el("sidebar").classList.remove("open");
  });

  el("tabNotesBtn").addEventListener("click", () => switchPanelTab("notes"));
  el("tabCommentaryBtn").addEventListener("click", () => switchPanelTab("commentary"));
  el("commentarySourceSelect").addEventListener("change", async (e) => {
    state.commentarySource = e.target.value;
    await DB.setSetting("commentarySource", state.commentarySource);
    renderCommentaryPanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      el("settingsModal").classList.remove("open");
      el("searchModal").classList.remove("open");
      closeNoteEditor();
    }
  });
}

function populateBookJump() {
  const sel = el("bookJump");
  sel.innerHTML = `<option value="">Jump to book…</option>`;
  for (const b of BOOKS) {
    const opt = document.createElement("option");
    opt.value = b.code;
    opt.textContent = b.name;
    sel.appendChild(opt);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  populateBookJump();
  init();
});
