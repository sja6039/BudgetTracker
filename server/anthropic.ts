import Anthropic from '@anthropic-ai/sdk';
import { CATEGORIES } from '../shared/types.js';
import type { Category } from '../shared/types.js';

export type ExtractedTransaction = {
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: Category;
  is_subscription: boolean;
};

export type ExtractedStatement = {
  institution: string;
  account: {
    name: string;
    mask: string;
    type: 'depository' | 'credit';
    ending_balance: number;
  };
  period: { from: string; to: string };
  transactions: ExtractedTransaction[];
};

const SYSTEM_PROMPT = `You extract transactions from a bank or credit-card statement PDF and assign each one to a budget category.

Output rules:
- Dates in YYYY-MM-DD.
- amount: negative for spending/charges, positive for income/payments/refunds. For credit-card statements, purchases are negative and payments to the card are positive.
- merchant: cleaned-up vendor name (e.g. "Netflix" not "NETFLIX.COM 866-579-7172 CA").
- description: original line text from the statement.
- category: one of ${CATEGORIES.map((c) => `"${c}"`).join(', ')}. Pick the single best match.
- "Venmo/PayPal" applies to ANY Venmo or PayPal transaction (incoming or outgoing), regardless of what the underlying purchase looks like.
- "Transfer" applies to inter-account transfers (online transfers, "from Share", "to Share", checking↔savings, ACH transfers between the user's own accounts). Include them in output but do not categorize as Income or as a spend bucket — they're not real income or spending.
- is_subscription: true only for recurring charges that look like subscriptions (streaming, software, gym, news, cloud storage, memberships, monthly box services). One-off purchases are false even if from a digital vendor. Payment apps and rails (Venmo, PayPal, Cash App, Zelle, Square, ticket platforms, bar/event apps like LineLeap, DoorDash) are NOT subscriptions even when they appear multiple times — those are individual purchases routed through the same merchant.
- Skip the statement's own balance/fee summary lines unless they are real fees.
- account.type: "credit" if it's a credit-card statement, "depository" for checking/savings.
- account.mask: last 4 digits of the account number, or empty string if not visible.
- ending_balance: the statement's closing/ending balance for depository accounts; for credit cards, the new balance owed (positive number).
- period.from / period.to: statement period covered.`;

const STATEMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    institution: { type: 'string' },
    account: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string' },
        mask: { type: 'string' },
        type: { type: 'string', enum: ['depository', 'credit'] },
        ending_balance: { type: 'number' },
      },
      required: ['name', 'mask', 'type', 'ending_balance'],
    },
    period: {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
      },
      required: ['from', 'to'],
    },
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string' },
          merchant: { type: 'string' },
          description: { type: 'string' },
          amount: { type: 'number' },
          category: { type: 'string', enum: CATEGORIES },
          is_subscription: { type: 'boolean' },
        },
        required: ['date', 'merchant', 'description', 'amount', 'category', 'is_subscription'],
      },
    },
  },
  required: ['institution', 'account', 'period', 'transactions'],
} as const;

let _client: Anthropic | null = null;
const client = (): Anthropic => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env to enable statement imports.');
  }
  if (_client === null) _client = new Anthropic();
  return _client;
};

export const isConfigured = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

export const extractStatement = async (pdfBuffer: Buffer, filename: string): Promise<ExtractedStatement> => {
  const response = await client().messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: 'json_schema', schema: STATEMENT_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBuffer.toString('base64'),
            },
          },
          {
            type: 'text',
            text: `Extract every transaction from this statement (filename: ${filename}). Categorize each one and flag subscriptions.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('Claude returned no text content');
  const parsed = JSON.parse(textBlock.text) as ExtractedStatement;
  if (!Array.isArray(parsed.transactions)) {
    throw new Error('Claude response missing transactions array');
  }
  return parsed;
};
