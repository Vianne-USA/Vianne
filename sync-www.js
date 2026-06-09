const fs = require('fs');
const path = require('path');

const root = __dirname;
const www = path.join(root, 'www');

const copyFile = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
};

if (fs.existsSync(www)) fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

copyFile(path.join(root, 'index.html'), path.join(www, 'index.html'));
copyFile(path.join(root, 'manifest.webmanifest'), path.join(www, 'manifest.webmanifest'));
copyDir(path.join(root, 'assets'), path.join(www, 'assets'));

console.log('SYNCED www/ for Capacitor');
