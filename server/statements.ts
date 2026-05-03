import { createHash } from 'node:crypto';
import { paths, STATEMENT_COLUMNS, TRANSACTION_COLUMNS } from './paths.js';
import { readCsv, writeCsv } from './csv.js';
import { extractStatement } from './anthropic.js';
import { applyCategoryRules } from './categorize.js';
import type { Statement, Transaction } from '../shared/types.js';

const sha256 = (buf: Buffer): string => createHash('sha256').update(buf).digest('hex');

const txnId = (statementId: string, index: number, date: string, amount: number): string =>
  createHash('sha256').update(`${statementId}:${index}:${date}:${amount}`).digest('hex').slice(0, 24);

export const listStatements = (): Statement[] => {
  const rows = readCsv<Record<string, string>>(paths.statements);
  return rows
    .map((r) => ({
      id: r.id,
      filename: r.filename,
      uploaded_at: r.uploaded_at,
      institution: r.institution,
      account_name: r.account_name,
      account_mask: r.account_mask,
      account_type: (r.account_type === 'credit' ? 'credit' : 'depository') as Statement['account_type'],
      period_from: r.period_from,
      period_to: r.period_to,
      ending_balance: Number(r.ending_balance),
      transaction_count: Number(r.transaction_count),
    }))
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
};

export const ingestStatement = async (
  filename: string,
  pdfBuffer: Buffer,
): Promise<{ statement: Statement; added: number; skipped: number }> => {
  const statementId = sha256(pdfBuffer).slice(0, 16);

  const existing = listStatements();
  const dup = existing.find((s) => s.id === statementId);
  if (dup) return { statement: dup, added: 0, skipped: dup.transaction_count };

  const extracted = await extractStatement(pdfBuffer, filename);

  const accountName = extracted.account.mask
    ? `${extracted.account.name} · ${extracted.account.mask}`
    : extracted.account.name;

  const txRows = extracted.transactions.map((t, i) => ({
    transaction_id: txnId(statementId, i, t.date, t.amount),
    date: t.date,
    merchant: t.merchant,
    description: t.description,
    amount: String(t.amount),
    category: t.category,
    category_override: '',
    is_subscription: String(t.is_subscription),
    statement_id: statementId,
    account_name: accountName,
  }));

  const allTx = readCsv<Record<string, string>>(paths.transactions);
  const seen = new Set(allTx.map((r) => r.transaction_id));
  for (const r of txRows) if (!seen.has(r.transaction_id)) allTx.push(r);
  allTx.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  writeCsv(paths.transactions, allTx, TRANSACTION_COLUMNS);

  const statement: Statement = {
    id: statementId,
    filename,
    uploaded_at: new Date().toISOString(),
    institution: extracted.institution,
    account_name: extracted.account.name,
    account_mask: extracted.account.mask,
    account_type: extracted.account.type,
    period_from: extracted.period.from,
    period_to: extracted.period.to,
    ending_balance: extracted.account.ending_balance,
    transaction_count: txRows.length,
  };

  const stRows = readCsv<Record<string, string>>(paths.statements);
  stRows.push({
    ...statement,
    ending_balance: String(statement.ending_balance),
    transaction_count: String(statement.transaction_count),
  } as unknown as Record<string, string>);
  writeCsv(paths.statements, stRows, STATEMENT_COLUMNS);

  return { statement, added: txRows.length, skipped: 0 };
};

export const deleteStatement = (statementId: string): void => {
  const stRows = readCsv<Record<string, string>>(paths.statements).filter((r) => r.id !== statementId);
  writeCsv(paths.statements, stRows, STATEMENT_COLUMNS);

  const txRows = readCsv<Record<string, string>>(paths.transactions).filter((r) => r.statement_id !== statementId);
  writeCsv(paths.transactions, txRows, TRANSACTION_COLUMNS);
};

export const listAvailableMonths = (): string[] => {
  const rows = readCsv<Record<string, string>>(paths.transactions);
  const months = new Set<string>();
  for (const r of rows) {
    if (r.date && r.date.length >= 7) months.add(r.date.slice(0, 7));
  }
  return Array.from(months).sort().reverse();
};

export const loadTransactions = (from?: string, to?: string): Transaction[] => {
  const rows = readCsv<Record<string, string>>(paths.transactions);
  return rows
    .filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    })
    .map((r) => ({
      transaction_id: r.transaction_id,
      date: r.date,
      merchant: r.merchant,
      description: r.description ?? '',
      amount: Number(r.amount),
      category: (r.category_override || r.category) as Transaction['category'],
      category_override: r.category_override as Transaction['category_override'],
      is_subscription: r.is_subscription === 'true',
      statement_id: r.statement_id,
      account_name: r.account_name,
    }))
    .map(applyCategoryRules)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const overrideCategory = (transaction_id: string, category: string): void => {
  const rows = readCsv<Record<string, string>>(paths.transactions);
  const idx = rows.findIndex((r) => r.transaction_id === transaction_id);
  if (idx === -1) throw new Error('Transaction not found');
  rows[idx].category_override = category;
  writeCsv(paths.transactions, rows, TRANSACTION_COLUMNS);
};
