# Vianne — Deploy & Git Workflow

## Architecture

```
Ruchit Mac (edit Vianne.jsx)
    ↓ npm run build
    ↓ git push
GitHub (viannejewelsusa/Vianne)
    ↓ auto-trigger
Vercel (live webapp)
```

## One-time setup (Naman / org admin)

### 1. Create GitHub repo
- https://github.com/organizations/viannejewelsusa/repositories/new
- Name: **Vianne**
- Public, empty (no README)

### 2. Add collaborators
- **RUCHITJIYANI** → Write
- Naman already has admin

### 3. Connect Vercel to GitHub
- Vercel → **vianne** project → **Settings** → **Git**
- Connect repository: `viannejewelsusa/Vianne`
- Production branch: `main`
- Build settings (should match `vercel.json`):
  - Framework: Other
  - Build Command: *(empty)*
  - Output Directory: `.`
  - Install Command: *(empty)*

### 4. First push from Ruchit's Mac
```bash
cd /Users/rj/Downloads/VIANNE/Vianne
gh auth setup-git
git pull origin main --allow-unrelated-histories   # if repo has upload commits
./push.sh "Initial v6.0 deploy"
```

## Daily workflow (Ruchit)

```bash
cd /Users/rj/Downloads/VIANNE/Vianne
git pull origin main
# edit Vianne.jsx only
npm run build
git add .
git commit -m "describe your change"
git push origin main
```

Or use the helper script:
```bash
./push.sh "describe your change"
```

Vercel redeploys automatically (~1 minute).

## Daily workflow (Naman)

```bash
cd ~/Downloads/Vianne
git pull origin main
# edit if needed
npm run build    # only if editing Vianne.jsx
git add .
git commit -m "describe change"
git push origin main
```

## Build pipeline

```bash
npm run build
# = compile (transform.js) → patch (post_patch.py) → bundle (bundle.js)
```

| Step | Output |
|------|--------|
| compile | `compiled.js` (gitignored, regenerated each build) |
| patch | fixes Babel scoping bugs |
| bundle | `index.html` + `Vianne.html` (~763 KB) |

## Verify before push

```bash
npm run build                                    # must succeed
python3 -m http.server 8080                      # test locally
gh api repos/viannejewelsusa/Vianne --jq .permissions.push   # must be true
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Repository not found` | Naman creates `viannejewelsusa/Vianne` repo |
| `Permission denied 403` | Naman adds RUCHITJIYANI as **Write** |
| Vercel looks for `public/` | Output Directory = `.` in Vercel settings |
| Wrong folder on Mac | Use `/Users/rj/Downloads/VIANNE/Vianne` (not ~/Downloads/Vianne) |
| `fatal: origin does not exist` | `git remote add origin https://github.com/viannejewelsusa/Vianne.git` |

## Files in git

| Committed | Ignored |
|-----------|---------|
| `Vianne.jsx`, `index.html`, `Vianne.html` | `node_modules/` |
| `vercel.json`, `package.json` | `compiled.js` |
| `transform.js`, `bundle.js`, `post_patch.py` | |
