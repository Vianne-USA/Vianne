const fs = require('fs');
const path = require('path');

const plistPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'Info.plist');
if (!fs.existsSync(plistPath)) {
  console.error('Info.plist not found — run: npx cap add ios');
  process.exit(1);
}

let plist = fs.readFileSync(plistPath, 'utf8');

const entries = {
  NSCameraUsageDescription:
    'Vianne uses the camera to scan QR codes on jewellery items at trade shows.',
  NSFaceIDUsageDescription:
    'Vianne uses Face ID for quick and secure sign-in.',
  UILaunchStoryboardName: 'LaunchScreen',
  UIRequiresFullScreen: true,
  UISupportedInterfaceOrientations: [
    'UIInterfaceOrientationPortrait'
  ],
  'UISupportedInterfaceOrientations~ipad': [
    'UIInterfaceOrientationPortrait',
    'UIInterfaceOrientationPortraitUpsideDown',
    'UIInterfaceOrientationLandscapeLeft',
    'UIInterfaceOrientationLandscapeRight'
  ]
};

for (const [key, value] of Object.entries(entries)) {
  if (plist.includes(`<key>${key}</key>`)) continue;

  let block;
  if (Array.isArray(value)) {
    block =
      `\t<key>${key}</key>\n\t<array>\n` +
      value.map(v => `\t\t<string>${v}</string>`).join('\n') +
      '\n\t</array>';
  } else if (typeof value === 'boolean') {
    block = `\t<key>${key}</key>\n\t<${value ? 'true' : 'false'}/>`;
  } else {
    block = `\t<key>${key}</key>\n\t<string>${value}</string>`;
  }

  plist = plist.replace('</dict>\n</plist>', `${block}\n</dict>\n</plist>`);
}

fs.writeFileSync(plistPath, plist);
console.log('Patched ios/App/App/Info.plist with camera and Face ID permissions');
