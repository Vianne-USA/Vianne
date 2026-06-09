const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'icon-512.png');
const iconset = path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

if (!fs.existsSync(src)) {
  console.error('Missing assets/icon-512.png — run npm run build first');
  process.exit(1);
}
if (!fs.existsSync(iconset)) {
  console.error('Missing iOS project — run: npx cap add ios');
  process.exit(1);
}

const sizes = [
  { size: 20, scale: 2, id: 'icon-20@2x.png' },
  { size: 20, scale: 3, id: 'icon-20@3x.png' },
  { size: 29, scale: 2, id: 'icon-29@2x.png' },
  { size: 29, scale: 3, id: 'icon-29@3x.png' },
  { size: 40, scale: 2, id: 'icon-40@2x.png' },
  { size: 40, scale: 3, id: 'icon-40@3x.png' },
  { size: 60, scale: 2, id: 'icon-60@2x.png' },
  { size: 60, scale: 3, id: 'icon-60@3x.png' },
  { size: 1024, scale: 1, id: 'icon-1024.png' }
];

const images = sizes.map(({ size, scale, id }) => {
  const px = size * scale;
  const out = path.join(iconset, id);
  execSync(`sips -z ${px} ${px} "${src}" --out "${out}"`, { stdio: 'ignore' });
  return {
    id,
    size: `${size}x${size}`,
    scale: `${scale}x`,
    filename: id
  };
});

const contents = {
  images: images.map(({ size, scale, filename }) => ({
    filename,
    idiom: 'iphone',
    scale,
    size
  })).concat(images.filter(i => i.id === 'icon-1024.png').map(({ filename }) => ({
    filename,
    idiom: 'ios-marketing',
    scale: '1x',
    size: '1024x1024'
  }))),
  info: { author: 'xcode', version: 1 }
};

fs.writeFileSync(path.join(iconset, 'Contents.json'), JSON.stringify(contents, null, 2));
console.log('iOS App Store icons generated in AppIcon.appiconset');
