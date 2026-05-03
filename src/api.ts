import type {
  Budget,
  EnrichedInvestment,
  Investment,
  OverviewData,
  Statement,
  Subscription,
  Transaction,
} from '../shared/types';

const json = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json() as Promise<T>;
};

const upload = async <T,>(url: string, body: FormData): Promise<T> => {
  const res = await fetch(url, { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json() as Promise<T>;
};

export type IngestResult = { statement: Statement; added: number; skipped: number };

export const api = {
  overview: (month?: string) => {
    const qs = month ? `?month=${encodeURIComponent(month)}` : '';
    return json<OverviewData>(`/api/overview${qs}`);
  },
  months: () => json<string[]>('/api/months'),
  transactions: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const qs = q.toString();
    return json<Transaction[]>(`/api/transactions${qs ? '?' + qs : ''}`);
  },
  updateTransactionCategory: (id: string, category: string) =>
    json<{ ok: true }>(`/api/transactions/${encodeURIComponent(id)}/category`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),
  investments: () => json<EnrichedInvestment[]>('/api/investments'),
  addInvestment: (inv: Omit<Investment, 'id' | 'added_date'>) =>
    json<Investment>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(inv),
    }),
  deleteInvestment: (id: string) =>
    json<{ ok: true }>(`/api/investments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  budgets: () => json<Budget[]>('/api/budgets'),
  upsertBudget: (b: Budget) =>
    json<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(b),
    }),
  deleteBudget: (category: string) =>
    json<{ ok: true }>(`/api/budgets/${encodeURIComponent(category)}`, { method: 'DELETE' }),
  subscriptions: () => json<Subscription[]>('/api/subscriptions'),
  updateSubscription: (merchant: string, user_status: Subscription['user_status']) =>
    json<{ ok: true }>(`/api/subscriptions/${encodeURIComponent(merchant)}`, {
      method: 'POST',
      body: JSON.stringify({ user_status }),
    }),
  statements: () => json<Statement[]>('/api/statements'),
  uploadStatement: (file: File): Promise<IngestResult> => {
    const fd = new FormData();
    fd.append('file', file);
    return upload<IngestResult>('/api/statements', fd);
  },
  uploadStatementWithProgress: (
    file: File,
    onProgress: (uploadPct: number, phase: 'uploading' | 'extracting') => void,
  ): Promise<IngestResult> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/statements');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100), 'uploading');
      };
      xhr.upload.onload = () => onProgress(100, 'extracting');
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText) as IngestResult); }
          catch { reject(new Error('Invalid response')); }
        } else {
          reject(new Error(`${xhr.status} ${xhr.statusText}: ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      const fd = new FormData();
      fd.append('file', file);
      xhr.send(fd);
    });
  },
  deleteStatement: (id: string) =>
    json<{ ok: true }>(`/api/statements/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
