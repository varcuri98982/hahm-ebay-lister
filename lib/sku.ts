// SKU helpers ported from ebay_lister_v2_robust.py so web SKUs match the bin
// codes you already use (e.g. bin "K75" → items K75-A, K75-B, …).

export function sanitizeSku(value: string): string {
  let sku = String(value ?? "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-");
  sku = sku.replace(/-+/g, "-").replace(/^[-._]+|[-._]+$/g, "");
  return sku.slice(0, 50);
}

// Bijective base-26: 0→A, 25→Z, 26→AA, 27→AB, … (matches _next_suffix).
export function nextSuffix(index: number): string {
  const letters: string[] = [];
  let current = index;
  for (;;) {
    const remainder = current % 26;
    current = Math.floor(current / 26);
    letters.push(String.fromCharCode(65 + remainder));
    if (current === 0) break;
    current -= 1;
  }
  return letters.reverse().join("");
}

// Build the full item SKU for the Nth item in a bin. If no prefix is supplied,
// leave the SKU blank so the seller can decide the exact custom SKU before post.
export function buildSku(prefix: string, index: number): string {
  const clean = sanitizeSku(prefix);
  const suffix = nextSuffix(index);
  return clean ? `${clean}-${suffix}` : "";
}
