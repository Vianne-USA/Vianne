const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'vianne-jewels-erp.jsx');
const outPath = path.join(__dirname, 'compiled.js');

const jsx = fs.readFileSync(jsxPath, 'utf8');
const code = jsx
  .replace(
    'import{useState,useRef,useEffect}from"react";',
    'var _React=React;var useState=_React.useState;var useRef=_React.useRef;var useEffect=_React.useEffect;'
  )
  .replace('export default function App()', 'function App()')
  + '\nReactDOM.render(React.createElement(App,null),document.getElementById("root"));';

const result = babel.transformSync(code, {
  presets: [
    ['@babel/preset-env', { targets: { ie: '11', ios: '9' }, useBuiltIns: false }],
    '@babel/preset-react'
  ],
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
  sourceType: 'script'
});

fs.writeFileSync(outPath, result.code);
const kb = (result.code.length / 1024).toFixed(1);
console.log('SUCCESS: ' + kb + ' KB');
