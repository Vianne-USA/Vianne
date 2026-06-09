const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const jsxPath = path.join(__dirname, 'Vianne.jsx');
const outPath = path.join(__dirname, 'compiled.js');

const jsx = fs.readFileSync(jsxPath, 'utf8');
const code = jsx
  .replace(
    'import{useState,useRef,useEffect}from"react";',
    'var _R=React;var useState=_R.useState;var useRef=_R.useRef;var useEffect=_R.useEffect;'
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
console.log('SUCCESS:', Math.round(result.code.length / 1024) + 'KB');
