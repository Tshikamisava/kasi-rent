export function formatRand(amount: number | string | null | undefined) {
  if (amount == null || amount === '') return 'R0';
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  // Use en-ZA locale for South African formatting
  return `R${num.toLocaleString('en-ZA')}`;
}

export function parseRand(input: string) {
  if (!input) return 0;
  // Remove non-digit characters
  const cleaned = input.replace(/[^0-9.-]/g, '');
  return Number(cleaned) || 0;
}
