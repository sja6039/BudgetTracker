import { paths, SUBSCRIPTION_COLUMNS } from './paths.js';
import { readCsv, writeCsv } from './csv.js';
import { loadTransactions } from './statements.js';
import type { Subscription } from '../shared/types.js';

const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const normalize = (merchant: string): string =>
  merchant.toUpperCase().replace(/[^A-Z0-9]/g, '');

const NEVER_SUBSCRIPTION = [
  /lineleap/i,
  /\bvenmo\b/i,
  /\bpaypal\b/i,
  /\bpypl\b/i,
  /\bsquare\b/i,
  /\bzelle\b/i,
  /\bcash\s*app\b/i,
];

const isNeverSubscription = (merchant: string, description: string): boolean =>
  NEVER_SUBSCRIPTION.some((re) => re.test(merchant) || re.test(description));

const inferCategory = (merchant: string): string => {
  const m = merchant.toUpperCase();
  if (/NETFLIX|HULU|DISNEY|HBO|PARAMOUNT|YOUTUBE PREMIUM/.test(m)) return 'Streaming';
  if (/SPOTIFY|APPLE MUSIC|TIDAL/.test(m)) return 'Music';
  if (/ICLOUD|DROPBOX|GOOGLE ONE/.test(m)) return 'Storage';
  if (/NYTIMES|WSJ|WASHINGTON POST/.test(m)) return 'News';
  if (/GITHUB|NOTION|ADOBE|FIGMA|SLACK/.test(m)) return 'Software';
  if (/AUDIBLE|KINDLE/.test(m)) return 'Books';
  if (/PELOTON|EQUINOX|CLASSPASS/.test(m)) return 'Fitness';
  if (/AMAZON PRIME|COSTCO|SAMS CLUB/.test(m)) return 'Membership';
  return 'Other';
};

export const detectSubscriptions = (): Subscription[] => {
  const txs = loadTransactions();
  if (txs.length === 0) return [];

  const groups = new Map<string, typeof txs>();
  for (const t of txs) {
    if (!t.is_subscription) continue;
    if (t.amount >= 0) continue;
    if (isNeverSubscription(t.merchant, t.description)) continue;
    const key = normalize(t.merchant);
    if (!key) continue;
    const arr = groups.get(key) ?? [];
    arr.push(t);
    groups.set(key, arr);
  }

  const overrides = readCsv<Record<string, string>>(paths.subscriptions);
  const overrideMap = new Map<string, string>();
  for (const o of overrides) overrideMap.set(o.merchant, o.user_status);

  const subs: Subscription[] = [];
  const now = Date.now();

  for (const [key, items] of groups) {
    items.sort((a, b) => a.date.localeCompare(b.date));

    const amounts = items.map((i) => -i.amount);
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;

    let cycle: 'Monthly' | 'Yearly' = 'Monthly';
    let avgGap = 30;
    if (items.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < items.length; i++) {
        const g = (new Date(items[i].date).getTime() - new Date(items[i - 1].date).getTime()) / DAY;
        gaps.push(g);
      }
      avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      if (avgGap >= 350 && avgGap <= 380) cycle = 'Yearly';
    }

    const lastChargeMs = new Date(items[items.length - 1].date).getTime();
    const isIdle = now - lastChargeMs > SIXTY_DAYS;
    const nextChargeMs = lastChargeMs + (cycle === 'Yearly' ? 365 : 30) * DAY;

    const userStatus = (overrideMap.get(key) ?? 'detected') as Subscription['user_status'];
    if (userStatus === 'dismissed' || userStatus === 'cancelled') continue;

    const merchant = items[0].merchant;
    const yearly_cost = cycle === 'Monthly' ? avgAmount * 12 : avgAmount;

    subs.push({
      merchant,
      amount: Number(avgAmount.toFixed(2)),
      cycle,
      next_charge: new Date(nextChargeMs).toISOString().slice(0, 10),
      last_charge: items[items.length - 1].date,
      charge_count: items.length,
      status: isIdle ? 'Idle' : 'Active',
      user_status: userStatus,
      category: inferCategory(merchant),
      yearly_cost: Number(yearly_cost.toFixed(2)),
    });
  }

  return subs.sort((a, b) => b.yearly_cost - a.yearly_cost);
};

export const setSubscriptionStatus = (merchant: string, user_status: Subscription['user_status']): void => {
  const key = normalize(merchant);
  const rows = readCsv<Record<string, string>>(paths.subscriptions);
  const existing = rows.findIndex((r) => r.merchant === key);
  if (existing >= 0) rows[existing].user_status = user_status;
  else rows.push({ merchant: key, user_status });
  writeCsv(paths.subscriptions, rows, SUBSCRIPTION_COLUMNS);
};
