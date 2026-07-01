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
html{width:100%;height:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;color-scheme:light dark}
body{width:100%;height:100%;min-height:100dvh;min-height:-webkit-fill-available;margin:0;padding:0;overflow-x:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:none;font-family:Lato,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#163D2E}
#root{width:100%;min-height:100dvh;min-height:-webkit-fill-available;overflow-x:hidden}
button,input,select,textarea{font-family:inherit;font-size:16px;touch-action:manipulation}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
input,select,textarea{-webkit-appearance:none;appearance:none}
img,svg,video{max-width:100%;height:auto;display:block}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(30,92,69,0.3);border-radius:2px}
.v-content{width:100%;margin:0 auto;padding:16px 14px;padding-left:calc(14px + env(safe-area-inset-left,0px));padding-right:calc(14px + env(safe-area-inset-right,0px));box-sizing:border-box}
.v-erp-shell{width:100%;max-width:100%;margin:0 auto;flex:1;min-height:100dvh;display:flex;flex-direction:column;box-sizing:border-box;font-family:Lato,sans-serif}
.v-erp-scroll{flex:1;background:#F5EDE0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.v-tabbar{background:#1E5C45;display:flex;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;border-bottom:1px solid rgba(201,168,76,0.25);flex-shrink:0}
.v-tabbar::-webkit-scrollbar{display:none}
.v-page-pad{padding:13px 12px 40px}
.v-events-list{display:block}
.v-results-grid,.v-inv-grid{display:block}
.v-login-card{width:100%;max-width:380px;margin:0 auto}
.v-sheet-overlay{display:flex;align-items:flex-end;justify-content:center}
.v-sheet-panel{width:100%;max-width:430px;max-height:93dvh;overflow-y:auto;border-radius:20px 20px 0 0}
.v-erp-ev-name{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.v-hub-header,.v-erp-header{width:100%}
.v-hero-img{height:140px}
@media (min-width:640px){
  .v-content{max-width:720px;padding:18px 20px;padding-left:calc(20px + env(safe-area-inset-left,0px));padding-right:calc(20px + env(safe-area-inset-right,0px))}
  .v-erp-shell{max-width:720px}
  .v-page-pad{padding:16px 18px 44px}
  .v-login-card{max-width:420px}
  .v-sheet-overlay{align-items:center;padding:24px;padding-bottom:calc(24px + env(safe-area-inset-bottom,0px))}
  .v-sheet-panel{max-width:560px;border-radius:20px!important;max-height:85vh}
  .v-sheet-handle{display:none}
  .v-erp-ev-name{max-width:240px}
  .v-events-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .v-events-list>div{margin-bottom:0!important}
  .v-results-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;background:transparent!important;border:none!important;margin-bottom:12px!important}
  .v-results-grid>div{border:1px solid #E8DCCB!important;border-radius:12px!important;background:#fff!important;margin:0!important}
  .v-inv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;background:transparent!important;border:none!important;max-height:none!important;overflow:visible!important}
  .v-inv-grid>div{border:1px solid #E8DCCB!important;border-radius:12px!important;background:#fff!important;margin:0!important}
  .v-hero-img{height:220px}
}
@media (min-width:1024px){
  .v-content{max-width:1200px;padding:22px 28px;padding-left:calc(28px + env(safe-area-inset-left,0px));padding-right:calc(28px + env(safe-area-inset-right,0px))}
  .v-erp-shell{max-width:1200px}
  .v-page-pad{padding:20px 28px 52px}
  .v-login-card{max-width:460px}
  .v-sheet-panel{max-width:640px}
  .v-erp-ev-name{max-width:none}
  .v-tabbar{justify-content:center;gap:2px;padding:0 16px}
  .v-tabbar button{flex:0 1 auto!important;padding:10px 18px!important;font-size:11px!important}
  .v-events-list{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .v-results-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .v-inv-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .v-hero-img{height:300px}
}
@media (min-width:1280px){
  .v-results-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
  .v-inv-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
}`;

const headMeta = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover,interactive-widget=resizes-content">
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
<div id="root"><div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#163D2E;color:#F5EDE0;font-family:Lato,sans-serif;font-size:15px">Loading Vianne…</div></div>
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
