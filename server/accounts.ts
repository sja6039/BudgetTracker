import { listStatements } from './statements.js';
import type { Account } from '../shared/types.js';

export const listAccounts = (): Account[] => {
  const statements = listStatements();
  const latest = new Map<string, ReturnType<typeof listStatements>[number]>();
  for (const s of statements) {
    const key = `${s.account_name}|${s.account_mask}`;
    const prev = latest.get(key);
    if (!prev || s.period_to.localeCompare(prev.period_to) > 0) latest.set(key, s);
  }

  return Array.from(latest.values()).map((s) => {
    const balance = s.account_type === 'credit' ? -s.ending_balance : s.ending_balance;
    const accountId = `${s.account_name}|${s.account_mask}`.replace(/\s+/g, '_');
    return {
      account_id: accountId,
      name: s.account_name,
      mask: s.account_mask,
      type: s.account_type,
      subtype: s.account_type === 'credit' ? 'credit card' : 'checking',
      balance,
      institution: s.institution,
    };
  });
};
