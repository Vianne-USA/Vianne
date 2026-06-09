# Vianne Jewels ERP — Cursor Specification v6.0
## Complete Development Reference

**Date:** June 2026  
**Source:** `vianne-jewels-erp.jsx` (242KB, 3397 lines)  
**Output:** `vianne-jewels-erp.html` (763KB, zero external dependencies)  
**Stack:** React 17 pre-compiled to ES5, fully self-contained HTML  
**Functions (28):** ToastContainer, useDark, toggleDark, getDark, Bdg, Lotus, Sheet, QRScanner, parseXL, Login, EventHub, ManageEvent, SaleSuccess, ItemCard, InvoiceSheet, UserManager, PhotoSearch, SingleLookup, MultiLookup, LookupTab, InventoryTab, AnalyticsTab, CurrencyManager, AdminTab, SalesTab, HistoryTab, CustomersTab, EventERP

---

## 1. CRITICAL RULES — READ BEFORE ANY EDIT

### Rule 1 — No ES6+ in output
Target is IE11/iOS9 (ES5). Banned: `async/await`, `class`, `?.`, `??`, backtick strings, `flatMap`, `import/export`.  
Allowed: `const`, `let`, `=>`, destructuring, spread `...`, `Promise`.

---

### Rule 2 — Babel Scoping Bug (MOST CRITICAL)
Variables declared after a block-body arrow `() => { }` get compiled inside that block.

```jsx
// ✅ CORRECT — expressions first, block functions LAST
const totalRev = sales.reduce((s,x) => s+x.total, 0);
const fi = inv.filter(i => !isq || i.id.includes(isq));
const addLead   = () => { ... };   // block body — LAST
const saveAudit = () => { ... };   // block body — LAST
```

---

### Rule 3 — useState / Props Scoping Bug
Babel compiles `useState` hooks and prop extractions into the wrong parent function.

**Safe pattern:**
```javascript
// State that MUST live in parent (not child component):
// LookupTab owns — NOT SingleLookup:
var _ps = useState(false);
var photoSearch  = _ps[0];
var sPhotoSearch = _ps[1];
var _cn = useState("");
var custName  = _cn[0];
var sCustName = _cn[1];
```

**Never inject `var x = p.x` into a function that uses `_refN` destructuring (e.g. EventERP uses `_ref47`, not `p`).**  
The post-compile patch script must check function signature before inserting prop declarations.

---

### Rule 4 — Post-Compile Patch Script (run after EVERY compile)

```python
import re

with open('compiled.js') as f:
    c = f.read()

# 1. AdminTab missing vars
adm = c.find('function AdminTab(p) {')
ms = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[adm:adm+5000]))
last = adm + ms[-1].end()
for v in ['totalRev','audits','ist','atab','sat']:
    if f'var {v}' not in c[adm:last+300]:
        c = c[:last] + f'\n  var {v} = p.{v};' + c[last:]

# 2. InventoryTab aliases
inv = c.find('function InventoryTab(p) {')
ms2 = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[inv:inv+5000]))
last2 = inv + ms2[-1].end()
for alias, prop in [('sauditLoc','saLoc'),('sauditScanned','saScanned')]:
    if f'var {alias}' not in c[inv:last2+300]:
        c = c[:last2] + f'\n  var {alias} = p.{prop};' + c[last2:]

# 3. No GST in sellMulti
c = c.replace(
    'cgst: Math.round(ip * 0.015 * 100) / 100,\n          sgst: Math.round(ip * 0.015 * 100) / 100,',
    'cgst: 0,\n          sgst: 0,'
)

# 4. SingleLookup scope fixes (BEFORE return statement)
sl = c.find('function SingleLookup(p) {')
sl_ret = c.find('\n  return ', sl)
for decl in [
    'var custName = p.custName !== undefined ? p.custName : ""; var sCustName = p.sCustName || function(){};',
    'var photoSearch = p.photoSearch; var sPhotoSearch = p.sPhotoSearch;',
    'var onAddLead = p.onAddLead;',
]:
    key = decl.split(' ')[1]
    if key not in c[sl:sl_ret]:
        c = c[:sl_ret] + '\n  ' + decl + c[sl_ret:]
        sl_ret = c.find('\n  return ', c.find('function SingleLookup(p) {'))

# 5. LookupTab state (custName + photoSearch)
lt = c.find('function LookupTab(p) {')
lt_ret = c.find('\n  return ', lt)
if 'var _cn = useState("")' not in c[lt:lt_ret]:
    old = '  var _ps = useState(false);\n  var photoSearch = _ps[0];\n  var sPhotoSearch = _ps[1];'
    c = c.replace(old, old + '\n  var _cn = useState("");\n  var custName = _cn[0];\n  var sCustName = _cn[1];', 1)

# 6. Pass props through call chains
def ensure_prop(search, close, prop, code):
    pos = code.find(search)
    end = code.find(close, pos)
    if pos > 0 and prop not in code[pos:end]:
        return code[:end] + f',\n    {prop}' + code[end:]
    return code

for search, close, prop in [
    ('React.createElement(SingleLookup,', '})', 'custName: custName'),
    ('React.createElement(SingleLookup,', '})', 'sCustName: sCustName'),
    ('React.createElement(SingleLookup,', '})', 'onAddLead: onAddLead'),
    ('React.createElement(MultiLookup,',  '})', 'onAddLead: onAddLead'),
]:
    c = ensure_prop(search, close, prop, c)

# 7. onAddLead received in child components
for fn_name in ['LookupTab', 'SalesTab', 'MultiLookup']:
    fn_pos = c.find(f'function {fn_name}(p) {{')
    fn_ret = c.find('\n  return ', fn_pos)
    if 'var onAddLead = p.onAddLead' not in c[fn_pos:fn_ret]:
        ms = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[fn_pos:fn_pos+5000]))
        if ms:
            last = fn_pos + ms[-1].end()
            c = c[:last] + '\n  var onAddLead = p.onAddLead;' + c[last:]

# 8. onAddLead passed from EventERP to LookupTab and SalesTab
for call_fn in ['LookupTab', 'SalesTab']:
    call = c.rfind(f'React.createElement({call_fn},')
    end  = c.find('})', call)
    if 'onAddLead' not in c[call:end]:
        c = c[:end] + ',\n    onAddLead: onAddLead' + c[end:]

# 9. CRITICAL: Remove stray p.photoSearch from EventERP
# EventERP uses _refN destructuring, NOT p
erp = c.find('function EventERP(')
erp_end = c.find('\nfunction LookupTab(', erp)
erp_body = c[erp:erp_end]
if 'var photoSearch = p.photoSearch' in erp_body:
    erp_body = erp_body.replace('\n  var photoSearch = p.photoSearch;\n  var sPhotoSearch = p.sPhotoSearch;', '', 1)
    c = c[:erp] + erp_body + c[erp_end:]

with open('compiled.js', 'w') as f:
    f.write(c)
print('Post-patch done:', len(c)//1024, 'KB')
```

---

### Rule 5 — JSX Function Size Limit
The artifact renderer fails on JSX functions > ~15KB. EventERP render is split into 9 tab components. Never put > 12KB of JSX in one `return()` block.

---

## 2. BUILD SYSTEM

```bash
node transform.js         # compile JSX → ES5 (outputs compiled.js)
python3 post_patch.py     # apply Rule 4 fixes
python3 build_html.py     # bundle into single HTML file
```

### transform.js
```javascript
const babel = require('@babel/core');
const fs = require('fs');
const jsx = fs.readFileSync('./vianne-jewels-erp.jsx', 'utf8');
const code = jsx
  .replace('import{useState,useRef,useEffect}from"react";',
    'var _R=React;var useState=_R.useState;var useRef=_R.useRef;var useEffect=_R.useEffect;')
  .replace('export default function App()', 'function App()')
  + '\nReactDOM.render(React.createElement(App,null),document.getElementById("root"));';
const result = babel.transformSync(code, {
  presets: [['@babel/preset-env',{targets:{ie:'11',ios:'9'},useBuiltIns:false}],'@babel/preset-react'],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
  sourceType: 'script'
});
fs.writeFileSync('./compiled.js', result.code);
console.log('SUCCESS:', Math.round(result.code.length/1024)+'KB');
```

---

## 3. COMPONENT TREE

```
App
├── Login
└── EventHub
    ├── ManageEvent (edit name/loc/dates/colour/status + delete)
    └── EventERP
        ├── LookupTab              ← owns: custName, photoSearch state
        │   ├── PhotoSearch        ← visual photo search
        │   ├── SingleLookup       ← receives custName+photoSearch+onAddLead as props
        │   │   ├── QRScanner
        │   │   ├── ItemCard       ← full customer form (name*,phone*,email*,company,source)
        │   │   │   ├── SaleSuccess ← animated sale confirmation screen
        │   │   │   └── InvoiceSheet
        │   └── MultiLookup        ← full customer form before Convert to Sale
        ├── SalesTab               ← Direct Sale Entry (price edit + disc + markup + CC)
        ├── HistoryTab             ← List + Analytics views + customer drill-down
        ├── InventoryTab
        ├── AnalyticsTab           ← 7 sub-tabs: Overview/Timing/StockIQ/Customers/Staff/Revenue/Pipeline
        ├── CustomersTab
        └── AdminTab
            ├── CurrencyManager
            └── UserManager

Global helpers (declared above App):
  ToastContainer, useDark(), toggleDark(), getDark()
  PA (press animation helper — removed from compiled, applied inline)
```

---

## 4. STATE MAP

### EventERP useState hooks
```javascript
const [tab,    st]       = useState("lookup")
const [inv,    si]       = useState(ev.inv||[])
const [sales,  ssl]      = useState(ev.sales||[])
const [leads,  sld]      = useState(ev.leads||[])
const [cur,    scur]     = useState("USD")
const [jc,     sjc]      = useState("")
const [det,    sdet]     = useState(null)
const [mlTab,  smlTab]   = useState("single")
const [mlInput,smlInput] = useState("")
const [mlItems,smlItems] = useState([])
const [mlDisc, smlDisc]  = useState("")
const [mlMarkup,smlMarkup]=useState("")
const [mlNF,   smlNF]    = useState([])
const [mlScan, smlScan]  = useState(false)
const [showFilter,sShowFilter]=useState(false)
const [fCat..fMaxFp]     // 14 smart filter states
const [scan,   sscan]    = useState(false)
const [invTab, sivTab]   = useState("stock")
const [isq..icat]        // inventory search/filter states
const [auditLoc,saLoc]   = useState("Exhibition")
const [auditScanned,saScanned]=useState([])
const [audits, sAudits]  = useState(ev.audits||[])
const [hstaff, shs]      = useState("All")
const [atab,   sat]      = useState("overview")
const [showSwitch,ssw]   = useState(false)
const [showUser,ssu]     = useState(false)
```

### LookupTab useState (MUST live here, not in children)
```javascript
var _ps = useState(false);
var photoSearch  = _ps[0];   // photo search panel open
var sPhotoSearch = _ps[1];

var _cn = useState("");
var custName  = _cn[0];      // customer name typed before scan
var sCustName = _cn[1];
```

### SalesTab Direct Sale Entry state
```javascript
const [showNewSale, sShowNewSale] = useState(false)
const [nsCust, snsCust]  = useState({name:"",phone:"",email:"",company:"",source:"Walk-in"})
const [nsItems, snsItems]= useState([])  // [{...item, overridePrice: null}]
const [nsPayment, snsPayment] = useState("NEFT")
const [nsDisc,   snsDisc]    = useState("")   // discount %
const [nsMarkup, snsMarkup]  = useState("")   // markup %
const [nsCCType, snsCCType]  = useState("pct")
const [nsCCVal,  snsCCVal]   = useState("")
const [nsSearch, snsSearch]  = useState("")
const [nsMatchedCust, snsMatchedCust] = useState(null)

// Computed pricing
nsSubtotal = sum of (overridePrice ?? item.fp) for each item
nsDiscAmt  = nsSubtotal * (nsDisc/100)
nsMarkupAmt= nsSubtotal * (nsMarkup/100)
nsAfterAdj = nsSubtotal - nsDiscAmt + nsMarkupAmt
nsCCAmt    = (nsPayment==="Credit Card") ? CC calculation : 0
nsTotal    = nsAfterAdj + nsCCAmt
```

### EventERP computed vars (simple FIRST, block functions LAST)
```javascript
const totalRev = sales.reduce((s,x) => s+x.total, 0)
const fh       = sales.filter(...)
const stf      = [...new Set(sales.map(s=>s.staff))]
const lkQ      = jc.trim()
const lkResults     = applyFilters(inv, lkQ||null)
const lkShowResults = lkQ.length>0 || activeFilters>0
const locItems = inv.filter(i => i.loc===auditLoc && i.st!=="sold")
const missing  = locItems.filter(i => !auditScanned.find(s=>s.id===i.id))
const cats     = ["All",...new Set(inv.map(i=>i.cat))]
const deadStock= inv.filter(...)
const fi       = inv.filter(...)
const allCats/allCols/allMetals/allShapes/allSt = [...]
const activeFilters = [fCat!=="All",...].filter(Boolean).length
// BLOCK FUNCTIONS LAST:
const addLead    = () => toast.info("...")   // simplified — no prompt
const saveAudit  = () => { ... }
```

### onAddLead — customer create/update
```javascript
// Defined in EventERP, passed down to LookupTab → SingleLookup → ItemCard
//                                               → MultiLookup
//                              and to SalesTab (for Direct Sale Entry)
const onAddLead = (cust, action) => {
  if (action === "update") {
    const nl = leads.map(l => l.id===cust.id ? cust : l);
    sld(nl);
    const ns = sales.map(s => s.custId===cust.id ? {...s, custName:cust.name, phone:cust.phone} : s);
    ssl(ns);
    syncUp(null, ns, nl, null);
  } else {
    const nl = [cust, ...leads];
    sld(nl);
    syncUp(null, null, nl, null);
  }
};
```

### syncUp — data persistence
```javascript
const syncUp = (ni, ns, nl, na) => onUpdateEvent({
  ...ev,
  inv:    ni || inv,
  sales:  ns || sales,
  leads:  nl || leads,
  audits: na || audits,
})
// Pass null for unchanged arrays
```

---

## 5. DATA MODELS

### Inventory Item
```javascript
{
  id:"VJBR0094", style:"BR0065",
  cat:"Bracelets",    // Bracelets|Earrings|Necklaces|Rings|Pendants|Bangles
  col:"CLASSICS",
  metal:"G14KWG",     // G14KWG|G18KWG|G14KYG|G18KYG|G18KRG|G14KRG|PT950
  sz:"L 6.75", qty:1,
  gw:9.66, nw:8.28, tc:6.89, sp:27,
  iv:1427, tod:1556, cpt:1712, ipt:1570, fp:2015,
  em:"💎",
  st:"available",     // available|sold|reserved
  loc:"Exhibition",
  img:"",             // base64 or URL
  views:0, searches:0,
  stones:[{sh:"RD",ct:0.97,tct:1.55}]
}
```

### Sale Record
```javascript
{
  id:"INV-ABC1",
  custId:"LD-ABC1",        // primary link to customer
  custName:"John Doe",     // display — updated if customer renamed
  phone:"+1 555 1234",
  email:"john@example.com",
  company:"Doe Jewelers",
  itemId:"VJBR0094",
  itemName:"Bracelets · CLASSICS · G14KWG",
  metal:"G14KWG", col:"CLASSICS", sz:"L 6.75",
  gw:9.66, nw:8.28, tc:6.89,
  price:2015,        // adjusted price (after disc/markup, before CC)
  disc:0,            // discount %
  cgst:0, sgst:0,    // always 0
  ccType:"pct",      // "pct"|"amt"
  ccVal:"2.5",
  ccAmt:50.38,
  total:2065.38,     // price + ccAmt
  payment:"Credit Card",
  staff:"Naman",
  date:"6/7/2026", time:"9:30:00 AM",
  st:"completed",    // completed|pending|delivered
  gt:"",             // GATI removed — always ""
  remark:"",
  currency:"USD",
  margin:0,
}
```

### Customer / Lead
```javascript
{
  id:"LD-ABC1",
  name:"John Doe",
  phone:"+1 555 1234",
  email:"john@example.com",
  company:"Doe Jewelers",
  contact:"",         // legacy alias for email
  notes:"",
  status:"Warm",      // Hot|Warm|Cold
  source:"Walk-in",   // Walk-in|Shopify|WhatsApp|Referral|Trade Show|Other
  created:"6/7/2026",
}
```

---

## 6. PERMISSIONS

```javascript
const PERMS = {
  Admin:   {vP:1,vH:1,vA:1,oP:1,eC:1,mU:1,sF:1,sB:1,delSale:1},
  Manager: {vP:1,vH:1,vA:0,oP:1,eC:1,mU:0,sF:1,sB:0,delSale:0},
  Staff:   {vP:0,vH:0,vA:0,oP:0,eC:0,mU:0,sF:0,sB:0,delSale:0},
}
// vP=view prices, vH=history, vA=analytics/revenue, oP=discount
// eC=export, mU=manage users+rates, sF=formula, sB=breakdown, delSale=delete sales
```

---

## 7. SELL FLOWS

### Single Lookup (ItemCard)
```
1. Type customer name (optional) in gold input at top of Lookup
2. Scan QR / search item → tap item → ItemCard
3. Customer card at top:
   - Name* (gold border when empty, auto-fills from Customers on match)
   - Phone*, Email* (required — red border when empty)
   - Company, Source
4. Discount slider (pr.oP), Payment method
5. CC Surcharge (only if Credit Card): % Rate or Fixed $
6. Price breakdown → GRAND TOTAL
7. Confirm Sale → SaleSuccess screen (animated ✓, 4s auto-close)
8. Auto creates/updates customer in Customers tab via onAddLead
9. Sale record has custId + custName + email + company
```

### Multi Lookup (MultiLookup)
```
1. Paste codes or scan batch
2. Set discount % or markup %
3. Tap "💰 Convert to Sale" → customer form slides open
4. Same required fields: Name*, Phone*, Email*, Company, Source
5. Confirm → calls sellMulti(custName, phone, custId)
6. All items sold, batch ID assigned, customer created/updated
```

### Direct Sale Entry (SalesTab)
```
1. Tap "+ Direct Sale Entry" in Sales tab
2. Customer: Name*, Phone*, Email*, Company, Payment method
3. Add items by tapping from available inventory list
4. Per-item price: editable $ input (blank = list price)
5. Overall DISCOUNT %: deducted from subtotal (shown in red)
6. Overall MARKUP %: added to subtotal (shown in green)
7. CC Surcharge: appears only if Credit Card selected (% or fixed)
8. Live breakdown: Subtotal → Disc → Markup → CC → GRAND TOTAL
9. Confirm → all items marked sold, customer created/updated, toast
```

### Delete Sale
```
- 🗑 Delete button (Admin only, pr.delSale)
- One tap → sale deleted, item restored to "available"
- Toast: "Sale deleted — {itemId} restored to available"
- No window.confirm popup
```

---

## 8. TOAST SYSTEM

```javascript
// Global, works from any component
toast.success("msg", "sub")
toast.error("msg", "sub")
toast.warn("msg", "sub")
toast.info("msg", "sub")

// All alert() calls have been replaced with toast calls
// ToastContainer renders in App's return
```

---

## 9. DARK MODE

```javascript
// Global toggle, persists to localStorage "vj_dark"
toggleDark()         // call from anywhere
const dark = useDark() // hook to read current value
getDark(dark)        // returns colour token object for dark/light

// Toggle UI in AdminTab → Settings → bottom of My Profile section
// 🌙 Dark Mode toggle switch
```

---

## 10. SALE SUCCESS SCREEN (SaleSuccess component)

```javascript
// Rendered by ItemCard after doSell() confirms
// Full-screen overlay with animated ✓ circle, auto-closes in 4s
// Props: sale, item, fc, cur, onDone (→ back to Lookup), onPrint (→ InvoiceSheet)
```

---

## 11. PHOTO SEARCH

```
PhotoSearch component → before SingleLookup in source
State: owned by LookupTab (photoSearch/sPhotoSearch via _ps = useState(false))
Passed to SingleLookup as props

Pipeline:
  Image → Canvas 120×120 → pixel array
  detectMetal(px) → {metal:"YG"|"WG"|"RG", conf:0-100}
    YG: hue 28-65°, sat>12, lig 30-92%
    RG: hue 340-25°, sat>12, r>b
    WG: sat<22, lig>42%
  detectStones(px) → boolean (sparkle ratio >3%)
  detectCategory(px) → {cat, conf:0-100}
    ar>2.8 → Bracelets, ar>1.8 → Necklaces, ar<0.55 → Pendants
    centre-light squarish → Rings, top/bottom mass → Earrings
  Scoring: category(0-40) + metal(0-35) + stones(15) + status(±5-15)
  Top 6 results with score bar + BEST MATCH badge
```

---

## 12. ANALYTICS TABS (7)

| Tab | Key metrics |
|-----|-------------|
| 📊 Overview | Revenue, units, avg deal, sell-through %, discounts, CC recovered, Pareto insight |
| ⏱ Timing | Sales by hour (bar chart), day-by-day, peak hour insight |
| 💎 Stock IQ | High-interest unsold, dead stock, price sweet spot, carat sweet spot, collection/metal performance |
| 👥 Customers | Top buyers leaderboard 🥇🥈🥉, multi-buy count, lead sources, basket size |
| 🧑‍💼 Staff | Revenue card per staff, avg deal, discount usage warning, category strength |
| 💰 Revenue | Total + 4-day projection, cumulative curve, revenue by category, discount impact |
| 🔁 Pipeline | Lead funnel, conversion rate, hot leads priority list, pipeline value estimate, warm leads |

---

## 13. CURRENCIES

```javascript
const DEFAULT_CURR = {
  USD:{s:"$",r:1},    INR:{s:"₹",r:83.5},   AED:{s:"AED ",r:3.67},
  GBP:{s:"£",r:0.79}, EUR:{s:"€",r:0.92},   SGD:{s:"S$",r:1.35},
  HKD:{s:"HK$",r:7.82},JPY:{s:"¥",r:149.5}, CAD:{s:"CA$",r:1.36},
  AUD:{s:"A$",r:1.52}
}
// Admin-editable via CurrencyManager in Settings
// Saved to localStorage "vj_curr_rates"
```

---

## 14. TEAM CREDENTIALS

```javascript
const USERS = [
  {name:"Nilay",   un:"nilay",   pw:"nilay123",   role:"Admin"},
  {name:"Jimit",   un:"jimit",   pw:"jimit123",   role:"Manager"},
  {name:"Ruchit",  un:"ruchit",  pw:"ruchit123",  role:"Admin"},
  {name:"Naresh",  un:"naresh",  pw:"naresh123",  role:"Staff"},
  {name:"Naman",   un:"naman",   pw:"naman123",   role:"Admin"},
  {name:"Nihar",   un:"nihar",   pw:"nihar123",   role:"Staff"},
  {name:"Dhruvit", un:"dhruvit", pw:"dhruvit123", role:"Staff"},
]
```

---

## 15. WHAT'S REMOVED

| Feature | Status |
|---------|--------|
| GATI booking/button | Removed entirely — `gt:""` always |
| `window.alert()` | Replaced with `toast.*` everywhere |
| `window.confirm()` | Replaced with inline confirm UI |
| `window.prompt()` | Removed — customers added via proper forms |
| CGST/SGST | Always 0 — international B2B |

---

## 16. CUSTOMER LINKING

Sales are linked to customers via **both** `custId` (permanent) and `custName` (display):

```javascript
// When sale confirmed from ANY flow:
// 1. Check if customer exists by name match
// 2. If yes → update their details, use existing custId
// 3. If no  → create new customer in leads, use new custId
// 4. Sale record gets: custId, custName, phone, email, company

// When customer edited in CustomersTab:
// → All their sales updated via custId match
// (custName, phone in sales records stay in sync)

// When sale deleted:
// → item.st restored to "available"
// → sale removed from sales array
// → syncUp called with updated inv + sales
```

---

## 17. FIREBASE DEPLOYMENT

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public dir: .  single-page: No
cp vianne-jewels-erp.html index.html
firebase deploy
```

**firebase.json:**
```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json","node_modules","*.jsx","compiled.js","*.py","*.md"],
    "headers": [{"source":"**/*.html","headers":[{"key":"Cache-Control","value":"no-cache"}]}]
  }
}
```

---

## 18. QUICK EDIT REFERENCE

| What | Where in vianne-jewels-erp.jsx |
|------|-------------------------------|
| Login passwords | `const USERS = [...]` top of file |
| Currency rates | `const DEFAULT_CURR = {...}` top of file |
| App colours | `const G=..., GD=..., GO=...` constants |
| Payment methods | `["NEFT","RTGS",...]` in ItemCard, MultiLookup, SalesTab |
| Audit locations | `["Exhibition","Vault","Office","All"]` in InventoryTab |
| Invoice print HTML | `doPrint()` inside InvoiceSheet |
| Photo search thresholds | `detectMetal()`, `detectCategory()` in PhotoSearch |
| Smart filter logic | `applyFilters()` in EventERP body |
| History analytics | `function HistoryTab(p)` |
| Analytics sub-tabs | `function AnalyticsTab(p)` |
| Customer add form | `function CustomersTab(p)` |
| Currency rate editor | `function CurrencyManager({...})` |
| User management | `function UserManager({...})` |
| Event edit/delete | `function ManageEvent({...})` |
| Event colour options | `COLORS` array in ManageEvent |
| Permission defaults | `PERMS` in `gp()` function |
| Dark mode toggle UI | `function AdminTab(p)` → Sign Out section |
| Direct sale pricing | `SalesTab` → `confirmNewSale` function |

---

## 19. BUSINESS CONTEXT

| | |
|---|---|
| Company | Vianne Jewels ("The Signature of Affordable Sophistication") |
| Business | B2B diamond jewelry — trade shows + wholesale |
| Events | JCK Las Vegas (June), IIJS Mumbai (August) |
| Platform | iPad / iPhone at booth |
| JCK 2026 | $139K revenue, 123 units, 37.4% conversion, 41 customers |
| Invoice | No CGST/SGST (international B2B), CC surcharge optional |
| Currency | USD default, 10 currencies, Admin-editable |
| Hosting | Firebase Hosting (planned) |
| Builder | Naman (Admin) |
| Key staff | Nilay (top closer), Jimit (Manager), Ruchit/Naresh/Nihar/Dhruvit |

