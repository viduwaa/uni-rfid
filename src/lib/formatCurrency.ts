export function formatCurrency(
  amount: number | null | undefined,
  opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const value = typeof amount === "number" ? amount : 0;
  const min = opts?.minimumFractionDigits ?? 2;
  const max = opts?.maximumFractionDigits ?? 2;

  // Use en-IN number formatting but prefix with "Rs." to match project preference
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(value);

  return `Rs. ${formatted}`;
}

export default formatCurrency;
