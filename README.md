# Vianne

Self-contained trade show ERP for Vianne Jewels. Runs entirely in the browser — no backend at runtime.

**Stack:** React 17 (ES5 compiled), jsQR scanner, localStorage persistence.

## Quick start

```bash
cd Vianne
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

Edit `Vianne.jsx`, then:

```bash
npm install
npm run build
```

Outputs:
- `compiled.js` — ES5 app code (~247 KB)
- `Vianne.html` + `index.html` — self-contained bundle (~629 KB)

## Project files

| File | Purpose |
|------|---------|
| `Vianne.jsx` | React source — edit this for features |
| `transform.js` | Babel compile (JSX → ES5) |
| `bundle.js` | Assembles React + jsQR + app into HTML |
| `SPEC.md` | Full architecture & development guide |

## GitHub

Repo: `viannejewelsusa/Vianne`

```bash
git pull origin main
npm run build
git add .
git commit -m "describe change"
git push origin main
```
