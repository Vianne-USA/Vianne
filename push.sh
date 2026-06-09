#!/bin/bash
# Build and push Vianne to GitHub (auto-deploys on Vercel)
set -e
cd "$(dirname "$0")"

echo "=== 1. Check GitHub access ==="
PUSH_OK=$(gh api repos/Vianne-USA/Vianne --jq .permissions.push 2>/dev/null || echo "error")
if [ "$PUSH_OK" != "true" ]; then
  echo "ERROR: Cannot push to Vianne-USA/Vianne (permissions.push = $PUSH_OK)"
  echo "Ask Naman to:"
  echo "  1. Repo exists: https://github.com/Vianne-USA/Vianne"
  echo "  2. Add RUCHITJIYANI as Write collaborator"
  echo "  3. Connect repo in Vercel → Project Settings → Git"
  exit 1
fi

echo "=== 2. Pull latest ==="
git pull origin main

echo "=== 3. Build ==="
npm run build

echo "=== 4. Commit & push ==="
git add Vianne.jsx index.html Vianne.html vercel.json manifest.webmanifest assets/ \
  package.json package-lock.json transform.js bundle.js post_patch.py README.md SPEC.md \
  .gitignore .nojekyll push.sh DEPLOY.md
git diff --cached --quiet || git commit -m "${1:-Update Vianne app}"
git push origin main

echo ""
echo "Done. Vercel will auto-deploy in ~1 min."
echo "Check: Vercel dashboard → vianne project → Deployments"
