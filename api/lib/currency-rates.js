const DEFAULT_CURRENCY = {
  USD: { s: "$", r: 1, name: "US Dollar" },
  INR: { s: "₹", r: 83.5, name: "Indian Rupee" },
  AED: { s: "AED ", r: 3.67, name: "UAE Dirham" },
  GBP: { s: "£", r: 0.79, name: "British Pound" },
  EUR: { s: "€", r: 0.92, name: "Euro" },
  SGD: { s: "S$", r: 1.35, name: "Singapore Dollar" },
  HKD: { s: "HK$", r: 7.82, name: "Hong Kong Dollar" },
  JPY: { s: "¥", r: 149.5, name: "Japanese Yen" },
  CAD: { s: "CA$", r: 1.36, name: "Canadian Dollar" },
  AUD: { s: "A$", r: 1.52, name: "Australian Dollar" },
};

function normalizeCurrencyRates(raw) {
  if (!raw || typeof raw !== "object" || !raw.USD || !raw.USD.s) {
    return Object.assign({}, DEFAULT_CURRENCY);
  }
  const out = Object.assign({}, DEFAULT_CURRENCY);
  Object.entries(raw).forEach(([key, value]) => {
    if (!value || typeof value !== "object") return;
    const base = DEFAULT_CURRENCY[key] || { s: "", r: 1, name: key };
    out[key] = {
      s: value.s != null ? String(value.s) : base.s,
      r: Number(value.r) || base.r,
      name: value.name || base.name,
    };
  });
  return out;
}

module.exports = { DEFAULT_CURRENCY, normalizeCurrencyRates };
