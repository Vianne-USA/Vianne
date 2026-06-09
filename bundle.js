const fs = require('fs');
const path = require('path');

const react = fs.readFileSync(
  path.join(__dirname, 'node_modules/react/umd/react.production.min.js'),
  'utf8'
);
const reactDom = fs.readFileSync(
  path.join(__dirname, 'node_modules/react-dom/umd/react-dom.production.min.js'),
  'utf8'
);
const jsqr = fs.readFileSync(
  path.join(__dirname, 'node_modules/jsqr/dist/jsQR.js'),
  'utf8'
);
const app = fs.readFileSync(path.join(__dirname, 'compiled.js'), 'utf8');

const css = `*{box-sizing:border-box;margin:0;padding:0}
html{height:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;color-scheme:light dark}
body{height:100%;min-height:100dvh;min-height:-webkit-fill-available;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:none;font-family:Lato,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#163D2E;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
#root{min-height:100dvh;min-height:-webkit-fill-available}
button,input,select,textarea{font-family:inherit;font-size:16px;touch-action:manipulation}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
input,select,textarea{-webkit-appearance:none;appearance:none;border-radius:0}
img,svg,video{max-width:100%;height:auto;display:block}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(30,92,69,0.3);border-radius:2px}`;

const headMeta = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
<meta name="description" content="Vianne Jewels — trade show ERP for inventory, sales, and customer lookup">
<meta name="format-detection" content="telephone=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Vianne">
<meta name="theme-color" content="#1E5C45">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lato:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">`;

const html = `<!DOCTYPE html>
<html lang="en"><head>
${headMeta}
<title>Vianne</title>
<style>${css}</style>
</head><body>
<div id="root"></div>
<script>${react}</script>
<script>${reactDom}</script>
<script>${jsqr}</script>
<script>${app}</script>
</body></html>`;

const outHtml = path.join(__dirname, 'Vianne.html');
const indexHtml = path.join(__dirname, 'index.html');
fs.writeFileSync(outHtml, html);
fs.writeFileSync(indexHtml, html);

const kb = (html.length / 1024).toFixed(1);
console.log('BUNDLED: ' + kb + ' KB → Vianne.html + index.html');
