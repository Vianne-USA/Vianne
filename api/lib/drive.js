const crypto = require("crypto");
const { mergeEvents, applyDeletedEvents } = require("./merge-events");

const { normalizeCurrencyRates } = require("./currency-rates");

const MASTER_NAME = "vianne-master.json";
const SCOPES = "https://www.googleapis.com/auth/drive";
const DRIVE_FLAGS = "supportsAllDrives=true&includeItemsFromAllDrives=true";

function withDriveFlags(path) {
  return path + (path.includes("?") ? "&" : "?") + DRIVE_FLAGS;
}

function driveErrorMessage(err) {
  const msg = String(err && err.message ? err.message : err);
  if (msg.includes("storage quota") || msg.includes("Service Accounts do not have")) {
    return (
      "Google Drive folder must be inside a Shared Drive (Google Workspace), not My Drive. " +
      "Create a Shared Drive, add the Vianne folder there, share it with the service account, " +
      "and update GOOGLE_DRIVE_FOLDER_ID in Vercel."
    );
  }
  return msg.slice(0, 400);
}

function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function rootFolderId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID || "";
}

function isConfigured() {
  return !!(credentials() && rootFolderId());
}

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let tokenCache = { token: null, exp: 0 };

async function accessToken() {
  const cred = credentials();
  if (!cred) throw new Error("Google service account not configured");

  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.exp > now + 60) return tokenCache.token;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signInput = header + "." + claim;
  const sign = crypto
    .createSign("RSA-SHA256")
    .update(signInput)
    .sign(cred.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const jwt = signInput + "." + sign;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" +
      jwt,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Token failed");
  tokenCache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

async function drive(path, opts = {}) {
  const token = await accessToken();
  const res = await fetch("https://www.googleapis.com/drive/v3" + withDriveFlags(path), {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: "Bearer " + token,
      ...(opts.body && typeof opts.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text.slice(0, 300));
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("json")) return res.json();
  return null;
}

async function driveUpload(url, body, contentType, method) {
  const token = await accessToken();
  const uploadUrl = url.includes("supportsAllDrives=")
    ? url
    : url + (url.includes("?") ? "&" : "?") + "supportsAllDrives=true";
  const res = await fetch(uploadUrl, {
    method: method || "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": contentType,
    },
    body,
  });
  if (!res.ok) throw new Error((await res.text()).slice(0, 300));
  return res.json();
}

function escQ(s) {
  return String(s).replace(/'/g, "\\'");
}

async function findFile(name, parentId) {
  let q =
    "name='" +
    escQ(name) +
    "' and trashed=false and '" +
    parentId +
    "' in parents";
  const r = await drive(
    "/files?q=" + encodeURIComponent(q) + "&fields=files(id,name,mimeType,modifiedTime)"
  );
  return (r.files && r.files[0]) || null;
}

async function findFolder(name, parentId) {
  let q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    escQ(name) +
    "' and trashed=false and '" +
    parentId +
    "' in parents";
  const r = await drive("/files?q=" + encodeURIComponent(q) + "&fields=files(id,name)");
  return (r.files && r.files[0]) || null;
}

async function createFolder(name, parentId) {
  const hit = await findFolder(name, parentId);
  if (hit) return hit;
  return drive("/files", {
    method: "POST",
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
}

async function downloadJson(fileId) {
  const token = await accessToken();
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      fileId +
      "?" +
      DRIVE_FLAGS +
      "&alt=media",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!res.ok) throw new Error((await res.text()).slice(0, 200));
  return res.json();
}

async function downloadBinary(fileId) {
  const token = await accessToken();
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      fileId +
      "?" +
      DRIVE_FLAGS +
      "&alt=media",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!res.ok) throw new Error((await res.text()).slice(0, 200));
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

function invHistKeyServer(h) {
  return (h && h.id) || ((h && h.fileName) || "") + "|" + ((h && h.date) || "");
}

async function resolveEventFolderId(eventId) {
  const prev = await loadMasterData();
  let ev = (prev?.events || []).find((e) => e && e.id === eventId);
  if (!ev) throw new Error("Event not found: " + eventId);
  ev = await hydrateEventFromFolder(ev);
  if (!ev.driveFolderId) throw new Error("Event has no Drive folder");
  return { ev, folderId: ev.driveFolderId };
}

async function listInventorySpreadsheets(folderId) {
  const q =
    "'" +
    folderId +
    "' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder' and mimeType!='application/json' and (mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.ms-excel' or name contains '.xlsx' or name contains '.xls')";
  const r = await drive(
    "/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc&pageSize=20"
  );
  return (r.files || []).filter(
    (f) => f && f.name && f.name !== "event-data.json" && !f.name.endsWith(".json")
  );
}

async function downloadInventoryFileForEvent(eventId, fileId) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  if (!eventId || !fileId) throw new Error("eventId and fileId required");
  const { folderId } = await resolveEventFolderId(eventId);
  const hit = await findFileById(fileId);
  if (!hit || !hit.id) throw new Error("Inventory file not found");
  if (hit.trashed) throw new Error("Inventory file was deleted");
  const parents = hit.parents || [];
  if (!parents.includes(folderId)) {
    throw new Error("Inventory file does not belong to this event");
  }
  return downloadBinary(fileId);
}

async function downloadLatestInventoryForEvent(eventId) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  const { folderId } = await resolveEventFolderId(eventId);
  const files = await listInventorySpreadsheets(folderId);
  if (!files.length) throw new Error("No inventory spreadsheet found in event folder");
  return downloadBinary(files[0].id);
}

const PRODUCT_IMAGES_FOLDER = "product-images";

function safeProductImageName(productId) {
  const safeId = String(productId || "")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_");
  if (!safeId) throw new Error("Invalid product id");
  return safeId + ".jpg";
}

async function getOrCreateProductImagesFolder(eventFolderId) {
  return createFolder(PRODUCT_IMAGES_FOLDER, eventFolderId);
}

async function uploadBinaryUpsert(name, buffer, parentId, mimeType, existingId) {
  const safeName = String(name || "file.bin").replace(/[\\/:*?"<>|]/g, "_");
  const boundary = "viannebin" + Date.now();
  const meta = existingId
    ? JSON.stringify({ name: safeName, mimeType: mimeType || "application/octet-stream" })
    : JSON.stringify({
        name: safeName,
        mimeType: mimeType || "application/octet-stream",
        parents: [parentId],
      });
  const prelude =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    meta +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    (mimeType || "application/octet-stream") +
    "\r\n\r\n";
  const epilogue = "\r\n--" + boundary + "--";
  const body = Buffer.concat([
    Buffer.from(prelude),
    Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
    Buffer.from(epilogue),
  ]);
  if (existingId) {
    const url =
      "https://www.googleapis.com/upload/drive/v3/files/" +
      existingId +
      "?uploadType=multipart";
    return driveUpload(url, body, "multipart/related; boundary=" + boundary, "PATCH");
  }
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

async function uploadProductImageBuffer(productId, buffer, imagesFolderId) {
  const fileName = safeProductImageName(productId);
  const existing = await findFile(fileName, imagesFolderId);
  return uploadBinaryUpsert(
    fileName,
    buffer,
    imagesFolderId,
    "image/jpeg",
    existing && existing.id
  );
}

async function uploadProductImagesForEvent(eventId, images) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  if (!eventId || !Array.isArray(images) || !images.length) {
    throw new Error("eventId and images required");
  }
  const root = rootFolderId();
  const prev = await loadMasterData();
  let ev = (prev?.events || []).find((e) => e && e.id === eventId);
  if (!ev) throw new Error("Event not found: " + eventId);
  ev = await hydrateEventFromFolder(ev);
  let folderId = ev.driveFolderId;
  if (folderId) {
    try {
      await drive("/files/" + folderId + "?fields=id,trashed");
    } catch (e) {
      folderId = null;
    }
  }
  if (!folderId) {
    const folder = await createFolder((ev.name || ev.id || "Event").trim(), root);
    folderId = folder.id;
  }
  const imagesFolder = await getOrCreateProductImagesFolder(folderId);
  let uploaded = 0;
  for (const img of images) {
    if (!img || !img.id || !img.data) continue;
    try {
      const buf = Buffer.from(img.data, "base64");
      if (!buf.length) continue;
      await uploadProductImageBuffer(img.id, buf, imagesFolder.id);
      uploaded += 1;
    } catch (e) {
      console.warn("Product image upload failed", img.id, e.message);
    }
  }
  return { uploaded, total: images.length, folderId: imagesFolder.id, eventFolderId: folderId };
}

async function downloadProductImageForEvent(eventId, productId) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  if (!eventId || !productId) throw new Error("eventId and product id required");
  const { folderId } = await resolveEventFolderId(eventId);
  const imagesFolder = await getOrCreateProductImagesFolder(folderId);
  const fileName = safeProductImageName(productId);
  const hit = await findFile(fileName, imagesFolder.id);
  if (!hit || !hit.id) throw new Error("Product image not found");
  return downloadBinary(hit.id);
}

async function findFileById(fileId) {
  return drive("/files/" + fileId + "?fields=id,name,parents,trashed,mimeType");
}

async function uploadJson(name, data, parentId, existingId) {
  const meta = existingId
    ? { name, mimeType: "application/json" }
    : { name, mimeType: "application/json", parents: [parentId] };
  const boundary = "vianne" + Date.now();
  const body =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: application/json\r\n\r\n" +
    JSON.stringify(data, null, 2) +
    "\r\n--" +
    boundary +
    "--";
  if (existingId) {
    const url =
      "https://www.googleapis.com/upload/drive/v3/files/" +
      existingId +
      "?uploadType=multipart";
    return driveUpload(url, body, "multipart/related; boundary=" + boundary, "PATCH");
  }
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

async function renameFile(fileId, newName) {
  return drive("/files/" + fileId, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });
}

function slimEventForMaster(ev) {
  const inv = ev.inv || [];
  return {
    id: ev.id,
    name: ev.name,
    loc: ev.loc,
    start: ev.start,
    end: ev.end,
    status: ev.status,
    color: ev.color,
    driveFolderId: ev.driveFolderId,
    driveFileId: ev.driveFileId,
    syncedAt: ev.syncedAt,
    localUpdatedAt: ev.localUpdatedAt,
    invCount: inv.length,
    salesCount: (ev.sales || []).length,
    leadsCount: (ev.leads || []).length,
    invHistory: ev.invHistory || [],
  };
}

async function hydrateEventFromFolder(ev) {
  if (!ev || !ev.driveFolderId) return ev;
  try {
    const existing = await findFile("event-data.json", ev.driveFolderId);
    if (!existing) return ev;
    const full = await downloadJson(existing.id);
    const masterInv = (ev.inv && ev.inv.length) || 0;
    const folderInv = (full.inv && full.inv.length) || 0;
    if (folderInv >= masterInv) {
      return {
        ...full,
        ...ev,
        inv: full.inv || ev.inv || [],
        sales: (full.sales && full.sales.length) ? full.sales : ev.sales || [],
        leads: (full.leads && full.leads.length) ? full.leads : ev.leads || [],
        memos: full.memos || ev.memos || [],
        audits: full.audits || ev.audits || [],
        invHistory: (full.invHistory && full.invHistory.length)
          ? full.invHistory
          : ev.invHistory || [],
        driveFolderId: ev.driveFolderId || full.driveFolderId,
        driveFileId: ev.driveFileId || full.driveFileId,
      };
    }
  } catch (e) {
    console.warn("Event folder hydrate failed", ev.name, e.message);
  }
  return ev;
}

async function loadMasterData() {
  if (!isConfigured()) return null;
  const root = rootFolderId();
  const master = await findFile(MASTER_NAME, root);
  if (!master) {
    return {
      version: 0,
      updatedAt: null,
      events: [],
      users: null,
      currency: null,
      masterFileId: null,
    };
  }
  const data = await downloadJson(master.id);
  const deletedEventIds = Array.isArray(data.deletedEventIds) ? data.deletedEventIds : [];
  const deletedIds = new Set(deletedEventIds);
  const events = Array.isArray(data.events)
    ? data.events.filter((e) => e && !deletedIds.has(e.id))
    : [];
  const hydrated = await Promise.all(events.map((ev) => hydrateEventFromFolder(ev)));
  return {
    ...data,
    events: hydrated,
    deletedEventIds,
    masterFileId: master.id,
    version: data.version || 0,
  };
}

async function uploadBinary(name, buffer, parentId, mimeType) {
  const safeName = String(name || "inventory.xlsx").replace(/[\\/:*?"<>|]/g, "_");
  const existing = await findFile(safeName, parentId);
  const finalName = existing
    ? new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + "_" + safeName
    : safeName;
  const boundary = "viannebin" + Date.now();
  const meta = JSON.stringify({
    name: finalName,
    mimeType: mimeType || "application/octet-stream",
    parents: [parentId],
  });
  const prelude =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    meta +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    (mimeType || "application/octet-stream") +
    "\r\n\r\n";
  const epilogue = "\r\n--" + boundary + "--";
  const body = Buffer.concat([
    Buffer.from(prelude),
    Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
    Buffer.from(epilogue),
  ]);
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

function mimeForFileName(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (n.endsWith(".xls")) return "application/vnd.ms-excel";
  if (n.endsWith(".csv")) return "text/csv";
  return "application/octet-stream";
}

const INVOICES_FOLDER = "Invoices";

function safeDriveName(name, fallback) {
  return String(name || fallback || "file")
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim()
    .slice(0, 180);
}

async function uploadHtml(name, html, parentId, existingId) {
  const safeName = safeDriveName(name, "receipt.html");
  const meta = existingId
    ? { name: safeName, mimeType: "text/html" }
    : { name: safeName, mimeType: "text/html", parents: [parentId] };
  const boundary = "viannehtml" + Date.now();
  const body =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" +
    String(html || "") +
    "\r\n--" +
    boundary +
    "--";
  if (existingId) {
    const url =
      "https://www.googleapis.com/upload/drive/v3/files/" +
      existingId +
      "?uploadType=multipart";
    return driveUpload(url, body, "multipart/related; boundary=" + boundary, "PATCH");
  }
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

async function uploadReceiptToDrive({ eventName, receiptId, html }) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  if (!html) throw new Error("Receipt HTML required");
  const root = rootFolderId();
  const invoicesRoot = await createFolder(INVOICES_FOLDER, root);
  const eventFolder = await createFolder(
    safeDriveName(eventName, "Event"),
    invoicesRoot.id
  );
  const fileName = safeDriveName(receiptId, "receipt") + ".html";
  const existing = await findFile(fileName, eventFolder.id);
  const file = await uploadHtml(
    fileName,
    html,
    eventFolder.id,
    existing && existing.id
  );
  return {
    driveFileId: file.id,
    driveFileName: file.name || fileName,
    driveFolderId: eventFolder.id,
    invoicesFolderId: invoicesRoot.id,
    path: INVOICES_FOLDER + "/" + safeDriveName(eventName, "Event") + "/" + fileName,
  };
}

async function uploadInventoryFilesToFolder(ev, folderId, files) {
  if (!files || !files.length) return ev;
  const uploaded = [];
  for (const f of files) {
    if (!f || !f.contentBase64) continue;
    try {
      const buf = Buffer.from(f.contentBase64, "base64");
      if (!buf.length) continue;
      const file = await uploadBinary(
        f.fileName || "inventory.xlsx",
        buf,
        folderId,
        f.mimeType || mimeForFileName(f.fileName)
      );
      uploaded.push({
        fileName: f.fileName,
        driveFileId: file.id,
        driveFileName: file.name,
      });
    } catch (e) {
      console.warn("Inventory file upload failed", f.fileName, e.message);
    }
  }
  if (!uploaded.length || !Array.isArray(ev.invHistory)) return ev;
  const used = new Set();
  const invHistory = ev.invHistory.map((h) => {
    if (h.driveFileId) return h;
    const hit = uploaded.find((u) => u.fileName === h.fileName && !used.has(u.driveFileId));
    if (!hit) return h;
    used.add(hit.driveFileId);
    return {
      ...h,
      driveFileId: hit.driveFileId,
      driveFileName: hit.driveFileName,
      driveSyncedAt: new Date().toISOString(),
    };
  });
  return { ...ev, invHistory };
}

async function syncEventFolder(ev, root, inventoryFiles) {
  const folderName = (ev.name || ev.id || "Event").trim();
  let folderId = ev.driveFolderId;
  if (folderId) {
    try {
      await drive("/files/" + folderId + "?fields=id,trashed");
    } catch (e) {
      folderId = null;
    }
  }
  if (!folderId) {
    const folder = await createFolder(folderName, root);
    folderId = folder.id;
  }
  const payload = {
    ...ev,
    driveFolderId: folderId,
    syncedAt: new Date().toISOString(),
  };
  const filesForEvent = (inventoryFiles || []).filter((f) => f.eventId === ev.id);
  let withFiles =
    filesForEvent.length > 0
      ? await uploadInventoryFilesToFolder(payload, folderId, filesForEvent)
      : payload;
  const existing = await findFile("event-data.json", folderId);
  if (existing) {
    try {
      const prev = await downloadJson(existing.id);
      if (prev && Array.isArray(prev.invHistory) && Array.isArray(withFiles.invHistory)) {
        const prevByKey = new Map(prev.invHistory.map((h) => [invHistKeyServer(h), h]));
        withFiles = {
          ...withFiles,
          invHistory: withFiles.invHistory.map((h) => {
            const p = prevByKey.get(invHistKeyServer(h));
            if (!p) return h;
            return {
              ...h,
              driveFileId: h.driveFileId || p.driveFileId,
              driveFileName: h.driveFileName || p.driveFileName,
              driveSyncedAt: h.driveSyncedAt || p.driveSyncedAt,
            };
          }),
        };
      }
    } catch (e) {
      console.warn("Preserve invHistory drive ids", ev.name, e.message);
    }
  }
  const file = await uploadJson(
    "event-data.json",
    withFiles,
    folderId,
    existing && existing.id
  );
  return { ...withFiles, driveFolderId: folderId, driveFileId: file.id };
}

async function markEventDeleted(deleted) {
  if (!deleted || !deleted.driveFolderId) return;
  const deletedName = (deleted.name || "Event").trim() + " deleted";
  await renameFile(deleted.driveFolderId, deletedName);
  const existing = await findFile("event-data.json", deleted.driveFolderId);
  if (existing) {
    const snap = await downloadJson(existing.id);
    await uploadJson(
      "event-data.json",
      { ...snap, deletedAt: new Date().toISOString(), status: "deleted" },
      deleted.driveFolderId,
      existing.id
    );
  }
}

async function saveMasterData(payload) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  const root = rootFolderId();
  const deleted = Array.isArray(payload.deletedEvents) ? payload.deletedEvents : [];

  for (const d of deleted) {
    try {
      await markEventDeleted(d);
    } catch (e) {
      console.warn("Delete folder rename failed", d.name, e.message);
    }
  }

  const prev = await loadMasterData();
  const prevDeleted = new Set(
    Array.isArray(prev?.deletedEventIds) ? prev.deletedEventIds : []
  );
  deleted.forEach((d) => {
    if (d && d.id) prevDeleted.add(d.id);
  });
  const deletedEventIds = [...prevDeleted];
  const deletedAll = deletedEventIds.map((id) => ({ id }));

  const eventsIn = applyDeletedEvents(
    mergeEvents(prev?.events || [], Array.isArray(payload.events) ? payload.events : []),
    deletedAll
  );
  const inventoryFiles = Array.isArray(payload.inventoryFiles) ? payload.inventoryFiles : [];
  const syncedEvents = [];
  for (const ev of eventsIn) {
    try {
      syncedEvents.push(await syncEventFolder(ev, root, inventoryFiles));
    } catch (e) {
      console.warn("Event sync failed", ev.name, e.message);
      syncedEvents.push(ev);
    }
  }

  const version = (prev && prev.version ? prev.version : 0) + 1;
  const master = {
    version,
    updatedAt: new Date().toISOString(),
    events: syncedEvents.map(slimEventForMaster),
    users: payload.users || (prev && prev.users) || null,
    currency: normalizeCurrencyRates(payload.currency || (prev && prev.currency) || null),
    deletedEventIds,
  };

  const masterHit = await findFile(MASTER_NAME, root);
  const file = await uploadJson(
    MASTER_NAME,
    master,
    root,
    (masterHit && masterHit.id) || (prev && prev.masterFileId)
  );

  return {
    version,
    updatedAt: master.updatedAt,
    masterFileId: file.id,
    events: syncedEvents,
    users: master.users,
    currency: master.currency,
    deletedEventIds,
  };
}

async function uploadInventoryFileForEvent(eventId, file) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  if (!eventId || !file || !file.contentBase64) {
    throw new Error("eventId and file content required");
  }
  const root = rootFolderId();
  const prev = await loadMasterData();
  let ev = (prev?.events || []).find((e) => e && e.id === eventId);
  if (!ev) throw new Error("Event not found: " + eventId);
  ev = await hydrateEventFromFolder(ev);

  let folderId = ev.driveFolderId;
  if (folderId) {
    try {
      await drive("/files/" + folderId + "?fields=id,trashed");
    } catch (e) {
      folderId = null;
    }
  }
  if (!folderId) {
    const folder = await createFolder((ev.name || ev.id || "Event").trim(), root);
    folderId = folder.id;
  }

  const withFiles = await uploadInventoryFilesToFolder(
    { ...ev, driveFolderId: folderId },
    folderId,
    [file]
  );
  const existing = await findFile("event-data.json", folderId);
  const uploaded = await uploadJson(
    "event-data.json",
    withFiles,
    folderId,
    existing && existing.id
  );

  const events = (prev?.events || []).map((e) =>
    e && e.id === eventId ? slimEventForMaster(withFiles) : e
  );
  const version = (prev && prev.version ? prev.version : 0) + 1;
  const master = {
    version,
    updatedAt: new Date().toISOString(),
    events,
    users: (prev && prev.users) || null,
    currency: (prev && prev.currency) || null,
  };
  const masterHit = await findFile(MASTER_NAME, root);
  const masterFile = await uploadJson(
    MASTER_NAME,
    master,
    root,
    (masterHit && masterHit.id) || (prev && prev.masterFileId)
  );

  const hit = (withFiles.invHistory || []).find(
    (h) => h && h.fileName === file.fileName && h.driveFileId
  );
  return {
    eventId,
    driveFolderId: folderId,
    driveFileId: uploaded.id,
    invFileId: hit && hit.driveFileId,
    invFileName: hit && hit.driveFileName,
    version,
    updatedAt: master.updatedAt,
    masterFileId: masterFile.id,
  };
}

async function getDriveStatus() {
  if (!isConfigured()) {
    return {
      configured: false,
      hasServiceAccount: !!credentials(),
      hasFolderId: !!rootFolderId(),
    };
  }
  try {
    const root = rootFolderId();
    await drive("/files/" + root + "?fields=id,name,driveId");
    const data = await loadMasterData();
    const events = data?.events || [];
    let totalItems = 0;
    let invHistoryTotal = 0;
    let invHistoryOnDrive = 0;
    events.forEach((ev) => {
      totalItems += (ev.inv || []).length;
      (ev.invHistory || []).forEach((h) => {
        invHistoryTotal += 1;
        if (h && h.driveFileId) invHistoryOnDrive += 1;
      });
    });
    return {
      configured: true,
      folderId: root,
      version: data?.version || 0,
      eventCount: events.length,
      totalItems,
      masterFileId: data?.masterFileId || null,
      updatedAt: data?.updatedAt || null,
      hasUsers: Array.isArray(data?.users) && data.users.length > 0,
      userCount: Array.isArray(data?.users) ? data.users.length : 0,
      hasCurrency: !!data?.currency,
      eventFolders: events.filter((e) => e && e.driveFolderId).length,
      invHistoryTotal,
      invHistoryOnDrive,
    };
  } catch (e) {
    return {
      configured: true,
      folderId: rootFolderId(),
      error: driveErrorMessage(e),
    };
  }
}

module.exports = {
  isConfigured,
  loadMasterData,
  saveMasterData,
  uploadInventoryFileForEvent,
  downloadInventoryFileForEvent,
  downloadLatestInventoryForEvent,
  uploadProductImagesForEvent,
  downloadProductImageForEvent,
  uploadReceiptToDrive,
  driveErrorMessage,
  getDriveStatus,
};
