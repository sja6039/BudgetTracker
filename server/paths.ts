import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const DATA = resolve(ROOT, 'data');

export const paths = {
  transactions: resolve(DATA, 'transactions.csv'),
  investments: resolve(DATA, 'investments.csv'),
  budgets: resolve(DATA, 'budgets.csv'),
  subscriptions: resolve(DATA, 'subscriptions.csv'),
  statements: resolve(DATA, 'statements.csv'),
  priceCache: resolve(DATA, 'price_cache.json'),
};

export const TRANSACTION_COLUMNS = [
  'transaction_id', 'date', 'merchant', 'description', 'amount',
  'category', 'category_override', 'is_subscription', 'statement_id', 'account_name',
];
export const INVESTMENT_COLUMNS = [
  'id', 'symbol', 'name', 'shares', 'cost_basis', 'asset_type', 'account', 'added_date',
];
export const BUDGET_COLUMNS = ['category', 'monthly_limit'];
export const SUBSCRIPTION_COLUMNS = ['merchant', 'user_status'];
export const STATEMENT_COLUMNS = [
  'id', 'filename', 'uploaded_at', 'institution', 'account_name', 'account_mask',
  'account_type', 'period_from', 'period_to', 'ending_balance', 'transaction_count',
];
