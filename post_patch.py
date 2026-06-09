#!/usr/bin/env python3
"""Apply post-compile fixes per SPEC.md Rule 4."""
import re
from pathlib import Path

path = Path(__file__).parent / 'compiled.js'
c = path.read_text()

# 1. AdminTab missing vars
adm = c.find('function AdminTab(p) {')
if adm >= 0:
    ms = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[adm:adm + 5000]))
    if ms:
        last = adm + ms[-1].end()
        for v in ['totalRev', 'audits', 'ist', 'atab', 'sat']:
            if f'var {v}' not in c[adm:last + 300]:
                c = c[:last] + f'\n  var {v} = p.{v};' + c[last:]
                last += len(f'\n  var {v} = p.{v};')

# 2. InventoryTab aliases
inv = c.find('function InventoryTab(p) {')
if inv >= 0:
    ms2 = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[inv:inv + 5000]))
    if ms2:
        last2 = inv + ms2[-1].end()
        for alias, prop in [('sauditLoc', 'saLoc'), ('sauditScanned', 'saScanned')]:
            if f'var {alias}' not in c[inv:last2 + 300]:
                c = c[:last2] + f'\n  var {alias} = p.{prop};' + c[last2:]
                last2 += len(f'\n  var {alias} = p.{prop};')

# 3. No GST in sellMulti
c = c.replace(
    'cgst: Math.round(ip * 0.015 * 100) / 100,\n          sgst: Math.round(ip * 0.015 * 100) / 100,',
    'cgst: 0,\n          sgst: 0,'
)

# 4. SingleLookup scope fixes
sl = c.find('function SingleLookup(p) {')
if sl >= 0:
    sl_ret = c.find('\n  return ', sl)
    for decl in [
        'var custName = p.custName !== undefined ? p.custName : ""; var sCustName = p.sCustName || function(){};',
        'var photoSearch = p.photoSearch; var sPhotoSearch = p.sPhotoSearch;',
        'var onAddLead = p.onAddLead;',
    ]:
        key = decl.split(' ')[1]
        if key not in c[sl:sl_ret]:
            c = c[:sl_ret] + '\n  ' + decl + c[sl_ret:]
            sl_ret = c.find('\n  return ', c.find('function SingleLookup(p) {'))

# 5. LookupTab state (custName + photoSearch)
lt = c.find('function LookupTab(p) {')
if lt >= 0:
    lt_ret = c.find('\n  return ', lt)
    if 'var _cn = useState("")' not in c[lt:lt_ret]:
        old = '  var _ps = useState(false);\n  var photoSearch = _ps[0];\n  var sPhotoSearch = _ps[1];'
        c = c.replace(old, old + '\n  var _cn = useState("");\n  var custName = _cn[0];\n  var sCustName = _cn[1];', 1)

# 6. Pass props through call chains
def ensure_prop(search, close, prop, code):
    pos = code.find(search)
    if pos < 0:
        return code
    end = code.find(close, pos)
    if end < 0 or prop in code[pos:end]:
        return code
    return code[:end] + f',\n    {prop}' + code[end:]

for search, close, prop in [
    ('React.createElement(SingleLookup,', '})', 'custName: custName'),
    ('React.createElement(SingleLookup,', '})', 'sCustName: sCustName'),
    ('React.createElement(SingleLookup,', '})', 'onAddLead: onAddLead'),
    ('React.createElement(MultiLookup,', '})', 'onAddLead: onAddLead'),
]:
    c = ensure_prop(search, close, prop, c)

# 7. onAddLead received in child components
for fn_name in ['LookupTab', 'SalesTab', 'MultiLookup']:
    fn_pos = c.find(f'function {fn_name}(p) {{')
    if fn_pos < 0:
        continue
    fn_ret = c.find('\n  return ', fn_pos)
    if 'var onAddLead = p.onAddLead' not in c[fn_pos:fn_ret]:
        ms = list(re.finditer(r'\n  var \w+ = p\.\w+;', c[fn_pos:fn_pos + 5000]))
        if ms:
            last = fn_pos + ms[-1].end()
            c = c[:last] + '\n  var onAddLead = p.onAddLead;' + c[last:]

# 8. onAddLead passed from EventERP to LookupTab and SalesTab
for call_fn in ['LookupTab', 'SalesTab']:
    call = c.rfind(f'React.createElement({call_fn},')
    if call < 0:
        continue
    end = c.find('})', call)
    if 'onAddLead' not in c[call:end]:
        c = c[:end] + ',\n    onAddLead: onAddLead' + c[end:]

# 9. Remove stray p.photoSearch from EventERP (EventERP is last tab component before App)
erp = c.find('function EventERP(')
erp_end = c.find('\nfunction App(', erp)
if erp >= 0 and erp_end > erp:
    erp_body = c[erp:erp_end]
    for stray in [
        '\n  var photoSearch = p.photoSearch;\n  var sPhotoSearch = p.sPhotoSearch;',
        '\n  var photoSearch = p.photoSearch;',
        '\n  var sPhotoSearch = p.sPhotoSearch;',
    ]:
        erp_body = erp_body.replace(stray, '')
    c = c[:erp] + erp_body + c[erp_end:]

path.write_text(c)
print('Post-patch done:', len(c) // 1024, 'KB')
