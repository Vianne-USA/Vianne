#!/usr/bin/env node
/**
 * Merge JCK price list xlsx files into NY Office (EVNYOFC) on cloud.
 * Dedupes by Unique Code; each item keeps data + photo from its source file.
 *
 * Usage:
 *   node scripts/import-ny-office-inventory.js
 */
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const XLSX = require("xlsx");

const API = process.env.VIANNE_API || "https://vianne-lac.vercel.app";
const EVENT_ID = "EVNYOFC";
const BATCH = 6;

const FILES = [
  "/Users/rj/Downloads/VIANNE/JCK 2026 Price List.xlsx",
  "/Users/rj/Downloads/VIANNE/JCK PRICE LIST/JCK Price List-2.xlsx",
  "/Users/rj/Downloads/VIANNE/JCK PRICE LIST/JCK Price List-3.xlsx",
];

function normXLKey(k) {
  return String(k || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
function xlVal(row, keys) {
  const map = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    map[normXLKey(k)] = v;
  });
  for (const k of keys) {
    const v = map[normXLKey(k)];
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}
function xlNum(v) {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(/[$,₹\s]/g, ""));
  return isNaN(n) ? 0 : n;
}
function rowToItem(row, excelRow) {
  let id = String(
    xlVal(row, ["Unique Code", "Jewel Code", "JewelCode", "Code", "SKU", "ID", "Item Code", "VJ Code"]) || ""
  )
    .trim()
    .toUpperCase();
  if (!id) {
    for (const v of Object.values(row)) {
      const s = String(v || "").trim().toUpperCase();
      if (/^VJ[A-Z]{2,4}\d+/i.test(s)) {
        id = s;
        break;
      }
    }
  }
  if (!id || id.length < 3) return null;
  if (["UNIQUE CODE", "JEWEL CODE", "JEWEL", "CODE", "ID", "SKU", "STYLE CODE"].includes(id)) return null;
  const design = String(xlVal(row, ["Design", "Category", "Cat", "Product Type"]) || "Jewellery").trim();
  const col = String(xlVal(row, ["Coll'n", "Collection", "Col", "Collection Name"]) || "—").trim() || "—";
  const metal = String(xlVal(row, ["KT/Col", "KT Col", "Metal", "Metal Type"]) || "").trim();
  const stoneShape = String(xlVal(row, ["Stone Shape", "Shape"]) || "").trim();
  const clarity = String(xlVal(row, ["Color/Clarity", "Color Clarity", "Clarity"]) || "").trim();
  const pcs = xlNum(xlVal(row, ["PCS", "Stone Pcs", "Total PCS"]));
  const cts = xlNum(xlVal(row, ["CTS", "Total CTS", "Total Carats"]));
  let fp = xlNum(xlVal(row, ["Round Off Final", "Round Off", "Final Price"]));
  if (fp <= 0) fp = xlNum(xlVal(row, ["Sale Price", "Price", "FP", "MRP"]));
  if (fp <= 0) fp = xlNum(xlVal(row, ["Inward + Tarriffs", "Inward + Tariffs", "IPT", "Inward+Tariffs"]));
  if (fp <= 0) return null;
  const salePrice = xlNum(xlVal(row, ["Sale Price"]));
  const roundOff = xlNum(xlVal(row, ["Round Off Final", "Round Off"]));
  const xlRaw = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== "") xlRaw[String(k).trim()] = v;
  });
  const stones =
    stoneShape || clarity || pcs || cts
      ? [{ sh: stoneShape, cl: clarity, pc: pcs, ct: cts, tct: cts || xlNum(xlVal(row, ["Total CTS"])) }]
      : [];
  const imgUrl = String(
    xlVal(row, ["Image URL", "Image Link", "Image", "Photo URL", "Photo", "Picture", "Img", "Product Image", "Product Photo"]) || ""
  ).trim();
  const emo = {
    Bracelets: "💎",
    Earrings: "✨",
    Necklaces: "📿",
    Rings: "💍",
    Pendants: "⭐",
    Bangles: "🔮",
    Brooch: "📌",
    Jewellery: "💎",
    Jewelry: "💎",
    "Men's": "💎",
  };
  return {
    id,
    style: String(xlVal(row, ["Style Code", "Style", "Style No"]) || ""),
    cat: design,
    col,
    metal,
    sz: String(xlVal(row, ["Item Size", "Size", "Sz"]) || "Std"),
    qty: parseInt(xlNum(xlVal(row, ["Qty", "Quantity"])) || 1) || 1,
    gw: xlNum(xlVal(row, ["Gross Wt", "Gross Weight", "GW"])),
    nw: xlNum(xlVal(row, ["Net Wt", "Net Weight", "NW"])),
    tc: cts || xlNum(xlVal(row, ["Total Carats", "TC"])),
    sp: pcs || xlNum(xlVal(row, ["Total PCS", "Stone Pcs"])),
    iv: xlNum(xlVal(row, ["Inward Value $", "Inward Value", "IV"])),
    tod: xlNum(xlVal(row, ["Today Value $", "Today Cost $", "Today Cost", "TOD"])) ||
      xlNum(xlVal(row, ["Today Cost + Tariffs", "Cost+Tariffs", "CPT"])),
    cpt: xlNum(xlVal(row, ["Today Cost + Tariffs", "Cost+Tariffs", "CPT"])),
    ipt: xlNum(xlVal(row, ["Inward + Tarriffs", "Inward + Tariffs", "Inward+Tariffs", "IPT"])),
    fp,
    salePrice,
    roundOff,
    design,
    stoneShape,
    clarity,
    ktCol: metal,
    xl: xlRaw,
    excelRow,
    em: emo[design] || "💎",
    st: "available",
    loc: String(xlVal(row, ["Location", "Loc"]) || "Exhibition"),
    views: 0,
    searches: 0,
    stones,
    img: /^https?:\/\//i.test(imgUrl) ? imgUrl : "",
  };
}
function parseWorkbook(buf) {
  const wb = XLSX.read(buf, { type: "buffer" });
  let items = [];
  let idByRow = {};
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    if (!ws) continue;
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
    if (!aoa.length) continue;
    let hIdx = 0;
    for (let i = 0; i < Math.min(aoa.length, 20); i++) {
      const line = aoa[i].map((c) => String(c || "").toLowerCase()).join(" ");
      if (line.includes("unique") && line.includes("code")) {
        hIdx = i;
        break;
      }
      if (line.includes("jewel") && line.includes("code")) {
        hIdx = i;
        break;
      }
    }
    const headers = (aoa[hIdx] || []).map((h) => String(h || "").trim());
    for (let r = hIdx + 1; r < aoa.length; r++) {
      if (!aoa[r].some((v) => v !== "" && v != null)) continue;
      const row = {};
      headers.forEach((h, i) => {
        if (h) row[h] = aoa[r][i] != null ? aoa[r][i] : "";
      });
      const excelRow = r + 1;
      const item = rowToItem(row, excelRow);
      if (item) {
        items.push(item);
        idByRow[excelRow] = item.id;
      }
    }
  }
  return { items, idByRow };
}
function codeForExcelRow(excelRow, idByRow) {
  for (let r = excelRow; r >= 1; r--) {
    if (idByRow[r]) return idByRow[r];
  }
  return null;
}
function parseDrawingRels(relsXml) {
  const relMap = {};
  relsXml.replace(/<(?:Relationship|[^>]*:Relationship)[^>]*>/g, (tag) => {
    const id = (tag.match(/\bId="([^"]+)"/) || tag.match(/\bid="([^"]+)"/))?.[1];
    const tgt = (tag.match(/\bTarget="([^"]+)"/) || tag.match(/\btarget="([^"]+)"/))?.[1];
    if (id && tgt) relMap[id] = "xl/" + tgt.replace(/^\.\.\//, "");
    return tag;
  });
  return relMap;
}
async function extractXLImages(buf, idByRow, onlyIds) {
  const zip = await JSZip.loadAsync(buf);
  const imgs = {};
  const want = onlyIds ? new Set(onlyIds) : null;
  const drawingPaths = Object.keys(zip.files).filter((n) => /xl\/drawings\/drawing\d+\.xml$/i.test(n));
  for (const dp of drawingPaths) {
    const xml = await zip.file(dp).async("string");
    const relsPath = dp.replace("drawings/", "drawings/_rels/").replace(/\.xml$/i, ".xml.rels");
    if (!zip.files[relsPath]) continue;
    const relMap = parseDrawingRels(await zip.file(relsPath).async("string"));
    const re = /<xdr:row>(\d+)<\/xdr:row>[\s\S]*?r:(?:embed|link)="([^"]+)"/g;
    let m;
    while ((m = re.exec(xml))) {
      const code = codeForExcelRow(parseInt(m[1], 10) + 1, idByRow);
      const mediaPath = relMap[m[2]];
      if (!code || !mediaPath || imgs[code]) continue;
      if (want && !want.has(code)) continue;
      const b64 = await zip.file(mediaPath).async("base64");
      if (b64) imgs[code] = b64;
    }
  }
  return imgs;
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
  console.log("=== NY Office inventory import ===");
  console.log("API:", API);
  console.log("Event:", EVENT_ID);

  const byId = new Map();
  const sourceById = new Map();
  const fileMeta = new Map();
  let skippedDup = 0;

  for (const filePath of FILES) {
    const abs = path.resolve(filePath);
    if (!fs.existsSync(abs)) {
      console.warn("SKIP missing:", abs);
      continue;
    }
    const label = path.basename(abs);
    console.log("\nParsing:", label);
    const buf = fs.readFileSync(abs);
    const { items, idByRow } = parseWorkbook(buf);
    fileMeta.set(label, { buf, idByRow });
    console.log("  Rows:", items.length);
    let added = 0;
    for (const item of items) {
      const k = item.id;
      if (byId.has(k)) {
        skippedDup++;
        continue;
      }
      byId.set(k, item);
      sourceById.set(k, label);
      added++;
    }
    console.log("  New unique items added:", added);
  }

  const inv = [...byId.values()];
  console.log("\nTotal unique inventory:", inv.length);
  console.log("Duplicates skipped (already imported from earlier file):", skippedDup);

  const cloud = await fetchCloudData();
  const events = cloud.events || [];
  let ny = events.find((e) => e && e.id === EVENT_ID);
  if (!ny) {
    ny = {
      id: EVENT_ID,
      name: "NY Office",
      loc: "New York, USA",
      start: "",
      end: "",
      status: "active",
      color: "#1a3a5c",
      permanent: true,
      inv: [],
      sales: [],
      leads: [],
      memos: [],
      audits: [],
      invHistory: [],
      lookupHistory: [],
    };
    events.unshift(ny);
  }
  ny = {
    ...ny,
    permanent: true,
    name: "NY Office",
    inv,
    invHistory: [
      ...(ny.invHistory || []),
      {
        id: "UPL" + Date.now(),
        fileName: "JCK 2026 merged price lists",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        mode: "replace",
        added: inv.length,
        skipped: skippedDup,
        total: inv.length,
        by: "import script",
      },
    ],
    localUpdatedAt: new Date().toISOString(),
  };
  const nextEvents = events.map((e) => (e.id === EVENT_ID ? ny : e));
  console.log("\nSaving", inv.length, "items to cloud…");
  await saveCloud(nextEvents, cloud.users, cloud.currency);
  console.log("Cloud save OK");

  const imgsById = {};
  const idsByFile = new Map();
  for (const [id, label] of sourceById) {
    if (!idsByFile.has(label)) idsByFile.set(label, []);
    idsByFile.get(label).push(id);
  }

  console.log("\nExtracting photos from source files (no cross-file mixup)…");
  for (const [label, ids] of idsByFile) {
    const meta = fileMeta.get(label);
    if (!meta) continue;
    const extracted = await extractXLImages(meta.buf, meta.idByRow, ids);
    console.log(" ", label + ":", Object.keys(extracted).length, "photos for", ids.length, "items");
    Object.assign(imgsById, extracted);
  }
  console.log("Total photos to upload:", Object.keys(imgsById).length);

  const entries = Object.entries(imgsById);
  let uploaded = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH).map(([id, data]) => ({ id, data }));
    try {
      uploaded += await uploadBatch(EVENT_ID, chunk);
      process.stdout.write(`\r  Photos: ${Math.min(i + BATCH, entries.length)}/${entries.length} (${uploaded} on Drive)`);
    } catch (e) {
      console.error("\nBatch failed at", i, e.message);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log("\n\nDone.");
  console.log("Inventory:", inv.length, "unique items on NY Office");
  console.log("Photos uploaded:", uploaded);

  const samples = ["VJBR0094", inv.find((i) => sourceById.get(i.id)?.includes("2"))?.id, inv[inv.length - 1]?.id].filter(Boolean);
  for (const sid of [...new Set(samples)]) {
    const tr = await fetch(`${API}/api/product-images?eventId=${EVENT_ID}&id=${sid}`);
    console.log("Verify image", sid, "→ HTTP", tr.status);
  }
}
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { parseWorkbook, extractXLImages, rowToItem };
