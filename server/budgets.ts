import { paths, BUDGET_COLUMNS } from './paths.js';
import { readCsv, writeCsv } from './csv.js';
import type { Budget, Category } from '../shared/types.js';

export const listBudgets = (): Budget[] => {
  const rows = readCsv<Record<string, string>>(paths.budgets);
  return rows.map((r) => ({
    category: r.category as Category,
    monthly_limit: Number(r.monthly_limit),
  }));
};

export const upsertBudget = (b: Budget): void => {
  const rows = readCsv<Record<string, string>>(paths.budgets);
  const idx = rows.findIndex((r) => r.category === b.category);
  const row = { category: b.category, monthly_limit: String(b.monthly_limit) };
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  writeCsv(paths.budgets, rows, BUDGET_COLUMNS);
};

export const deleteBudget = (category: string): void => {
  const rows = readCsv<Record<string, string>>(paths.budgets).filter((r) => r.category !== category);
  writeCsv(paths.budgets, rows, BUDGET_COLUMNS);
};
