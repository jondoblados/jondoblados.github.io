// IndexedDB wrapper for My Gospel Journey
// Stores: notes, progress (reading plan checkmarks), settings, cache (short-lived live-translation cache)

const DB_NAME = "gospel-journey";
const DB_VERSION = 2;

// Settings keys treated as secrets: excluded from a plain export, and only ever leave the
// device inside an AES-256-GCM encrypted blob if you explicitly opt in with a passphrase.
const SECRET_SETTING_KEYS = new Set(["esvApiKey", "apiBibleKey", "apiBibleNivId", "nltApiKey"]);

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("notes")) {
        const notes = db.createObjectStore("notes", { keyPath: "id" });
        notes.createIndex("byRef", "ref", { unique: false });
        notes.createIndex("byBook", "book", { unique: false });
        notes.createIndex("byTitle", "title", { unique: false });
      }
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "key" }); // key = "canonical:Gen:1" etc.
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "key" }); // short-lived live translation cache
      }
      if (!db.objectStoreNames.contains("commentary")) {
        db.createObjectStore("commentary", { keyPath: "key" }); // public-domain commentary, cached indefinitely
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let dbPromise = openDB();

async function tx(storeName, mode, fn) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const result = fn(store);
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const DB = {
  // ---- Notes ----
  async allNotes() {
    return tx("notes", "readonly", (store) => reqToPromise(store.getAll()));
  },
  async saveNote(note) {
    note.updatedAt = Date.now();
    if (!note.id) note.id = "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    if (!note.createdAt) note.createdAt = note.updatedAt;
    return tx("notes", "readwrite", (store) => reqToPromise(store.put(note))).then(() => note);
  },
  async deleteNote(id) {
    return tx("notes", "readwrite", (store) => reqToPromise(store.delete(id)));
  },
  async getNote(id) {
    return tx("notes", "readonly", (store) => reqToPromise(store.get(id)));
  },

  // ---- Progress ----
  async setProgress(planKey, bookCode, chapter, done) {
    const key = `${planKey}:${bookCode}:${chapter}`;
    if (done) {
      return tx("progress", "readwrite", (store) => reqToPromise(store.put({ key, done: true, at: Date.now() })));
    } else {
      return tx("progress", "readwrite", (store) => reqToPromise(store.delete(key)));
    }
  },
  async allProgress() {
    return tx("progress", "readonly", (store) => reqToPromise(store.getAll()));
  },

  // ---- Settings ----
  async getSetting(key, fallback) {
    const rec = await tx("settings", "readonly", (store) => reqToPromise(store.get(key)));
    return rec ? rec.value : fallback;
  },
  async setSetting(key, value) {
    return tx("settings", "readwrite", (store) => reqToPromise(store.put({ key, value })));
  },

  // ---- Cache (for live translations, chapter-scoped, expires) ----
  async cacheGet(key) {
    const rec = await tx("cache", "readonly", (store) => reqToPromise(store.get(key)));
    if (!rec) return null;
    if (Date.now() - rec.at > 1000 * 60 * 60 * 24) return null; // 24h freshness
    return rec.value;
  },
  async cacheSet(key, value) {
    return tx("cache", "readwrite", (store) => reqToPromise(store.put({ key, value, at: Date.now() })));
  },

  // ---- Commentary cache (public domain text — safe to keep indefinitely, unlike live translations) ----
  async commentaryGet(key) {
    const rec = await tx("commentary", "readonly", (store) => reqToPromise(store.get(key)));
    return rec ? rec.value : null;
  },
  async commentarySet(key, value) {
    return tx("commentary", "readwrite", (store) => reqToPromise(store.put({ key, value, at: Date.now() })));
  },

  // ---- Export / Import (for OneDrive / Google Drive folder sync) ----
  // API keys are NEVER included in a plain export. By default they are left out entirely
  // (each device keeps its own keys, entered once in Settings). If you explicitly opt in and
  // supply a passphrase, they are included but AES-256-GCM encrypted first (see crypto-utils.js)
  // so the file that lands in your Drive folder never contains them as plain text.
  async exportAll({ includeApiKeys = false, passphrase = null } = {}) {
    const [notes, progress, settingsAll] = await Promise.all([
      this.allNotes(),
      this.allProgress(),
      tx("settings", "readonly", (store) => reqToPromise(store.getAll()))
    ]);
    const secretSettings = settingsAll.filter((s) => SECRET_SETTING_KEYS.has(s.key));
    const safeSettings = settingsAll.filter((s) => !SECRET_SETTING_KEYS.has(s.key));

    const exportObj = {
      exportedAt: new Date().toISOString(),
      app: "my-gospel-journey",
      version: 2,
      notes,
      progress,
      settings: safeSettings
    };

    if (includeApiKeys && secretSettings.length) {
      if (!passphrase) throw new Error("A passphrase is required to include API keys in the export.");
      exportObj.encryptedKeys = await encryptJSON(secretSettings, passphrase);
    }

    return exportObj;
  },
  async importAll(data, { merge = true, passphrase = null } = {}) {
    if (!data || data.app !== "my-gospel-journey") throw new Error("Not a My Gospel Journey export file.");
    if (!merge) {
      await Promise.all([
        tx("notes", "readwrite", (store) => reqToPromise(store.clear())),
        tx("progress", "readwrite", (store) => reqToPromise(store.clear()))
      ]);
    }
    for (const n of data.notes || []) {
      await tx("notes", "readwrite", (store) => reqToPromise(store.put(n)));
    }
    for (const p of data.progress || []) {
      await tx("progress", "readwrite", (store) => reqToPromise(store.put(p)));
    }
    for (const s of data.settings || []) {
      await tx("settings", "readwrite", (store) => reqToPromise(store.put(s)));
    }
    if (data.encryptedKeys) {
      if (!passphrase) throw new Error("PASSPHRASE_REQUIRED");
      const secretSettings = await decryptJSON(data.encryptedKeys, passphrase);
      for (const s of secretSettings) {
        await tx("settings", "readwrite", (store) => reqToPromise(store.put(s)));
      }
    }
    return true;
  }
};
