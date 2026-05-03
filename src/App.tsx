import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { api } from './api';
import type { Account } from '../shared/types';
import { Overview } from './pages/Overview';
import { Investments } from './pages/Investments';
import { Spending } from './pages/Spending';
import { Subscriptions } from './pages/Subscriptions';
import { Budgets } from './pages/Budgets';

export type AppContextValue = {
  accounts: Account[];
  refreshAccounts: () => Promise<void>;
  syncing: boolean;
  triggerSync: () => Promise<void>;
};

export const App = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refreshAccounts = async (): Promise<void> => {
    try {
      const data = await api.accounts();
      setAccounts(data);
    } catch {
      setAccounts([]);
    }
  };

  const triggerSync = async (): Promise<void> => {
    setSyncing(true);
    try {
      await refreshAccounts();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void refreshAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: AppContextValue = { accounts, refreshAccounts, syncing, triggerSync };

  return (
    <Routes>
      <Route path="/" element={<Overview ctx={ctx} />} />
      <Route path="/investments" element={<Investments />} />
      <Route path="/spending" element={<Spending ctx={ctx} />} />
      <Route path="/subscriptions" element={<Subscriptions ctx={ctx} />} />
      <Route path="/budgets" element={<Budgets ctx={ctx} />} />
    </Routes>
  );
};
