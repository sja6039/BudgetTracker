import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  paths,
  TRANSACTION_COLUMNS,
  INVESTMENT_COLUMNS,
  BUDGET_COLUMNS,
  SUBSCRIPTION_COLUMNS,
  STATEMENT_COLUMNS,
} from './paths.js';
import { ensureFile } from './csv.js';
import {
  ingestStatement,
  listStatements,
  deleteStatement,
  loadTransactions,
  overrideCategory,
  listAvailableMonths,
} from './statements.js';
import { isConfigured as anthropicConfigured } from './anthropic.js';
import { addInvestment, deleteInvestment, listEnriched } from './investments.js';
import { listBudgets, upsertBudget, deleteBudget } from './budgets.js';
import { detectSubscriptions, setSubscriptionStatus } from './subscriptions.js';
import { buildOverview } from './overview.js';

ensureFile(paths.transactions, TRANSACTION_COLUMNS.join(','));
ensureFile(paths.investments, INVESTMENT_COLUMNS.join(','));
ensureFile(paths.budgets, BUDGET_COLUMNS.join(','));
ensureFile(paths.subscriptions, SUBSCRIPTION_COLUMNS.join(','));
ensureFile(paths.statements, STATEMENT_COLUMNS.join(','));

const app = new Hono();
app.use('*', cors({ origin: 'http://localhost:3000' }));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

app.get('/api/health', (c) => c.json({ ok: true, anthropic: anthropicConfigured() }));

// ─── Statements ──────────────────────────────────────────────────────────────
app.get('/api/statements', (c) => c.json(listStatements()));

app.post('/api/statements', async (c) => {
  if (!anthropicConfigured()) {
    return c.json({ error: 'ANTHROPIC_API_KEY is not set on the server.' }, 400);
  }
  const form = await c.req.parseBody();
  const file = form['file'];
  if (!(file instanceof File)) return c.json({ error: 'No file uploaded under field "file".' }, 400);
  if (file.type && file.type !== 'application/pdf') {
    return c.json({ error: `Expected application/pdf, got ${file.type}` }, 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await ingestStatement(file.name, buffer);
  return c.json(result);
});

app.delete('/api/statements/:id', (c) => {
  deleteStatement(c.req.param('id'));
  return c.json({ ok: true });
});

// ─── Transactions / Accounts ─────────────────────────────────────────────────
app.get('/api/transactions', (c) => {
  const from = c.req.query('from');
  const to = c.req.query('to');
  return c.json(loadTransactions(from, to));
});

app.post('/api/transactions/:id/category', async (c) => {
  const id = c.req.param('id');
  const { category } = await c.req.json();
  overrideCategory(id, category);
  return c.json({ ok: true });
});

// ─── Investments ─────────────────────────────────────────────────────────────
app.get('/api/investments', async (c) => c.json(await listEnriched()));

app.post('/api/investments', async (c) => {
  const body = await c.req.json();
  const inv = addInvestment({
    symbol: String(body.symbol).toUpperCase(),
    name: body.name ?? body.symbol,
    shares: Number(body.shares),
    cost_basis: Number(body.cost_basis),
    asset_type: body.asset_type === 'crypto' ? 'crypto' : 'stock',
    account: body.account ?? 'Brokerage',
  });
  return c.json(inv);
});

app.delete('/api/investments/:id', (c) => {
  deleteInvestment(c.req.param('id'));
  return c.json({ ok: true });
});

// ─── Budgets ─────────────────────────────────────────────────────────────────
app.get('/api/budgets', (c) => c.json(listBudgets()));

app.post('/api/budgets', async (c) => {
  const body = await c.req.json();
  upsertBudget({ category: body.category, monthly_limit: Number(body.monthly_limit) });
  return c.json({ category: body.category, monthly_limit: Number(body.monthly_limit) });
});

app.delete('/api/budgets/:category', (c) => {
  deleteBudget(decodeURIComponent(c.req.param('category')));
  return c.json({ ok: true });
});

// ─── Subscriptions ───────────────────────────────────────────────────────────
app.get('/api/subscriptions', (c) => c.json(detectSubscriptions()));

app.post('/api/subscriptions/:merchant', async (c) => {
  const merchant = decodeURIComponent(c.req.param('merchant'));
  const { user_status } = await c.req.json();
  setSubscriptionStatus(merchant, user_status);
  return c.json({ ok: true });
});

// ─── Overview aggregator ─────────────────────────────────────────────────────
app.get('/api/overview', async (c) => c.json(await buildOverview(c.req.query('month'))));

app.get('/api/months', (c) => c.json(listAvailableMonths()));

const port = Number(process.env.API_PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => {
  console.log(`api: http://localhost:${port}`);
  if (!anthropicConfigured()) {
    console.log('  ⚠ ANTHROPIC_API_KEY not set — statement uploads will be rejected. Add it to .env.');
  }
});
