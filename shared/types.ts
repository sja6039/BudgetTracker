export type Category =
  | 'Housing'
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Travel'
  | 'Subscriptions'
  | 'Gifts & Misc'
  | 'Venmo/PayPal'
  | 'Transfer'
  | 'Income'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Housing',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Travel',
  'Subscriptions',
  'Gifts & Misc',
  'Venmo/PayPal',
  'Transfer',
  'Income',
  'Other',
];

export const SPEND_CATEGORIES: Category[] = CATEGORIES.filter(
  (c) => c !== 'Income' && c !== 'Transfer',
);

export type Transaction = {
  transaction_id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: Category;
  category_override: Category | '';
  is_subscription: boolean;
  statement_id: string;
  account_name: string;
};

export type Account = {
  account_id: string;
  name: string;
  mask: string;
  type: 'depository' | 'credit';
  subtype: string;
  balance: number;
  institution: string;
};

export type Statement = {
  id: string;
  filename: string;
  uploaded_at: string;
  institution: string;
  account_name: string;
  account_mask: string;
  account_type: 'depository' | 'credit';
  period_from: string;
  period_to: string;
  ending_balance: number;
  transaction_count: number;
};

export type Investment = {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  cost_basis: number;
  asset_type: 'stock' | 'crypto';
  account: string;
  added_date: string;
};

export type EnrichedInvestment = Investment & {
  current_price: number;
  market_value: number;
  day_change_pct: number;
  total_gain: number;
  total_gain_pct: number;
  spark: number[];
};

export type Budget = {
  category: Category;
  monthly_limit: number;
};

export type Subscription = {
  merchant: string;
  amount: number;
  cycle: 'Monthly' | 'Yearly';
  next_charge: string;
  last_charge: string;
  charge_count: number;
  status: 'Active' | 'Idle';
  user_status: 'detected' | 'confirmed' | 'dismissed' | 'cancelled';
  category: string;
  yearly_cost: number;
};

export type MonthlyTrendBar = {
  month: string;
  total: number;
  by_category: Record<string, number>;
};

export type OverviewData = {
  net_worth: number;
  spent_this_month: number;
  spent_last_month: number;
  investable: number;
  investable_day_change_pct: number;
  net_worth_history: number[];
  spend_breakdown: Array<{ label: string; value: number; color: string }>;
  recent_transactions: Transaction[];
  upcoming_bills: Array<{ name: string; amount: number; due: string; days_left: number }>;
  selected_month: string;
  available_months: string[];
  monthly_trend: MonthlyTrendBar[];
};
