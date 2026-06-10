const { put, get, list, head } = require("@vercel/blob");
const { mergeEvents, applyDeletedEvents } = require("./merge-events");

const MASTER_PATH = "vianne-master.json";
const POINTER_PATH = "vianne-pointer.txt";
let _lastSavedMaster = null;

function normalizeStoreId(storeId) {
  if (!storeId) return "";
  return storeId.startsWith("store_") ? storeId.slice("store_".length) : storeId;
}

function isBlobConfigured() {
  return !!(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    (process.env.VERCEL === "1" && process.env.VERCEL_OIDC_TOKEN)
  );
}

function blobAuthOpts() {
  const opts = { access: "public" };
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    opts.token = process.env.BLOB_READ_WRITE_TOKEN;
    opts.access = "private";
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

async function readPublicPath(pathname) {
  const raw = process.env.BLOB_STORE_ID;
  if (!raw) return null;
  const sid = normalizeStoreId(raw);
  const urls = [`https://${sid}.public.blob.vercel-storage.com/${pathname}`];
  if (!String(raw).startsWith("store_")) {
    urls.push(`https://store_${sid}.public.blob.vercel-storage.com/${pathname}`);
  }
  urls.push(`https://${raw}.public.blob.vercel-storage.com/${pathname}`);
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) continue;
      return await res.text();
    } catch (_) {}
  }
  return null;
}

async function readViaPublicUrl() {
  const ptr = await readPublicPath(POINTER_PATH);
  if (ptr && ptr.startsWith("http")) {
    try {
      const res = await fetch(ptr.trim(), { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text && text[0] === "{") return parseBlobMaster(text);
      }
    } catch (_) {}
  }
  const text = await readPublicPath(MASTER_PATH);
  if (!text || text[0] !== "{") return null;
  return parseBlobMaster(text);
}

async function readBlobMasterSdk() {
  const authOpts = blobAuthOpts();
  const opts = { ...authOpts, useCache: false };
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

async function readBlobMaster() {
  const fromPublic = await readViaPublicUrl();
  if (fromPublic) return fromPublic;
  try {
    const fromSdk = await readBlobMasterSdk();
    if (fromSdk) return fromSdk;
  } catch (e) {
    console.warn("blob sdk read", e.message);
  }
  return _lastSavedMaster;
}

async function loadFromBlob() {
  if (!isBlobConfigured()) return null;
  try {
    return await readBlobMaster();
  } catch (e) {
    console.warn("blob load", e.message);
    return _lastSavedMaster;
  }
}

async function saveToBlob(payload) {
  const prev = (await readBlobMaster()) || { version: 0, events: [] };
  const eventsIn = Array.isArray(payload.events) ? payload.events : [];
  const deleted = Array.isArray(payload.deletedEvents) ? payload.deletedEvents : [];
  let merged = mergeEvents(prev.events || [], eventsIn);
  merged = applyDeletedEvents(merged, deleted);
  const version = (prev.version || 0) + 1;
  const now = new Date().toISOString();
  const master = {
    version,
    updatedAt: now,
    events: merged.map((ev) => ({
      ...ev,
      syncedAt: now,
    })),
    users: payload.users != null ? payload.users : prev.users || null,
    currency: payload.currency != null ? payload.currency : prev.currency || null,
    store: "blob",
  };
  const putResult = await put(MASTER_PATH, JSON.stringify(master), {
    ...blobAuthOpts(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  try {
    await put(POINTER_PATH, putResult.url, {
      ...blobAuthOpts(),
      contentType: "text/plain",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (_) {}
  _lastSavedMaster = master;
  let saved = master.events;
  try {
    const hit = await get(putResult.url, { ...blobAuthOpts(), useCache: false });
    if (hit && hit.blob) saved = parseBlobMaster(await hit.blob.text()).events || saved;
  } catch (_) {
    const verify = await readViaPublicUrl();
    if (verify && verify.events) saved = verify.events;
  }
  return {
    version: master.version,
    updatedAt: master.updatedAt,
    events: saved,
    users: master.users,
    store: "blob",
  };
}

module.exports = {
  isBlobConfigured,
  loadFromBlob,
  saveToBlob,
};
