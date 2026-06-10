const { put, list } = require("@vercel/blob");

const MASTER_PATH = "vianne-master.json";

function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

async function loadFromBlob() {
  if (!isBlobConfigured()) return null;
  try {
    const { blobs } = await list({
      prefix: MASTER_PATH,
      limit: 1,
      token: blobToken(),
    });
    if (!blobs.length) return null;
    const res = await fetch(blobs[0].url, {
      cache: "no-store",
      headers: { Authorization: "Bearer " + blobToken() },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...data,
      version: data.version || 0,
      store: "blob",
    };
  } catch (e) {
    console.warn("blob load", e.message);
    return null;
  }
}

async function saveToBlob(payload) {
  if (!isBlobConfigured()) return null;
  const prev = (await loadFromBlob()) || { version: 0 };
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
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: blobToken(),
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
