# Vianne Jewels ERP — Complete Cursor Build Specification
## Full Source Code Reference + Future Development Guide

**Version:** 2.0 (Post-JCK Las Vegas 2026)
**Date:** June 2026
**Stack:** React 17 (pre-compiled ES5), Node.js backend (planned)
**Primary file:** `vianne-jewels-erp.html` (629KB, fully self-contained)

---

## 1. PROJECT OVERVIEW

Vianne Jewels ERP is a **self-contained HTML app** built for B2B diamond jewelry trade show operations. It runs entirely in the browser with no backend, no bundler, and no external dependencies. Everything is inlined: React 17, ReactDOM 17, jsQR scanner library, and the compiled app code.

### How it was built
- **Source:** `vianne-jewels-erp.jsx` (150KB, 1668 lines of React JSX)
- **Compile command:** `node transform.js` using Babel with `@babel/preset-env` (targets IE11/iOS9 = ES5) + `@babel/preset-react` + `@babel/plugin-proposal-object-rest-spread`
- **Output:** `compiled.js` (247KB pure ES5 JS, zero arrow functions, zero const/let)
- **Bundle:** React + ReactDOM + jsQR + compiled.js all inlined into one HTML file

### Critical constraints for any edits
1. **NO ES6+ syntax in compiled output** — the Claude artifact renderer and some older WebViews fail on `class`, `=>`, `const`, `let`. All code must compile to pure ES5.
2. **NO CDN dependencies** — the artifact sandbox blocks external URLs. Everything must be inlined.
3. **Babel scoping bug** — variables defined after a block-body arrow function `i => { ... }` get scoped inside that callback by Babel. Fix: use expression-body arrows `i => expr` for filter/map functions that are followed by other `const` declarations.
4. **Function size limit** — the artifact renderer's old Babel parser fails on JSX functions > ~15KB. EventERP's JSX return is split into 9 separate tab components.
5. **Always recompile from JSX** — never patch `compiled.js` directly for feature changes. Patches to `compiled.js` are wiped on next compile. Add features to the JSX source first.

---

## 2. FILE STRUCTURE

```
vianne-jewels-erp.html          ← The deliverable (629KB, zero dependencies)
vianne-jewels-erp.jsx           ← Source code (150KB, edit this)
transform.js                    ← Babel compile script
node_modules/
  react/umd/react.production.min.js          (11KB)
  react-dom/umd/react-dom.production.min.js  (117KB)
  jsqr/dist/jsQR.js                          (250KB)
  @babel/core
  @babel/preset-env
  @babel/preset-react
  @babel/plugin-proposal-object-rest-spread
```

### transform.js (compile script)
```javascript
const babel = require('@babel/core');
const fs = require('fs');
const jsx = fs.readFileSync('./vianne-jewels-erp.jsx', 'utf8');
const code = jsx
  .replace('import{useState,useRef,useEffect}from"react";',
    'var _React=React;var useState=_React.useState;var useRef=_React.useRef;var useEffect=_React.useEffect;')
  .replace('export default function App()', 'function App()')
  + '\nReactDOM.render(React.createElement(App,null),document.getElementById("root"));';
const result = babel.transformSync(code, {
  presets: [['@babel/preset-env', { targets: { ie: '11', ios: '9' }, useBuiltIns: false }], '@babel/preset-react'],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
  sourceType: 'script'
});
fs.writeFileSync('./compiled.js', result.code);
```

### HTML bundle assembly
```python
# After compiling, assemble the HTML:
with open('react.production.min.js') as f: react = f.read()
with open('react-dom.production.min.js') as f: rd = f.read()
with open('jsqr/dist/jsQR.js') as f: jsqr = f.read()
with open('compiled.js') as f: app = f.read()

html = f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>Vianne Jewels ERP</title>
<style>/* ... CSS ... */</style>
</head><body>
<div id="root"></div>
<script>{react}</script>
<script>{rd}</script>
<script>{jsqr}</script>
<script>{app}</script>
</body></html>"""
```

---

## 3. COMPONENT ARCHITECTURE

```
App
├── Login                    (login form, Face ID / biometric button)
└── EventHub                 (event selector screen)
    ├── ManageEvent          (edit event details modal)
    └── EventERP             (main app per event)
        ├── LookupTab        (wrapper for single/multi sub-tabs)
        │   ├── SingleLookup (search, QR scanner, item detail, sell flow)
        │   │   └── ItemCard (item detail + sell form with customer name)
        │   │       └── InvoiceSheet (invoice modal + print)
        │   └── MultiLookup  (batch item lookup + bulk sell)
        ├── SalesTab         (sales list with deliver/GATI/delete actions)
        ├── HistoryTab       (all sales, filterable by staff)
        ├── InventoryTab     (stock list + audit scanner)
        ├── AnalyticsTab     (revenue, products, sales, staff charts)
        ├── CustomersTab     (customer list, add form, detail + purchase history)
        └── AdminTab         (settings: profile, currency, event info, users, permissions)
            ├── CurrencyManager  (editable exchange rates, Admin only)
            └── UserManager      (add/edit/delete team members, Admin only)
```

### Supporting components
- `Bdg` — status badge (available/sold/reserved/hot/warm/cold)
- `Lotus` — Vianne Jewels SVG lotus logo
- `Sheet` — bottom sheet modal wrapper
- `QRScanner` — camera QR scanner using jsQR
- `parseXL` — Excel file parser using SheetJS (loaded on demand)

---

## 4. STATE ARCHITECTURE

All state lives in `EventERP` via React `useState`. No Redux, no Context API.

### Core state (EventERP useState hooks)
```javascript
const [tab, st]           = useState("lookup")      // active tab
const [inv, si]           = useState(ev.inv)        // inventory items
const [sales, ssl]        = useState(ev.sales)      // sales records
const [leads, sld]        = useState(ev.leads||[])  // customers/leads
const [cur, scur]         = useState("USD")         // display currency
const [jc, sjc]           = useState("")            // lookup search query
const [det, sdet]         = useState(null)          // selected item detail
const [mlTab, smlTab]     = useState("single")      // single/multi sub-tab
const [scan, sscan]       = useState(false)         // QR scanner open
const [showFilter, sShowFilter] = useState(false)   // filter panel open
const [fCat, sfCat]       = useState("All")         // filter: category
const [fCol, sfCol]       = useState("All")         // filter: collection
const [fMetal, sfMetal]   = useState("All")         // filter: metal
const [fSt, sfSt]         = useState("All")         // filter: status
const [fShape, sfShape]   = useState("All")         // filter: stone shape
const [fMinTc..fMaxFp]    = useState("")            // numeric filters
const [invTab, sivTab]    = useState("stock")       // stock/audit sub-tab
const [auditLoc, saLoc]   = useState("Exhibition")  // audit location
const [auditScanned, saScanned] = useState([])      // scanned items in audit
const [audits, sAudits]   = useState(ev.audits||[]) // saved audit records
const [hstaff, shs]       = useState("All")         // history staff filter
const [atab, sat]         = useState("overview")    // analytics sub-tab
```

### Computed variables (EventERP, before return)
```javascript
const totalRev   = sales.reduce((s,x) => s + x.total, 0)
const fh         = sales.filter(s => hstaff==="All" || s.staff===hstaff)
const stf        = [...new Set(sales.map(s => s.staff))]
const lkQ        = jc.trim()
const lkResults  = applyFilters(inv, lkQ || null)
const lkShowResults = lkQ.length > 0 || activeFilters > 0
const locItems   = inv.filter(i => i.loc===auditLoc && i.st!=="sold")
const missing    = locItems.filter(i => !auditScanned.find(s => s.id===i.id))
const saveAudit  = () => { /* saves audit record */ }
const cats       = ["All", ...new Set(inv.map(i => i.cat))]
const deadStock  = inv.filter(i => i.st==="available" && i.views===0)
const fi         = inv.filter(i => !isq || i.id.toLowerCase().includes(isq.toLowerCase()) || ...)
const addLead    = () => { /* adds new customer */ }
```

### syncUp — persistence function
```javascript
const syncUp = (ni, ns, nl, na) => onUpdateEvent({...ev, inv: ni||inv, sales: ns||sales, leads: nl||leads, audits: na||audits})
```
Called after every mutation to persist data back to the parent event object.

### Props passed to tab components
Each tab component receives ALL needed state via `{...{ev, inv, si, sales, ssl, leads, sld, cur, scur, user, pr, fc, totalRev, fh, stf, ...}}` spread. Each component unpacks what it needs via `var x = p.x;` declarations at the top.

---

## 5. DATA MODELS

### Inventory Item
```javascript
{
  id: "VJBR0094",           // Item code (VJ prefix)
  style: "BR0065",          // Style code
  cat: "Bracelets",         // Category: Bracelets|Earrings|Necklaces|Rings|Pendants|...
  col: "CLASSICS",          // Collection name
  metal: "G14KWG",          // Metal: G14KWG|G18KWG|G14KYG|G18KYG|G18KRG|...
  sz: "L 6.75",             // Size
  gw: 9.66,                 // Gross weight (grams)
  nw: 8.28,                 // Net weight (grams)
  tc: 6.89,                 // Total carats
  fp: 2015,                 // Final price (USD)
  em: "💎",                 // Emoji icon
  st: "available",          // Status: available|sold|reserved
  loc: "Exhibition",        // Physical location
  img: "",                  // Base64 or URL photo
  views: 0,                 // Scan count
  searches: 0,              // Search count
  stones: [{sh:"RD",ct:0.97,tct:1.55}]  // Stone details
}
```

### Sale Record
```javascript
{
  id: "INV-ABC1",           // Invoice ID
  custName: "John Doe",     // Customer name (optional)
  phone: "+1 555 1234",     // Phone
  itemId: "VJBR0094",       // Item code
  itemName: "Bracelets · CLASSICS · G14KWG",
  metal: "G14KWG",
  col: "CLASSICS",
  sz: "L 6.75",
  gw: 9.66, nw: 8.28, tc: 6.89,
  price: 2015,              // Subtotal after discount
  disc: 0,                  // Discount %
  cgst: 0,                  // Always 0 (no GST on invoices)
  sgst: 0,                  // Always 0
  ccType: "pct",            // CC surcharge type: "pct"|"amt"
  ccVal: "2.5",             // CC surcharge value
  ccAmt: 50.38,             // CC surcharge amount
  total: 2065.38,           // Grand total
  payment: "Credit Card",   // Payment method
  staff: "Naman",           // Staff who made sale
  date: "6/7/2026",
  time: "9:30:00 AM",
  st: "completed",          // completed|pending|delivered
  gt: "",                   // GATI consignment number
  source: "in-store",       // in-store|shopify|whatsapp
}
```

### Customer / Lead
```javascript
{
  id: "LD-ABC1",
  name: "John Doe",
  phone: "+1 555 1234",
  email: "john@example.com",
  company: "Doe Jewelers",
  contact: "",              // Legacy field (same as email)
  notes: "Prefers platinum, budget $5k",
  status: "Warm",           // Hot|Warm|Cold
  source: "Walk-in",        // Walk-in|Shopify|WhatsApp|Referral|Trade Show|Other
  created: "6/7/2026",
}
```

### Event
```javascript
{
  id: "EVT001",
  name: "JCK Las Vegas 2026",
  loc: "Las Vegas, USA",
  start: "2026-06-06",
  end: "2026-06-09",
  status: "active",         // active|completed|upcoming
  inv: [...],               // Inventory array
  sales: [...],             // Sales array
  leads: [...],             // Customers array
  audits: [...],            // Audit records array
}
```

### Audit Record
```javascript
{
  id: "AUD-ABC1",
  loc: "Exhibition",
  date: "6/7/2026",
  time: "9:30:00 AM",
  expected: 45,
  scanned: 43,
  missing: ["VJBR0094", "VJER0784"],
  items: ["VJNC3234", ...]  // All scanned item IDs
}
```

---

## 6. PERMISSIONS SYSTEM

Defined in `gp(role, customPerms)` function. Returns a permissions object.

```javascript
const PERMS = {
  Admin:   { vP:1, vH:1, vA:1, oP:1, eC:1, mU:1, sF:1, sB:1, delSale:1 },
  Manager: { vP:1, vH:1, vA:0, oP:1, eC:1, mU:0, sF:1, sB:0, delSale:0 },
  Staff:   { vP:0, vH:0, vA:0, oP:0, eC:0, mU:0, sF:0, sB:0, delSale:0 },
}
```

| Key | Meaning |
|-----|---------|
| `vP` | View Prices |
| `vH` | View History / Sales tab |
| `vA` | View Analytics + Revenue |
| `oP` | Override Price (discount) |
| `eC` | Export CSV |
| `mU` | Manage Users + Edit currency rates |
| `sF` | Show Formula (cost/margin) |
| `sB` | Show Breakdown |
| `delSale` | Delete Sales |

Custom permissions per user override the role defaults.

---

## 7. TEAM CREDENTIALS

```javascript
const USERS = [
  { name:"Nilay",   un:"nilay",   pw:"nilay123",   role:"Admin"   },
  { name:"Jimit",   un:"jimit",   pw:"jimit123",   role:"Manager" },
  { name:"Ruchit",  un:"ruchit",  pw:"ruchit123",  role:"Admin"   },
  { name:"Naresh",  un:"naresh",  pw:"naresh123",  role:"Staff"   },
  { name:"Naman",   un:"naman",   pw:"naman123",   role:"Admin"   },
  { name:"Nihar",   un:"nihar",   pw:"nihar123",   role:"Staff"   },
  { name:"Dhruvit", un:"dhruvit", pw:"dhruvit123", role:"Staff"   },
]
```

---

## 8. CURRENCIES

```javascript
const DEFAULT_CURR = {
  USD: { s:"$",    r:1,     name:"US Dollar"         },
  INR: { s:"₹",   r:83.5,  name:"Indian Rupee"      },
  AED: { s:"AED ", r:3.67,  name:"UAE Dirham"        },
  GBP: { s:"£",   r:0.79,  name:"British Pound"     },
  EUR: { s:"€",   r:0.92,  name:"Euro"              },
  SGD: { s:"S$",  r:1.35,  name:"Singapore Dollar"  },
  HKD: { s:"HK$", r:7.82,  name:"Hong Kong Dollar"  },
  JPY: { s:"¥",   r:149.5, name:"Japanese Yen"      },
  CAD: { s:"CA$", r:1.36,  name:"Canadian Dollar"   },
  AUD: { s:"A$",  r:1.52,  name:"Australian Dollar" },
}
// User-edited rates saved to localStorage key "vj_curr_rates"
// Only Admin (pr.mU) can edit rates via CurrencyManager in Settings
```

---

## 9. STYLE SYSTEM

All styles are inline React styles using the `S` object:

```javascript
const S = {
  btn:  o => ({ background:G, color:CR, border:"none", borderRadius:10, ... }),
  bOut: o => ({ background:"transparent", color:G, border:"1.5px solid "+G, ... }),
  bRed: o => ({ background:RE, color:WH, ... }),
  inp:  o => ({ background:INP, border:"1.5px solid "+CRD2, borderRadius:9, ... }),
  lbl:  { fontSize:9, fontWeight:700, color:T3, textTransform:"uppercase", ... },
  card: o => ({ background:WH, borderRadius:14, padding:"13px 14px", ... }),
  sh:   { fontWeight:700, fontSize:11, color:T2, textTransform:"uppercase", ... },
  cc:   o => ({ background:WH, borderRadius:12, padding:"11px 13px", ... }),
  pill: active => ({ ... }),
}
```

### Color palette
```javascript
const G    = "#1E5C45"   // Primary green
const GD   = "#163D2E"   // Dark green (background)
const GO   = "#C9A84C"   // Gold
const CR   = "#F5EDE0"   // Cream
const WH   = "#FFFFFF"   // White
const CRD  = "#F5EDE0"   // Cream (card bg)
const CRD2 = "#E8DCCB"   // Cream darker (borders)
const INP  = "#FBF5E8"   // Input background
const T1   = "#1E5C45"   // Text primary
const T2   = "#3D5C4A"   // Text secondary
const T3   = "#7A8C7E"   // Text tertiary
const T4   = "#B0A88A"   // Text quaternary
const RE   = "#A03030"   // Red (errors, hot leads)
const REBG = "#F9ECEC"   // Red background
const AM   = "#C8963A"   // Amber (warnings, warm leads)
const AMBG = "#FDF5E6"   // Amber background
```

---

## 10. SELL FLOW (Single Lookup)

1. Staff searches for item code or name → `lkResults` filters `inv`
2. Taps item → `sdet(item)` sets detail view → `ItemCard` renders
3. `ItemCard` shows item photo, specs, price (gated by `pr.vP`)
4. Staff taps **SOLD DELIVERED** or **INVOICE** → `sm("d")` or `sm("n")` sets mode
5. Sell form opens with:
   - **Customer name** (optional, at top) + Phone
   - **Discount** slider (visible only if `pr.oP`)
   - **Payment method** selector (NEFT/RTGS/Cheque/Cash/UPI/Credit Card/Wire Transfer)
   - **CC Surcharge** section (visible only when payment = Credit Card): % or fixed amount
   - **Remarks** textarea
   - Live price breakdown: Item Price → Discount → CC Surcharge → **GRAND TOTAL**
6. Staff taps **Confirm Sale & Invoice** → `doSell()`:
   - Creates sale record with all fields + `ccType`, `ccVal`, `ccAmt`, `total`
   - Updates item status to "sold" in inventory
   - Calls `syncUp()` to persist
   - Opens `InvoiceSheet` modal
7. Invoice modal shows printable view → **Print Invoice** opens `window.open()` with formatted HTML

### Invoice format
- No CGST / SGST (zero on all invoices)
- Shows: Item Price → Discount (if any) → CC Surcharge (if any) → **GRAND TOTAL**
- Business header: Vianne Jewels, GSTIN, HSN, address, email, website

---

## 11. QR SCANNER

The `QRScanner` component uses the `jsQR` library (bundled inline, no CDN):

```javascript
function QRScanner({ onScanned, inv }) {
  // useRef for video + canvas
  // useEffect: getUserMedia → start camera → requestAnimationFrame loop
  // Each frame: draw to canvas → imageData → jsQR() → if found: onScanned(code, item)
  // Manual entry fallback for sandboxed environments
}
```

**Important:** Camera (`getUserMedia`) is blocked in sandboxed iframes (Claude artifact renderer). The scanner UI renders correctly but shows "Starting camera..." in the sandbox. Manual entry (type VJ code) works fully.

---

## 12. EXCEL IMPORT (parseXL)

SheetJS is loaded on demand via CDN when user taps "Upload Excel":

```javascript
function parseXL(wb, evId) {
  // Reads JCK price list Excel format
  // Extracts: id, style, cat, col, metal, sz, qty, gw, nw, tc, sp, iv, tod, cpt, ipt, fp, em
  // Embeds product photos from Excel anchor images
  // Returns array of inventory items
}
```

**Excel format expected:** JCK price list with columns matching the inventory item fields. Photos embedded as images anchored to rows.

---

## 13. FEATURES IMPLEMENTED

### Lookup Tab
- [x] Live search by item code, collection, category, metal
- [x] ⚡ Smart Filters: Category, Collection, Metal, Stone Shape, Status, Carat range, Weight range, Price range
- [x] Active filter count badge
- [x] Reset filters button
- [x] QR scanner (inline, no popup, stop button)
- [x] Item detail view with photo, specs, price breakdown
- [x] Single sell flow with customer name (optional), CC surcharge, no GST
- [x] Invoice print

### Multi-Lookup Tab
- [x] Paste multiple codes or scan multiple QR codes
- [x] Bulk pricing with discount % or markup %
- [x] Batch sell with customer name prompt
- [x] Not-found items list

### Sales Tab
- [x] Sales list with item photo, customer, amount, payment method
- [x] Mark as **Invoice** / **Delivered** / **GATI** (generates consignment number)
- [x] Delete sale (gated by `pr.delSale`)
- [x] Filter by staff (History sub-tab)
- [x] Revenue visible only to `pr.vA`

### History Tab
- [x] Full sales history reverse chronological
- [x] Staff filter
- [x] Invoice view for each sale

### Stock Tab
- [x] Inventory list with search, category filter, status filter
- [x] Status badges (available/sold/reserved)
- [x] Dead stock indicator (0 views, 0 searches)

### Audit Tab
- [x] Location selector (Exhibition/Vault/Office/All)
- [x] QR scanner with stop button
- [x] Expected / Scanned / Missing counts
- [x] Missing items list
- [x] Save audit record with timestamp

### Customers Tab
- [x] Customer list with avatar, status badge, total spent, purchase count
- [x] Search by name, phone, company
- [x] Filter pills: All / Hot / Warm / Cold
- [x] Add Customer form (inline, no popup): Name, Phone, Email, Company, Status, Source, Notes
- [x] Customer detail: profile card, Hot/Warm/Cold toggle, purchase history with photos
- [x] Sources: Walk-in / Shopify / WhatsApp / Referral / Trade Show / Other

### Analytics Tab
- [x] Overview: revenue, units, avg deal, conversion rate (gated by `pr.vA`)
- [x] Products: top items by revenue, category breakdown
- [x] Sales: timeline, payment method breakdown
- [x] Staff: per-staff performance (gated by `pr.vA`)

### Settings Tab (Admin only)
- [x] My Profile: name, username, role, permissions
- [x] Currency & Exchange Rates: 10 currencies, Admin-editable rates, saves to localStorage
- [x] Event Info: name, dates, status, item/sale/revenue summary
- [x] User Management: add/edit/delete team members, custom permissions per user
- [x] Your Permissions: visual permission toggles (read-only)
- [x] Sign Out

### Event Hub
- [x] Multi-event support (JCK, IIJS, etc.)
- [x] Create new event
- [x] Edit event details
- [x] Switch between events

---

## 14. KNOWN LIMITATIONS

| Issue | Status | Notes |
|-------|--------|-------|
| Camera blocked in sandbox | By design | Use manual QR entry. Works on real devices. |
| SheetJS from CDN | Works on real devices | CDN blocked in sandbox. Use demo items in sandbox. |
| 50 demo items | Temporary | Load full 451-item catalog via Excel upload in app |
| No backend | By design for now | See integration spec for Shopify/QB/GATI backend |
| localStorage only | By design | Data persists per browser session. No cloud sync yet. |

---

## 15. PLANNED INTEGRATIONS (See vianne-erp-integration-spec.md)

Three integrations planned, each requires a Node.js backend server:

### 15.1 Shopify
- Pull orders from Shopify → import as ERP sales
- Push inventory items to Shopify as products
- Update Shopify stock when item sold in ERP
- Abandoned cart customers → auto-add as leads

### 15.2 QuickBooks Online
- Auto-create QB invoice on each sale
- Sync customers and items
- OAuth flow (requires backend)

### 15.3 GATI Softech
- Auto-book consignment on GATI button tap
- Get real consignment number + tracking URL
- Replace manual GT number generation

---

## 16. HOW TO ADD A NEW FEATURE (for Cursor)

### Step 1: Edit the JSX source
Open `vianne-jewels-erp.jsx`. All React components are here.

### Step 2: Babel scoping rule
If you add new variables in `EventERP` body before `return(`, put them AFTER all arrow functions that use block bodies `{ }`. Put simple one-liner consts first, block functions last. This prevents Babel from scoping them inside the previous function.

```javascript
// CORRECT ORDER:
const totalRev = sales.reduce(...);   // simple — put first
const fi = inv.filter(i => !isq || ...); // expression body — fine anywhere
const addCustomer = () => {           // block body — put LAST
  // ... multi-line ...
};
```

### Step 3: Compile
```bash
node transform.js
# Should output: SUCCESS: XXX KB
```

### Step 4: If compile fails
Check the error line number in the JSX source. Common issues:
- Template literals (backticks) — not allowed, use `"a" + var + "b"` concatenation
- `async/await` — not allowed, use `.then()` chains
- Optional chaining `?.` — not allowed, use `x && x.y`
- Nullish coalescing `??` — not allowed, use `x !== null && x !== undefined ? x : y`

### Step 5: Apply post-compile fixes
After compile, run these fixes in the compiled.js if needed:
```python
# Add missing var declarations to AdminTab
# Add sauditLoc/sauditScanned aliases to InventoryTab
# Fix sellMulti cgst to 0
```

### Step 6: Bundle HTML
```python
# Concatenate: react.min.js + react-dom.min.js + jsQR.js + compiled.js
# Wrap in HTML boilerplate with mobile meta tags
# Output: vianne-jewels-erp.html
```

---

## 17. BUSINESS CONTEXT

**Company:** Vianne Jewels  
**Business:** B2B diamond jewelry, trade shows + wholesale  
**Key venue:** JCK Las Vegas (June each year), IIJS Mumbai  
**Team:** Nilay (Admin/Owner), Jimit (Manager), Ruchit (Admin), Naresh/Nihar/Dhruvit (Staff), Naman (Admin/Builder)  
**Typical JCK stats:** ~$139K revenue, 123 units, 37.4% conversion, 41 customers, ~$323K unsold pipeline  
**Invoice format:** No CGST/SGST (international B2B), CC surcharge as needed  
**Primary use:** iPad/iPhone at trade show booth for real-time inventory lookup and sales recording

---

## 18. QUICK REFERENCE: FILE EDIT LOCATIONS

| What to change | Where in vianne-jewels-erp.jsx |
|----------------|-------------------------------|
| Login credentials | `const USERS = [...]` near top |
| Default currency rates | `const DEFAULT_CURR = {...}` near top |
| Color palette | `const G=..., GD=..., GO=...` constants |
| Add a new tab | Add to `TABS` array in EventERP, add `{tab==="newtab"&&<NewTab .../>}` in JSX, create `function NewTab(p){...}` |
| Change payment methods | `["NEFT","RTGS","Cheque","Cash","UPI","Credit Card","Wire Transfer"]` in ItemCard |
| Invoice header/footer | `doPrint()` function in InvoiceSheet |
| Add a new permission | Add key to `PERMS` object in `gp()` function |
| Change sell form fields | `ItemCard` function, the `mode` render section |
| Analytics metrics | `AnalyticsTab` function |
| Audit locations | `["Exhibition","Vault","Office","All"]` in InventoryTab |
| Multi-lookup pricing | `MultiLookup` function, `mlSubtotal/mlAdj/mlFinal` calculations |

