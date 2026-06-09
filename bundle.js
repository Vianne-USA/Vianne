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
html,body{height:100%;min-height:100dvh;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#163D2E;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
#root{min-height:100dvh}
button,input,select,textarea{font-family:inherit;font-size:16px}
input,select,textarea{-webkit-appearance:none;appearance:none}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(30,92,69,0.3);border-radius:2px}`;

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Vianne">
<meta name="theme-color" content="#1E5C45">
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
