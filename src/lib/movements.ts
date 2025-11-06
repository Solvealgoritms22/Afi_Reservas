export function monthKey(iso: string) {
  return iso?.slice(0, 7) || "";
}

export function parseISO(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : ""));
}

export function deriveType(
  concept: string,
): "Aporte" | "Rescate" | "Rendimiento" | "Saldo Anterior" | "Saldo Final" | "Otro" {
  const c = (concept || "").toLowerCase();
  if (c.includes("aporte")) return "Aporte";
  if (c.includes("rescate")) return "Rescate";
  if (c.includes("rendimiento")) return "Rendimiento";
  if (c.includes("saldo anterior")) return "Saldo Anterior";
  if (c.includes("saldo final")) return "Saldo Final";
  return "Otro";
}

export function formatDurationSince(startISO: string): string {
  const start = parseISO(startISO);
  const end = new Date();
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  const totalMonths = years * 12 + months;
  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;
  const parts: string[] = [];
  if (yrs > 0) parts.push(`${yrs} año${yrs > 1 ? "s" : ""}`);
  if (mos > 0) parts.push(`${mos} mes${mos > 1 ? "es" : ""}`);
  return parts.length ? parts.join(" y ") : "0 meses";
}