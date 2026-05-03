import { randomUUID } from 'node:crypto';
import { paths, INVESTMENT_COLUMNS } from './paths.js';
import { readCsv, writeCsv } from './csv.js';
import { getQuote } from './prices.js';
import type { EnrichedInvestment, Investment } from '../shared/types.js';

const readInvestments = (): Investment[] => {
  const rows = readCsv<Record<string, string>>(paths.investments);
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    name: r.name,
    shares: Number(r.shares),
    cost_basis: Number(r.cost_basis),
    asset_type: (r.asset_type === 'crypto' ? 'crypto' : 'stock') as 'stock' | 'crypto',
    account: r.account,
    added_date: r.added_date,
  }));
};

const writeInvestments = (rows: Investment[]): void => {
  writeCsv(
    paths.investments,
    rows.map((r) => ({
      ...r,
      shares: String(r.shares),
      cost_basis: String(r.cost_basis),
    })),
    INVESTMENT_COLUMNS,
  );
};

export const listEnriched = async (): Promise<EnrichedInvestment[]> => {
  const items = readInvestments();
  const enriched = await Promise.all(
    items.map(async (i): Promise<EnrichedInvestment> => {
      try {
        const q = await getQuote(i.symbol, i.asset_type);
        const market_value = q.price * i.shares;
        const total_gain = market_value - i.cost_basis;
        const total_gain_pct = i.cost_basis > 0 ? (total_gain / i.cost_basis) * 100 : 0;
        return {
          ...i,
          current_price: q.price,
          market_value,
          day_change_pct: q.day_change_pct,
          total_gain,
          total_gain_pct,
          spark: q.history,
        };
      } catch (e) {
        console.error(`price lookup failed for ${i.symbol}`, e);
        return {
          ...i,
          current_price: 0,
          market_value: 0,
          day_change_pct: 0,
          total_gain: -i.cost_basis,
          total_gain_pct: -100,
          spark: [],
        };
      }
    }),
  );
  return enriched.sort((a, b) => b.market_value - a.market_value);
};

export const addInvestment = (input: Omit<Investment, 'id' | 'added_date'>): Investment => {
  const items = readInvestments();
  const inv: Investment = {
    id: randomUUID(),
    added_date: new Date().toISOString().slice(0, 10),
    ...input,
  };
  items.push(inv);
  writeInvestments(items);
  return inv;
};

export const deleteInvestment = (id: string): void => {
  const items = readInvestments().filter((i) => i.id !== id);
  writeInvestments(items);
};
