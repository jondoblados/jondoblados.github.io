// Loads Bible text: the offline public-domain WEB translation (bundled per-book JSON),
// and live ESV / NIV / NLT translations via each publisher's own API using a key you provide
// in Settings. Live translations are only cached chapter-by-chapter and briefly, in line with
// each publisher's non-commercial personal-use terms (see README.md for the license notes).

const TRANSLATIONS = {
  WEB: { label: "WEB (offline, public domain)", offline: true },
  ESV: { label: "ESV — English Standard Version", offline: false },
  NIV: { label: "NIV — New International Version", offline: false },
  NLT: { label: "NLT — New Living Translation", offline: false }
};

const webBookCache = {}; // in-memory cache of full book JSON (already local, no license concern)

async function loadWebBook(code) {
  if (webBookCache[code]) return webBookCache[code];
  const res = await fetch(`bible/web/${code}.json`);
  if (!res.ok) throw new Error(`Could not load bible/web/${code}.json (${res.status})`);
  const data = await res.json();
  webBookCache[code] = data;
  return data;
}

async function getWebChapter(code, chapterNum) {
  const book = await loadWebBook(code);
  const chapter = book.chapters.find(c => c.chapter === chapterNum);
  if (!chapter) throw new Error(`Chapter ${chapterNum} not found in ${code}`);
  return chapter.verses.map(v => ({ verse: v.number, text: v.text }));
}

// ---- Live translations ----
// Each function returns [{verse, text}] for one chapter. Callers must not request/store more
// than one chapter at a time, and results are cached for 24h max (see db.js cacheGet/cacheSet)
// to stay well under each license's local-storage caps.

async function getEsvChapter(bookName, chapterNum) {
  const key = await DB.getSetting("esvApiKey");
  if (!key) throw new Error("NO_KEY:ESV");
  const cacheKey = `ESV:${bookName}:${chapterNum}`;
  const cached = await DB.cacheGet(cacheKey);
  if (cached) return cached;

  const query = encodeURIComponent(`${bookName} ${chapterNum}`);
  const url = `https://api.esv.org/v3/passage/text/?q=${query}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=true&include-passage-references=false`;
  const res = await fetch(url, { headers: { Authorization: `Token ${key}` } });
  if (!res.ok) throw new Error(`ESV API error ${res.status}`);
  const data = await res.json();
  const raw = (data.passages && data.passages[0]) || "";
  const verses = parseVerseNumberedText(raw);
  await DB.cacheSet(cacheKey, verses);
  return verses;
}

async function getNivChapter(bookId, chapterNum, osisBookCode) {
  const key = await DB.getSetting("apiBibleKey");
  const bibleId = await DB.getSetting("apiBibleNivId"); // the specific Bible ID for NIV on api.bible
  if (!key || !bibleId) throw new Error("NO_KEY:NIV");
  const cacheKey = `NIV:${osisBookCode}:${chapterNum}`;
  const cached = await DB.cacheGet(cacheKey);
  if (cached) return cached;

  const chapterId = `${osisBookCode}.${chapterNum}`;
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-verse-numbers=true`;
  const res = await fetch(url, { headers: { "api-key": key } });
  if (!res.ok) throw new Error(`API.Bible error ${res.status}`);
  const data = await res.json();
  const content = (data.data && data.data.content) || "";
  const verses = parseVerseNumberedText(content);
  await DB.cacheSet(cacheKey, verses);
  return verses;
}

async function getNltChapter(bookName, chapterNum) {
  const key = await DB.getSetting("nltApiKey"); // optional; anonymous works at lower limits
  const cacheKey = `NLT:${bookName}:${chapterNum}`;
  const cached = await DB.cacheGet(cacheKey);
  if (cached) return cached;

  const ref = encodeURIComponent(`${bookName} ${chapterNum}`);
  const keyParam = key ? `&key=${encodeURIComponent(key)}` : "";
  const url = `https://api.nlt.to/api/passages?ref=${ref}&version=NLT${keyParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NLT API error ${res.status}`);
  const html = await res.text();
  const verses = parseNltHtml(html);
  await DB.cacheSet(cacheKey, verses);
  return verses;
}

// Best-effort parser for "1 Text text text 2 More text" style plain text with leading verse numbers.
function parseVerseNumberedText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const parts = clean.split(/(?=\[?\b\d{1,3}\]?\s)/g).filter(Boolean);
  const verses = [];
  for (const part of parts) {
    const m = part.match(/^\[?(\d{1,3})\]?\s+(.*)$/);
    if (m) verses.push({ verse: parseInt(m[1], 10), text: m[2].trim() });
  }
  if (verses.length === 0 && clean) verses.push({ verse: 1, text: clean });
  return verses;
}

// Best-effort parser for NLT API's HTML response (verse numbers wrapped in <span class="vn">)
function parseNltHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  const verses = [];
  let currentVerse = null;
  let buffer = "";
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node;
  function flush() {
    if (currentVerse != null) verses.push({ verse: currentVerse, text: buffer.replace(/\s+/g, " ").trim() });
    buffer = "";
  }
  while ((node = walker.nextNode())) {
    if (node.nodeType === 1 && node.classList && node.classList.contains("vn")) {
      flush();
      currentVerse = parseInt(node.textContent.trim(), 10) || (currentVerse || 0) + 1;
    } else if (node.nodeType === 3) {
      buffer += node.textContent;
    }
  }
  flush();
  return verses.length ? verses : [{ verse: 1, text: div.textContent.replace(/\s+/g, " ").trim() }];
}

async function getChapter(translation, book, chapterNum) {
  if (translation === "WEB") return getWebChapter(book.code, chapterNum);
  if (translation === "ESV") return getEsvChapter(book.name, chapterNum);
  if (translation === "NIV") return getNivChapter(book.code, chapterNum, book.osis || book.code);
  if (translation === "NLT") return getNltChapter(book.name, chapterNum);
  throw new Error("Unknown translation: " + translation);
}
