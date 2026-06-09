# Vianne

Self-contained trade show ERP for Vianne Jewels (v6.0). Runs entirely in the browser.

**Stack:** React 17 → ES5, jsQR, toasts, dark mode, photo search, direct sale entry.

## Quick start

```bash
cd Vianne
python3 -m http.server 8080
```

## Build from source

Edit `Vianne.jsx`, then:

```bash
npm install
npm run build
```

Pipeline: `transform.js` → `post_patch.py` → `bundle.js`

Outputs: `index.html` + `Vianne.html` (~763 KB)

## Login (demo)

| User    | Password    | Role    |
|---------|-------------|---------|
| nilay   | nilay123    | Admin   |
| naman   | naman123    | Admin   |
| ruchit  | ruchit123   | Admin   |
| jimit   | jimit123    | Manager |
| naresh  | naresh123   | Staff   |

## Deploy

Push to GitHub → Vercel auto-deploys.

```bash
git pull origin main
npm run build
git add .
git commit -m "describe change"
git push origin main
```

See `SPEC.md` for full architecture (v6.0).
