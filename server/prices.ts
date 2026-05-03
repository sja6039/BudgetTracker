import YahooFinance from 'yahoo-finance2';
import { paths } from './paths.js';
import { readJson, writeJson } from './csv.js';

const yahooFinance = new YahooFinance();

type CacheEntry = {
  price: number;
  history: number[];
  day_change_pct: number;
  fetched_at: number;
};

type Cache = Record<string, CacheEntry>;

const TTL_MS = 15 * 60 * 1000;

const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  LTC: 'litecoin',
  AVAX: 'avalanche-2',
  BCH: 'bitcoin-cash',
  UNI: 'uniswap',
  ATOM: 'cosmos',
};

const loadCache = (): Cache => readJson<Cache>(paths.priceCache, {});
const saveCache = (c: Cache): void => writeJson(paths.priceCache, c);

const cacheKey = (symbol: string, type: 'stock' | 'crypto'): string => `${type}:${symbol.toUpperCase()}`;

export const fetchStock = async (symbol: string): Promise<CacheEntry> => {
  const sym = symbol.toUpperCase();
  const quote = await yahooFinance.quote(sym);
  const period2 = new Date();
  const period1 = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
  const chart = await yahooFinance.chart(sym, { period1, period2, interval: '1d' });
  const history = (chart.quotes ?? [])
    .map((q) => q.close)
    .filter((v): v is number => typeof v === 'number');
  const price = quote.regularMarketPrice ?? history.at(-1) ?? 0;
  const day_change_pct = quote.regularMarketChangePercent ?? 0;
  return { price, history, day_change_pct, fetched_at: Date.now() };
};

export const fetchCrypto = async (symbol: string): Promise<CacheEntry> => {
  const id = COIN_IDS[symbol.toUpperCase()];
  if (!id) throw new Error(`Unknown crypto symbol: ${symbol}. Add to COIN_IDS in server/prices.ts.`);
  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
  );
  if (!priceRes.ok) throw new Error(`CoinGecko ${priceRes.status}`);
  const priceData = await priceRes.json() as Record<string, { usd: number; usd_24h_change: number }>;
  const price = priceData[id]?.usd ?? 0;
  const day_change_pct = priceData[id]?.usd_24h_change ?? 0;

  const histRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`,
  );
  let history: number[] = [];
  if (histRes.ok) {
    const histData = await histRes.json() as { prices: Array<[number, number]> };
    history = histData.prices.map((p) => p[1]);
  }
  return { price, history, day_change_pct, fetched_at: Date.now() };
};

export const getQuote = async (
  symbol: string,
  type: 'stock' | 'crypto',
): Promise<CacheEntry> => {
  const cache = loadCache();
  const key = cacheKey(symbol, type);
  const cached = cache[key];
  if (cached && Date.now() - cached.fetched_at < TTL_MS) {
    return cached;
  }
  try {
    const fresh = type === 'crypto' ? await fetchCrypto(symbol) : await fetchStock(symbol);
    cache[key] = fresh;
    saveCache(cache);
    return fresh;
  } catch (e) {
    if (cached) return cached;
    throw e;
  }
};

export const validateSymbol = async (symbol: string, type: 'stock' | 'crypto'): Promise<boolean> => {
  try {
    const q = await (type === 'crypto' ? fetchCrypto(symbol) : fetchStock(symbol));
    return q.price > 0;
  } catch {
    return false;
  }
};
