// Loads classic Bible commentary from the Free Use Bible API (https://bible.helloao.org/docs/) —
// no API key, no rate limits. Matthew Henry and Adam Clarke are both fully public domain
// (Creative Commons Public Domain Mark 1.0), so unlike ESV/NIV/NLT there is no license reason to
// limit caching: once a chapter's commentary is fetched, it's cached indefinitely in IndexedDB
// (see DB.commentaryGet/commentarySet) so it keeps working offline after the first successful view.

const COMMENTARY_API_BASE = "https://bible.helloao.org/api/c";

const COMMENTARIES = {
  "matthew-henry": {
    label: "Matthew Henry",
    fullName: "Matthew Henry Bible Commentary (1706\u20131721)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  "adam-clarke": {
    label: "Adam Clarke",
    fullName: "Adam Clarke Bible Commentary (1810\u20131826)",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/"
  }
};

// Maps this app's internal book codes (bible-books.js) to the API's USX-style book IDs.
const COMMENTARY_BOOK_CODE = {
  Gen: "GEN", Exod: "EXO", Lev: "LEV", Num: "NUM", Deut: "DEU", Josh: "JOS", Judg: "JDG",
  Ruth: "RUT", "1Sam": "1SA", "2Sam": "2SA", "1Kgs": "1KI", "2Kgs": "2KI", "1Chr": "1CH",
  "2Chr": "2CH", Ezra: "EZR", Neh: "NEH", Esth: "EST", Job: "JOB", Ps: "PSA", Prov: "PRO",
  Eccl: "ECC", Song: "SNG", Isa: "ISA", Jer: "JER", Lam: "LAM", Ezek: "EZK", Dan: "DAN",
  Hos: "HOS", Joel: "JOL", Amos: "AMO", Obad: "OBA", Jonah: "JON", Mic: "MIC", Nah: "NAM",
  Hab: "HAB", Zeph: "ZEP", Hag: "HAG", Zech: "ZEC", Mal: "MAL", Matt: "MAT", Mark: "MRK",
  Luke: "LUK", John: "JHN", Acts: "ACT", Rom: "ROM", "1Cor": "1CO", "2Cor": "2CO", Gal: "GAL",
  Eph: "EPH", Phil: "PHP", Col: "COL", "1Thess": "1TH", "2Thess": "2TH", "1Tim": "1TI",
  "2Tim": "2TI", Titus: "TIT", Phlm: "PHM", Heb: "HEB", Jas: "JAS", "1Pet": "1PE",
  "2Pet": "2PE", "1John": "1JN", "2John": "2JN", "3John": "3JN", Jude: "JUD", Rev: "REV"
};

// Fetches one chapter's raw commentary JSON from the API, cached forever (public domain text).
// Distinguishes "this source genuinely doesn't cover this book" (HTTP 404) from "we couldn't
// reach the network right now" (offline / connection failure) so the UI can be honest about which
// happened, instead of always claiming a coverage gap.
async function fetchCommentaryChapterRaw(sourceId, apiBookCode, chapterNum) {
  const cacheKey = `commentary:${sourceId}:${apiBookCode}:${chapterNum}`;
  const cached = await DB.commentaryGet(cacheKey);
  if (cached) return cached;

  const url = `${COMMENTARY_API_BASE}/${sourceId}/${apiBookCode}/${chapterNum}.json`;
  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    throw new Error("NETWORK_ERROR");
  }
  if (!res.ok) {
    throw new Error(res.status === 404 ? "NOT_COVERED" : `FETCH_FAILED:${res.status}`);
  }
  const data = await res.json();
  await DB.commentarySet(cacheKey, data);
  return data;
}

// Groups the API's verse-note array into display ranges, using the actual number of verses in
// the chapter (from the Bible text currently on screen) to cap the final range correctly, since
// the commentary API's own verse count reflects note count, not the chapter's real verse count.
function groupCommentaryContent(content, totalVersesInChapter) {
  const notes = (content || []).filter((item) => item.type === "verse");
  const ranges = [];
  for (let i = 0; i < notes.length; i++) {
    const start = notes[i].number;
    const nextStart = i + 1 < notes.length ? notes[i + 1].number : null;
    const end = nextStart ? nextStart - 1 : (totalVersesInChapter || start);
    const paragraphs = (notes[i].content || [])
      .join("\n")
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    ranges.push({ verseStart: start, verseEnd: Math.max(start, end), paragraphs });
  }
  return ranges;
}

// Returns { source, ranges, chapterIntro, bookIntro, fallbackFrom?, fallbackReason? } for one
// chapter, trying `sourceId` first and falling back to `fallbackSourceId` (if given) when the
// primary source fails. `fallbackReason` is "not_covered" (real 404 — the source genuinely
// lacks this book) or "unavailable" (network/offline/server error — not a coverage gap), so the
// UI can be honest about which happened rather than always blaming a coverage gap.
async function getCommentaryForChapter(sourceId, book, chapterNum, totalVersesInChapter, fallbackSourceId) {
  const apiBookCode = COMMENTARY_BOOK_CODE[book.code];
  if (!apiBookCode) throw new Error("NOT_COVERED");

  const trySource = async (id) => {
    const data = await fetchCommentaryChapterRaw(id, apiBookCode, chapterNum);
    const ranges = groupCommentaryContent(data.chapter.content, totalVersesInChapter);
    // Chapter-level argument/summary (distinct from the book's overall introduction). Some
    // chapters (e.g. Adam Clarke on Song of Solomon) have no per-verse notes at all but do have
    // this chapter summary — show it so the chapter doesn't look empty when it isn't.
    const chapterIntro = data.chapter && data.chapter.introduction ? data.chapter.introduction.trim() : "";
    const bookIntro = chapterNum === 1 && data.book && data.book.introduction ? data.book.introduction.trim() : "";
    return { source: id, ranges, chapterIntro, bookIntro };
  };

  try {
    return await trySource(sourceId);
  } catch (err) {
    if (fallbackSourceId && fallbackSourceId !== sourceId) {
      const result = await trySource(fallbackSourceId);
      result.fallbackFrom = sourceId;
      result.fallbackReason = err.message === "NOT_COVERED" ? "not_covered" : "unavailable";
      return result;
    }
    throw err;
  }
}
