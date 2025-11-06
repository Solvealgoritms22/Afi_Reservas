export function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n) >= 1000000) {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    });
  }
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

export function formatMoneyFull(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}