import type { Category, Transaction } from '../shared/types.js';

const TRANSFER_PATTERNS = [
  /online\s+transfer/i,
  /internal\s+transfer/i,
  /to\s+share\b/i,
  /from\s+share\b/i,
  /to\s+savings\b/i,
  /from\s+savings\b/i,
  /to\s+checking\b/i,
  /from\s+checking\b/i,
];

const VENMO_PAYPAL_PATTERNS = [
  /\bvenmo\b/i,
  /\bpaypal\b/i,
  /\bpypl\b/i,
];

const matchesAny = (patterns: RegExp[], ...sources: string[]): boolean =>
  patterns.some((re) => sources.some((s) => re.test(s)));

export const categorizeMerchant = (merchant: string, description: string): Category | null => {
  if (matchesAny(TRANSFER_PATTERNS, merchant, description)) return 'Transfer';
  if (matchesAny(VENMO_PAYPAL_PATTERNS, merchant, description)) return 'Venmo/PayPal';
  return null;
};

export const applyCategoryRules = (tx: Transaction): Transaction => {
  if (tx.category_override) return tx;
  const inferred = categorizeMerchant(tx.merchant, tx.description);
  return inferred ? { ...tx, category: inferred } : tx;
};
