# Vianne Jewels ERP

Self-contained trade show ERP for B2B diamond jewelry operations. Runs entirely in the browser — no backend, no bundler at runtime.

**Stack:** React 17 (ES5 compiled), jsQR scanner, localStorage persistence.

## Quick start

Open `index.html` in a browser (or serve locally):

```bash
cd vianne-jck
python3 -m http.server 8080
# → http://localhost:8080
```

## Login (demo)

| User    | Password    | Role    |
|---------|-------------|---------|
| nilay   | nilay123    | Admin   |
| naman   | naman123    | Admin   |
| jimit   | jimit123    | Manager |
| naresh  | naresh123   | Staff   |

## Build from source

Edit `vianne-jewels-erp.jsx`, then:

```bash
npm install
npm run build
```

Outputs:
- `compiled.js` — ES5 app code (~247 KB)
- `vianne-jewels-erp.html` — full self-contained bundle (~629 KB)
- `index.html` — same as above (deploy entry point)

## Project files

| File | Purpose |
|------|---------|
| `vianne-jewels-erp.jsx` | React source — edit this for features |
| `transform.js` | Babel compile (JSX → ES5) |
| `bundle.js` | Assembles React + jsQR + app into HTML |
| `SPEC.md` | Full architecture & development guide |

## Features

- Lookup with smart filters, QR scanner, single & multi sell flows
- Sales, history, inventory audit, customers, analytics
- Role-based permissions (Admin / Manager / Staff)
- Multi-currency display with editable exchange rates
- Multi-event support (JCK Las Vegas 2026, IIJS, etc.)
- Invoice print (no GST — international B2B)

## Optional: product photos

The app patches images from `window.VJ_IMG` when available. To load the full JCK catalog photos from `vianne-jck-2026`, add before the app script in a custom bundle:

```html
<script src="../vianne-jck-2026/js/images.js"></script>
```

Then set `window.VJ_IMG = IMGS` or use the built-in patch logic in `App`.
