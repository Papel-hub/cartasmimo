// lib/generateCardNumber.ts
export function generateVirtualCardNumber(prefix = 'MIMO'): string {
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${prefix}${randomDigits}`;
}