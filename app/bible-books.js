// Book metadata for My Gospel Journey
// Canonical order matches standard Protestant Bible order (Genesis -> Revelation).
// Chronological order is a book-level approximation of when content/events occurred
// (a common simplification used by many "chronological" reading plans).

const BOOKS = [
  { code: "Gen", name: "Genesis", testament: "OT", chapters: 50 },
  { code: "Exod", name: "Exodus", testament: "OT", chapters: 40 },
  { code: "Lev", name: "Leviticus", testament: "OT", chapters: 27 },
  { code: "Num", name: "Numbers", testament: "OT", chapters: 36 },
  { code: "Deut", name: "Deuteronomy", testament: "OT", chapters: 34 },
  { code: "Josh", name: "Joshua", testament: "OT", chapters: 24 },
  { code: "Judg", name: "Judges", testament: "OT", chapters: 21 },
  { code: "Ruth", name: "Ruth", testament: "OT", chapters: 4 },
  { code: "1Sam", name: "1 Samuel", testament: "OT", chapters: 31 },
  { code: "2Sam", name: "2 Samuel", testament: "OT", chapters: 24 },
  { code: "1Kgs", name: "1 Kings", testament: "OT", chapters: 22 },
  { code: "2Kgs", name: "2 Kings", testament: "OT", chapters: 25 },
  { code: "1Chr", name: "1 Chronicles", testament: "OT", chapters: 29 },
  { code: "2Chr", name: "2 Chronicles", testament: "OT", chapters: 36 },
  { code: "Ezra", name: "Ezra", testament: "OT", chapters: 10 },
  { code: "Neh", name: "Nehemiah", testament: "OT", chapters: 13 },
  { code: "Esth", name: "Esther", testament: "OT", chapters: 10 },
  { code: "Job", name: "Job", testament: "OT", chapters: 42 },
  { code: "Ps", name: "Psalms", testament: "OT", chapters: 150 },
  { code: "Prov", name: "Proverbs", testament: "OT", chapters: 31 },
  { code: "Eccl", name: "Ecclesiastes", testament: "OT", chapters: 12 },
  { code: "Song", name: "Song of Solomon", testament: "OT", chapters: 8 },
  { code: "Isa", name: "Isaiah", testament: "OT", chapters: 66 },
  { code: "Jer", name: "Jeremiah", testament: "OT", chapters: 52 },
  { code: "Lam", name: "Lamentations", testament: "OT", chapters: 5 },
  { code: "Ezek", name: "Ezekiel", testament: "OT", chapters: 48 },
  { code: "Dan", name: "Daniel", testament: "OT", chapters: 12 },
  { code: "Hos", name: "Hosea", testament: "OT", chapters: 14 },
  { code: "Joel", name: "Joel", testament: "OT", chapters: 3 },
  { code: "Amos", name: "Amos", testament: "OT", chapters: 9 },
  { code: "Obad", name: "Obadiah", testament: "OT", chapters: 1 },
  { code: "Jonah", name: "Jonah", testament: "OT", chapters: 4 },
  { code: "Mic", name: "Micah", testament: "OT", chapters: 7 },
  { code: "Nah", name: "Nahum", testament: "OT", chapters: 3 },
  { code: "Hab", name: "Habakkuk", testament: "OT", chapters: 3 },
  { code: "Zeph", name: "Zephaniah", testament: "OT", chapters: 3 },
  { code: "Hag", name: "Haggai", testament: "OT", chapters: 2 },
  { code: "Zech", name: "Zechariah", testament: "OT", chapters: 14 },
  { code: "Mal", name: "Malachi", testament: "OT", chapters: 4 },
  { code: "Matt", name: "Matthew", testament: "NT", chapters: 28 },
  { code: "Mark", name: "Mark", testament: "NT", chapters: 16 },
  { code: "Luke", name: "Luke", testament: "NT", chapters: 24 },
  { code: "John", name: "John", testament: "NT", chapters: 21 },
  { code: "Acts", name: "Acts", testament: "NT", chapters: 28 },
  { code: "Rom", name: "Romans", testament: "NT", chapters: 16 },
  { code: "1Cor", name: "1 Corinthians", testament: "NT", chapters: 16 },
  { code: "2Cor", name: "2 Corinthians", testament: "NT", chapters: 13 },
  { code: "Gal", name: "Galatians", testament: "NT", chapters: 6 },
  { code: "Eph", name: "Ephesians", testament: "NT", chapters: 6 },
  { code: "Phil", name: "Philippians", testament: "NT", chapters: 4 },
  { code: "Col", name: "Colossians", testament: "NT", chapters: 4 },
  { code: "1Thess", name: "1 Thessalonians", testament: "NT", chapters: 5 },
  { code: "2Thess", name: "2 Thessalonians", testament: "NT", chapters: 3 },
  { code: "1Tim", name: "1 Timothy", testament: "NT", chapters: 6 },
  { code: "2Tim", name: "2 Timothy", testament: "NT", chapters: 4 },
  { code: "Titus", name: "Titus", testament: "NT", chapters: 3 },
  { code: "Phlm", name: "Philemon", testament: "NT", chapters: 1 },
  { code: "Heb", name: "Hebrews", testament: "NT", chapters: 13 },
  { code: "Jas", name: "James", testament: "NT", chapters: 5 },
  { code: "1Pet", name: "1 Peter", testament: "NT", chapters: 5 },
  { code: "2Pet", name: "2 Peter", testament: "NT", chapters: 3 },
  { code: "1John", name: "1 John", testament: "NT", chapters: 5 },
  { code: "2John", name: "2 John", testament: "NT", chapters: 1 },
  { code: "3John", name: "3 John", testament: "NT", chapters: 1 },
  { code: "Jude", name: "Jude", testament: "NT", chapters: 1 },
  { code: "Rev", name: "Revelation", testament: "NT", chapters: 22 }
];

// Canonical order is simply the array order above.
const CANONICAL_ORDER = BOOKS.map(b => b.code);

// Book-level chronological order (approximate order of events/composition).
const CHRONOLOGICAL_ORDER = [
  "Job", "Gen", "Exod", "Lev", "Num", "Deut",
  "Josh", "Judg", "Ruth", "1Sam", "2Sam", "Ps",
  "1Kgs", "1Chr", "2Chr", "2Kgs",
  "Prov", "Eccl", "Song",
  "Obad", "Joel", "Jonah", "Amos", "Hos",
  "Isa", "Mic", "Nah", "Zeph",
  "Jer", "Hab", "Lam", "Ezek", "Dan",
  "Ezra", "Esth", "Hag", "Zech", "Neh", "Mal",
  "Matt", "Mark", "Luke", "John", "Acts",
  "Jas", "Gal", "1Thess", "2Thess",
  "1Cor", "2Cor", "Rom",
  "Eph", "Phil", "Col", "Phlm",
  "1Tim", "Titus", "1Pet",
  "2Tim", "Heb", "2Pet", "Jude",
  "1John", "2John", "3John", "Rev"
];

const BOOKS_BY_CODE = Object.fromEntries(BOOKS.map(b => [b.code, b]));

const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
