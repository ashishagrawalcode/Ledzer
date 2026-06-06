export interface TaxBreakdown {
  label: string;
  amount: number;
}

export function calculateTax(subtotal: number, rate: number) {
  if (rate <= 0) return { totalTax: 0, breakdown: [] };

  const totalTax = Number((subtotal * (rate / 100)).toFixed(2));
  
  return {
    totalTax,
    breakdown: [{ label: `Tax (${rate}%)`, amount: totalTax }]
  };
}