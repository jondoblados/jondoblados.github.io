# My Gospel Journey — Bible Study App

A personal, offline-friendly Bible study companion for your laptop, iPad, and iPhone.

## What's inside

- **Complete offline Bible text** — the full World English Bible (WEB), a public-domain
  translation, downloaded book-by-book into `bible/web/*.json` (66 files). This works with no
  internet connection and no API key, forever.
- **Live ESV / NIV / NLT** — when you add your own free API key in Settings, the app fetches
  that chapter live from the publisher and displays it instead of WEB. If you're offline or
  haven't added a key, it automatically falls back to the offline WEB text and tells you why.
- **Reading plans** — Chronological (default, a book-level approximation of when events/books
  occurred) or Canonical (Genesis → Revelation), with a progress tracker. Double-click any
  chapter chip in the sidebar to mark it read/unread.
- **Notes with Obsidian-style linking** — write notes on any verse or chapter. Use
  `[[John 3:16]]` to link to a passage, or `[[Faith]]` to link to a topic note (clicking creates
  it if it doesn't exist yet). Use `#tags` for themes. A Backlinks panel shows what links to the
  passage or topic you're viewing.
- **Bible commentary** — a Commentary tab next to Notes shows classic public-domain
  commentary (Matthew Henry and Adam Clarke) for the chapter you're reading, with a dropdown
  to switch between the two. See "Bible commentary" below for details.
- **Search** — full-text search across the complete offline WEB Bible and all your notes.
- **Works offline / installable** — includes a PWA manifest and service worker so you can "Add
  to Home Screen" on iPad/iPhone and keep using it without a connection.
- **Manual sync via OneDrive / Google Drive** — Settings → Export downloads a single JSON file
  with all your notes and progress. Save it into your Drive-synced folder, and Import it on
  your other device to bring everything across. (Automatic background sync isn't reliable
  across Safari/iOS/desktop, so export/import is the deliberate, dependable choice here.)

## Why ESV/NIV/NLT aren't bundled offline

Crossway (ESV) and Biblica (NIV) both license their text for personal, non-commercial use but
explicitly prohibit storing more than 500 verses, or half a book, of their translations locally
— see [api.esv.org](https://api.esv.org/) and Biblica's
[terms of use](https://www.biblica.com/terms-of-use/). API.Bible's own FAQ confirms this same
cap exists "to prevent apps from reproducing the entire Bible"
([care.api.bible](https://care.api.bible/article/405-express-licensing-faqs)). Bulk-downloading
either translation would violate those terms, so this app only ever fetches one chapter at a
time, live, using your own key, and caches it for at most 24 hours.

The WEB translation has no such restriction — it's dedicated to the public domain by its
translators ([ebible.org/publicdomain.htm](https://ebible.org/publicdomain.htm)), so it's
bundled here in full and always available offline.

## Bible commentary

The Commentary tab (next to Notes, in the right-hand panel) shows verse-by-verse notes from two
classic 18th/19th-century commentaries, pulled from the free, keyless
[Free Use Bible API](https://bible.helloao.org/docs/) at bible.helloao.org:

- **Matthew Henry** — *Matthew Henry Bible Commentary* (1706–1721). Covers 65 of 66 books
  (missing Song of Solomon).
- **Adam Clarke** — *Adam Clarke Bible Commentary* (1810–1826). Covers 57 of 66 books.

Both are dedicated to the public domain
([Creative Commons Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/)),
so no attribution is legally required — crediting them here and in the app is just good practice.

Unlike ESV/NIV/NLT, commentary requires **no API key** — it works out of the box. It's fetched
live per chapter the first time you view it, then cached indefinitely in the app's local database
(there's no publisher license limit forcing an expiry, since this text is public domain), so it
keeps working offline after that first fetch. If your chosen commentary doesn't cover a
particular book (e.g. Matthew Henry on Song of Solomon), the app automatically shows the other
commentary instead and tells you it did so. If a chapter has no verse-by-verse notes but the
source still wrote a chapter summary or book introduction, that's shown instead of leaving the
tab looking empty.

## Setting up your own API keys (free, a few minutes each)

1. **ESV** — sign up at [api.esv.org](https://api.esv.org/) for a free personal-use API token.
2. **NIV** — sign up at [api.bible/sign-up](https://api.bible/sign-up) (free "Starter" plan via
   API.Bible), then find the Bible ID for an NIV edition in your API.Bible dashboard and paste
   both the API key and that Bible ID into Settings.
3. **NLT** (optional) — the [api.nlt.to](https://api.nlt.to/) anonymous tier already works
   without a key (50 verses/request, 500 requests/day); register for a free key for higher
   limits (500 verses/request, 5,000 requests/day).

Paste whichever keys you have into **Settings** inside the app. You can add them at any time —
until you do, everything works fine on the offline WEB text.

## Installing on your devices

This app is a set of local files — no server or hosting required.

1. Put the whole `bible_app` folder into your OneDrive or Google Drive folder so it's synced
   across your laptop, iPad, and iPhone.
2. **On your laptop:** open `index.html` directly in **Safari** (recommended — Chrome enforces
   stricter restrictions on loading local files via `file://`, which can block the app from
   reading the local Bible JSON files or registering the offline service worker).
3. **On iPad/iPhone:** open `index.html` from the Files app (inside your synced Drive folder)
   using Safari. Tap the Share icon → **Add to Home Screen** to install it like a native app.
4. If you ever run into `file://` restrictions in your browser, you can instead serve the
   folder with any simple local web server (e.g. `python3 -m http.server` run from inside the
   `bible_app` folder, then visit `http://localhost:8000`) — this also enables the offline
   service worker cache.

## Keeping notes in sync across devices

Because each device keeps its own local notes database (for reliability), use **Settings →
Export** on your primary device, save the downloaded JSON file into the same Drive folder as
the app, and use **Settings → Import** on your other device(s) to merge it in. Repeat
periodically, or whenever you've added a batch of notes you want to carry over.

## Folder structure

```
bible_app/
  index.html            main interface
  style.css
  app.js                app logic: reader, notes, search, settings, sync
  db.js                 IndexedDB wrapper (notes, progress, settings, cache)
  bible-loader.js       WEB offline loader + ESV/NIV/NLT live loaders
  commentary-loader.js  Matthew Henry / Adam Clarke commentary loader (live, cached forever)
  bible-books.js        canonical + chronological book order & chapter counts
  manifest.webmanifest  PWA manifest ("Add to Home Screen")
  service-worker.js     offline caching (shell + WEB json) when served over http(s)
  icon.svg / icon-*.png app icon
  bible/web/*.json      66 files — the complete WEB Bible, one book per file
```
