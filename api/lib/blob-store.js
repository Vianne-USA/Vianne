const { put, get } = require("@vercel/blob");

const MASTER_PATH = "vianne-master.json";

function isBlobConfigured() {
  return !!(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    (process.env.VERCEL === "1" && process.env.VERCEL_OIDC_TOKEN)
  );
}

function blobAuthOpts() {
  const opts = { access: "private" };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    opts.token = process.env.BLOB_READ_WRITE_TOKEN;
  }
  const storeId = process.env.BLOB_STORE_ID;
  if (storeId) {
    opts.storeId = storeId.startsWith("store_") ? storeId : storeId;
  }
  return opts;
}

async function readBlobMaster() {
  try {
    const hit = await get(MASTER_PATH, { ...blobAuthOpts(), useCache: false });
    if (!hit || !hit.blob) return null;
    const text = await hit.blob.text();
    const data = JSON.parse(text);
    return {
      ...data,
      version: data.version || 0,
      store: "blob",
    };
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    if (msg.includes("404") || msg.includes("not found") || msg.includes("Not Found")) {
      return null;
    }
    throw e;
  }
}

async function loadFromBlob() {
  if (!isBlobConfigured()) return null;
  try {
    return await readBlobMaster();
  } catch (e) {
    console.warn("blob load", e.message);
    return null;
  }
}

async function saveToBlob(payload) {
  let prev = { version: 0 };
  try {
    const existing = await readBlobMaster();
    if (existing) prev = existing;
  } catch (_) {}
  const eventsIn = Array.isArray(payload.events) ? payload.events : [];
  const version = (prev.version || 0) + 1;
  const master = {
    version,
    updatedAt: new Date().toISOString(),
    events: eventsIn.map((ev) => ({
      ...ev,
      syncedAt: new Date().toISOString(),
    })),
    users: payload.users != null ? payload.users : prev.users || null,
    currency: payload.currency != null ? payload.currency : prev.currency || null,
    store: "blob",
  };
  await put(MASTER_PATH, JSON.stringify(master), {
    ...blobAuthOpts(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return {
    version: master.version,
    updatedAt: master.updatedAt,
    events: master.events,
    store: "blob",
  };
}

module.exports = {
  isBlobConfigured,
  loadFromBlob,
  saveToBlob,
};
