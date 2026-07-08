#!/usr/bin/env node
/**
 * Import JCK Las Vegas 2026 (EVT001):
 * - Full inventory + photos from JCK price list xlsx files
 * - Sales, customers, lookup history from JCK 2026 -All-Scans.xlsx
 *
 * Usage:
 *   node scripts/import-jck-event.js
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const {
  parseWorkbook,
  extractXLImages,
} = require("./import-ny-office-inventory");

const API = process.env.VIANNE_API || "https://vianne-lac.vercel.app";
const EVENT_ID = "EVT001";
const BATCH = 6;

const PRICE_FILES = [
  "/Users/rj/Downloads/VIANNE/JCK 2026 Price List.xlsx",
  "/Users/rj/Downloads/VIANNE/JCK PRICE LIST/JCK Price List-2.xlsx",
  "/Users/rj/Downloads/VIANNE/JCK PRICE LIST/JCK Price List-3.xlsx",
];
const SCANS_FILE = "/Users/rj/Downloads/Vianne JCK 2026 -All-Scans.xlsx";

const EMO = {
  Bracelets: "💎",
  Earrings: "✨",
  Necklaces: "📿",
  Rings: "💍",
  Pendants: "⭐",
  Bangles: "🔮",
  Brooch: "📌",
  "Men's": "💎",
  Jewellery: "💎",
  Jewelry: "💎",
};

function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function parseMoney(v) {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(/[$,₹\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(d) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function parseTs(ts) {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseSheetRows(wb, name) {
  if (!wb.Sheets[name]) return [];
  return XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "", raw: false });
}

function buildInventory() {
  const byId = new Map();
  const sourceById = new Map();
  const fileMeta = new Map();
  let skippedDup = 0;

  for (const filePath of PRICE_FILES) {
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) {
      console.warn("SKIP missing:", abs);
      continue;
    }
    const label = path.basename(abs);
    console.log("Parsing price list:", label);
    const buf = fs.readFileSync(abs);
    const { items, idByRow } = parseWorkbook(buf);
    fileMeta.set(label, { buf, idByRow });
    let added = 0;
    for (const item of items) {
      if (byId.has(item.id)) {
        skippedDup++;
        continue;
      }
      byId.set(item.id, { ...item, st: "available", views: 0, searches: 0, img: "" });
      sourceById.set(item.id, label);
      added++;
    }
    console.log("  items:", items.length, "| new unique:", added);
  }

  return { inv: [...byId.values()], byId, sourceById, fileMeta, skippedDup };
}

function buildActivityData(wb, invById) {
  const orders = parseSheetRows(wb, "Orders");
  const customers = parseSheetRows(wb, "Customers");
  const searches = parseSheetRows(wb, "Searches");

  const soldCodes = new Set();
  orders.forEach((r) => {
    const code = String(r.Code || "").trim().toUpperCase();
    if (code && /sold/i.test(String(r.Status || ""))) soldCodes.add(code);
  });

  const searchCounts = new Map();
  const viewCounts = new Map();
  searches.forEach((r) => {
    const code = String(r.Code || "").trim().toUpperCase();
    if (!code) return;
    searchCounts.set(code, (searchCounts.get(code) || 0) + 1);
    viewCounts.set(code, (viewCounts.get(code) || 0) + 1);
  });

  // Update inventory: sold status + search counts
  invById.forEach((item, id) => {
    if (soldCodes.has(id)) item.st = "sold";
    item.searches = searchCounts.get(id) || 0;
    item.views = viewCounts.get(id) || 0;
  });

  // Sales from Orders
  const sales = orders.map((r, i) => {
    const code = String(r.Code || "").trim().toUpperCase();
    const item = invById.get(code) || {};
    const ts = parseTs(r.Timestamp);
    const price = item.fp || 0;
    const status = String(r.Status || "").toLowerCase();
    const st = status.includes("delivered") ? "delivered" : status.includes("no delivery") ? "pending" : "completed";
    return {
      id: `INV-JCK-${String(i + 1).padStart(4, "0")}`,
      custId: "",
      custName: String(r.Customer || "").trim() || "(Walk-in)",
      phone: "",
      itemId: code,
      itemName: `${item.cat || item.design || "Item"} · ${item.col || "—"} · ${item.metal || ""}`,
      metal: item.metal || "",
      col: item.col || "",
      sz: item.sz || "Std",
      gw: item.gw || 0,
      nw: item.nw || 0,
      tc: item.tc || 0,
      sp: item.sp || 0,
      style: item.style || "",
      price,
      disc: 0,
      cgst: 0,
      sgst: 0,
      total: price,
      currency: "USD",
      margin: 0,
      date: fmtDate(ts),
      time: fmtTime(ts),
      payment: "NEFT",
      staff: String(r["User Name"] || r.User || "Staff").trim(),
      st,
      gt: "",
      remark: String(r.Status || "").trim(),
    };
  });

  // Customers / leads
  const leadByName = new Map();
  customers.forEach((r) => {
    const name = String(r.Customer || "").trim();
    if (!name) return;
    const sold = parseInt(r["Sold Delivered"] || "0", 10) || 0;
    const total = parseInt(r["Total Items"] || "0", 10) || 0;
    leadByName.set(name, {
      id: uid("LD"),
      name,
      contact: name,
      phone: "",
      email: "",
      source: "JCK 2026",
      status: sold > 0 ? "Hot" : total > 5 ? "Warm" : "Cold",
      notes: `Imported from JCK scans · ${total} lookups · ${sold} sold delivered`,
      created: "Jun 1, 2026",
      assigned: "",
    });
  });
  // Add customers from orders not in summary sheet
  orders.forEach((r) => {
    const name = String(r.Customer || "").trim();
    if (!name || leadByName.has(name)) return;
    leadByName.set(name, {
      id: uid("LD"),
      name,
      contact: name,
      phone: "",
      email: "",
      source: "JCK 2026",
      status: "Warm",
      notes: "Imported from JCK orders",
      created: fmtDate(parseTs(r.Timestamp)),
      assigned: "",
    });
  });
  const leads = [...leadByName.values()];

  // Lookup history from Searches (newest first)
  const lookupHistory = searches
    .map((r) => {
      const code = String(r.Code || "").trim().toUpperCase();
      const item = invById.get(code);
      if (!code || !item) return null;
      const dateStr = String(r.Date || "").trim();
      const timeStr = String(r.Time || "").trim();
      const method = String(r.Method || "").toLowerCase();
      const type = method.includes("scan") || method.includes("qr") ? "scan" : "search";
      return {
        id: uid("LK"),
        itemId: code,
        itemName: `${item.cat || r.Design || ""} · ${item.col || r.Collection || ""}`,
        type,
        query: code,
        user: String(r["User Name"] || r.User || "").trim(),
        custName: String(r.Customer || "").trim(),
        date: dateStr || "Jun 1, 2026",
        time: timeStr || "",
      };
    })
    .filter(Boolean)
    .reverse();

  return { sales, leads, lookupHistory, soldCodes };
}

async function fetchCloudData() {
  const r = await fetch(`${API}/api/data`);
  const d = await r.json();
  if (!r.ok || !d.configured) throw new Error("Cloud not configured");
  return d;
}

async function saveCloud(events, users, currency) {
  const r = await fetch(`${API}/api/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events, users, currency, deletedEvents: [] }),
  });
  const d = await r.json();
  if (!r.ok || !d.ok) throw new Error(d.error || "Cloud save failed");
  return d;
}

async function uploadBatch(eventId, chunk) {
  const r = await fetch(`${API}/api/product-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, images: chunk }),
  });
  const d = await r.json();
  if (!r.ok || !d.ok) throw new Error(d.error || `Upload failed HTTP ${r.status}`);
  return d.uploaded || chunk.length;
}

async function main() {
  console.log("=== JCK Las Vegas 2026 full import ===");
  console.log("API:", API);
  console.log("Event:", EVENT_ID);

  if (!fs.existsSync(SCANS_FILE)) throw new Error("Scans file not found: " + SCANS_FILE);

  const { inv, byId, sourceById, fileMeta, skippedDup } = buildInventory();
  const invById = byId;

  console.log("\nInventory from price lists:", inv.length, "| dupes skipped:", skippedDup);

  const scansWb = XLSX.readFile(SCANS_FILE);
  const { sales, leads, lookupHistory, soldCodes } = buildActivityData(scansWb, invById);
  console.log("Sales:", sales.length);
  console.log("Customers:", leads.length);
  console.log("Lookup history:", lookupHistory.length);
  console.log("Sold item codes:", soldCodes.size);

  const cloud = await fetchCloudData();
  const events = cloud.events || [];
  let jck = events.find((e) => e && e.id === EVENT_ID);
  if (!jck) {
    jck = {
      id: EVENT_ID,
      name: "JCK Las Vegas 2026",
      loc: "Las Vegas, USA",
      start: "2026-06-06",
      end: "2026-06-09",
      status: "active",
      color: "#1E5C45",
      inv: [],
      sales: [],
      leads: [],
      memos: [],
      audits: [],
      invHistory: [],
      lookupHistory: [],
    };
    events.unshift(jck);
  }

  const now = new Date();
  jck = {
    ...jck,
    name: "JCK Las Vegas 2026",
    loc: jck.loc || "Las Vegas, USA",
    start: jck.start || "2026-06-06",
    end: jck.end || "2026-06-09",
    status: "active",
    inv: [...invById.values()],
    sales,
    leads,
    lookupHistory,
    invHistory: [
      ...(jck.invHistory || []).filter((h) => !String(h.fileName || "").includes("JCK 2026 import")),
      {
        id: "UPL" + Date.now(),
        fileName: "JCK 2026 price lists + All-Scans import",
        date: fmtDate(now),
        time: fmtTime(now),
        mode: "replace",
        added: inv.length,
        skipped: skippedDup,
        total: inv.length,
        by: "import script",
      },
    ],
    localUpdatedAt: now.toISOString(),
    syncedAt: now.toISOString(),
  };

  const nextEvents = events.map((e) => (e.id === EVENT_ID ? jck : e));
  console.log("\nSaving to cloud…");
  const saved = await saveCloud(nextEvents, cloud.users, cloud.currency);
  console.log("Cloud save OK — version", saved.version || "?");

  // Photos
  const imgsById = {};
  const idsByFile = new Map();
  for (const [id, label] of sourceById) {
    if (!idsByFile.has(label)) idsByFile.set(label, []);
    idsByFile.get(label).push(id);
  }

  console.log("\nExtracting photos from price list files…");
  for (const [label, ids] of idsByFile) {
    const meta = fileMeta.get(label);
    if (!meta) continue;
    const extracted = await extractXLImages(meta.buf, meta.idByRow, ids);
    console.log(" ", label + ":", Object.keys(extracted).length, "photos");
    Object.assign(imgsById, extracted);
  }
  console.log("Total photos to upload:", Object.keys(imgsById).length);

  const entries = Object.entries(imgsById);
  let uploaded = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH).map(([id, data]) => ({ id, data }));
    try {
      uploaded += await uploadBatch(EVENT_ID, chunk);
      process.stdout.write(`\r  Photos: ${Math.min(i + BATCH, entries.length)}/${entries.length}`);
    } catch (e) {
      console.error("\nBatch failed at", i, e.message);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log("\n\n=== DONE ===");
  console.log("Inventory:", inv.length);
  console.log("Sales:", sales.length);
  console.log("Customers:", leads.length);
  console.log("Lookups:", lookupHistory.length);
  console.log("Photos uploaded:", uploaded);

  const verify = await fetchCloudData();
  const ev = (verify.events || []).find((e) => e.id === EVENT_ID);
  console.log("\nCloud verify:");
  console.log("  inv:", (ev?.inv || []).length);
  console.log("  sales:", (ev?.sales || []).length);
  console.log("  leads:", (ev?.leads || []).length);
  console.log("  lookups:", (ev?.lookupHistory || []).length);
  console.log("  sold items:", (ev?.inv || []).filter((i) => i.st === "sold").length);

  for (const sid of ["VJER3259", "VJNC3193", "VJBR0094"]) {
    const tr = await fetch(`${API}/api/product-images?eventId=${EVENT_ID}&id=${sid}`);
    console.log("  image", sid, "→ HTTP", tr.status);
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
