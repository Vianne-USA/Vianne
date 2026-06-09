const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'icon-512.png');
const splashDir = path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');

if (!fs.existsSync(src) || !fs.existsSync(splashDir)) process.exit(0);

const files = [
  ['splash-2732x2732-2.png', 911],
  ['splash-2732x2732-1.png', 1822],
  ['splash-2732x2732.png', 2732]
];

for (const [name, px] of files) {
  execSync(`sips -z ${px} ${px} "${src}" --out "${path.join(splashDir, name)}"`, { stdio: 'ignore' });
}

console.log('Updated iOS launch splash with Vianne logo');
