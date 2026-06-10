const { put, get, list, head } = require("@vercel/blob");

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

function parseBlobMaster(text) {
  const data = JSON.parse(text);
  return {
    ...data,
    version: data.version || 0,
    store: "blob",
  };
}

async function readBlobMaster() {
  const authOpts = blobAuthOpts();
  const opts = { ...authOpts, access: "private", useCache: false };
  try {
    let meta = null;
    try {
      meta = await head(MASTER_PATH, opts);
    } catch (_) {
      const ls = await list({ prefix: "vianne", limit: 20, ...authOpts });
      meta =
        (ls.blobs || []).find((b) => b.pathname === MASTER_PATH) ||
        (ls.blobs || [])[0] ||
        null;
    }
    if (meta && meta.url) {
      const hit = await get(meta.url, opts);
      if (hit && hit.blob) return parseBlobMaster(await hit.blob.text());
    }
    const hit = await get(MASTER_PATH, opts);
    if (!hit || !hit.blob) return null;
    return parseBlobMaster(await hit.blob.text());
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
  const putResult = await put(MASTER_PATH, JSON.stringify(master), {
    ...blobAuthOpts(),
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  let saved = master.events;
  try {
    const hit = await get(putResult.url, { ...blobAuthOpts(), access: "private", useCache: false });
    if (hit && hit.blob) saved = parseBlobMaster(await hit.blob.text()).events || saved;
  } catch (_) {}
  return {
    version: master.version,
    updatedAt: master.updatedAt,
    events: saved,
    store: "blob",
  };
}

module.exports = {
  isBlobConfigured,
  loadFromBlob,
  saveToBlob,
};
