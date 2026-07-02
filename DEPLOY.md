# Vianne — Deploy & Git Workflow

## Architecture

```
Ruchit Mac (edit Vianne.jsx)
    ↓ npm run build
    ↓ git push
GitHub (Vianne-USA/Vianne)
    ↓ auto-trigger
Vercel (live webapp)
```

## One-time setup (Naman / org admin)

### 1. Create GitHub repo
- Repo: **https://github.com/Vianne-USA/Vianne** (already created)
- Public, empty (no README)

### 2. Add collaborators
- **RUCHITJIYANI** → Write
- Naman already has admin

### 3. Connect Vercel to GitHub
- Vercel → **vianne** project → **Settings** → **Git**
- Connect repository: `Vianne-USA/Vianne`
- Production branch: `main`
- Build settings (should match `vercel.json`):
  - Framework: Other
  - Build Command: *(empty)*
  - Output Directory: `.`
  - Install Command: *(empty)*

### 4. Google Drive sync (all devices — required)

Cloud sync uses **Google Drive only** (no Vercel Blob). The folder **must** be inside a **Google Workspace Shared Drive** (not My Drive).

**Google Workspace (one-time):**
1. [Google Drive](https://drive.google.com) → **Shared drives** → **New** → name it e.g. `Vianne Data`
2. Inside it, create a folder e.g. `Vianne Jewels`
3. Open the folder → copy the ID from the URL: `.../folders/FOLDER_ID_HERE`
4. **Manage members** → add the service account email from `GOOGLE_SERVICE_ACCOUNT_JSON` (`client_email`) as **Content manager**

**Vercel env vars (Production):**
| Variable | Value |
|----------|--------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON from Google Cloud service account |
| `GOOGLE_DRIVE_FOLDER_ID` | Folder ID from step 3 |

Optional: remove `BLOB_STORE_ID` / Blob env vars — not used anymore.

**Verify:** open `https://vianne-lac.vercel.app/api/data` — should show `"syncApiVersion": 6`, `"store": "drive"`, `"drive": true`.

Debug: `https://vianne-lac.vercel.app/api/data?debug=1` — check `driveStatus`.

### 5. Photo Search AI vision (optional but recommended)

Photo Search uses a real AI vision model to identify a photographed piece
(category, metal, stones) and match it against inventory. Without this key,
it silently falls back to a basic on-device color heuristic that's much less
accurate on busy/real-world photos.

**Vercel env var (Production):**
| Variable | Value |
|----------|--------|
| `ANTHROPIC_API_KEY` | An Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |

Each photo search costs a small, per-image API fee (uses `claude-haiku-4-5`).
No other setup needed — `api/photo-search.js` picks it up automatically once
the env var is set and redeployed.

### 5. First push from Ruchit's Mac
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
gh api repos/Vianne-USA/Vianne --jq .permissions.push   # must be true
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Repository not found` | Use correct repo: `Vianne-USA/Vianne` not `viannejewelsusa/Vianne` |
| `Permission denied 403` | Naman adds RUCHITJIYANI as **Write** |
| Vercel looks for `public/` | Output Directory = `.` in Vercel settings |
| Wrong folder on Mac | Use `/Users/rj/Downloads/VIANNE/Vianne` (not ~/Downloads/Vianne) |
| Cloud sync empty / Shared Drive error | Move folder to a **Shared Drive**, share with service account, update `GOOGLE_DRIVE_FOLDER_ID`, redeploy |
| `syncApiVersion` not 6 on `/api/data` | Redeploy latest commit from `main` (not an old Redeploy) |

## Files in git

| Committed | Ignored |
|-----------|---------|
| `Vianne.jsx`, `index.html`, `Vianne.html` | `node_modules/` |
| `vercel.json`, `package.json` | `compiled.js` |
| `transform.js`, `bundle.js`, `post_patch.py` | |
