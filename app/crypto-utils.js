// Small Web Crypto helper used only to optionally encrypt API keys before they are
// included in the export/sync JSON file (the file you'd place in OneDrive/Google Drive).
// Uses AES-256-GCM with a key derived from your passphrase via PBKDF2 (150,000 rounds).
// Nothing here ever sends your passphrase or keys anywhere — it all runs locally in the browser.

function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveAesKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptJSON(obj, passphrase) {
  if (!passphrase) throw new Error("A passphrase is required to encrypt.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
  return { salt: bufToB64(salt), iv: bufToB64(iv), ciphertext: bufToB64(ciphertext) };
}

async function decryptJSON(payload, passphrase) {
  const salt = b64ToBuf(payload.salt);
  const iv = b64ToBuf(payload.iv);
  const key = await deriveAesKey(passphrase, salt);
  const ciphertextBuf = b64ToBuf(payload.ciphertext);
  let plainBuf;
  try {
    plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertextBuf);
  } catch (e) {
    throw new Error("Wrong passphrase, or the file is corrupted.");
  }
  return JSON.parse(new TextDecoder().decode(plainBuf));
}
