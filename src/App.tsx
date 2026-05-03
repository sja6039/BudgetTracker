import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { Investments } from './pages/Investments';
import { Spending } from './pages/Spending';
import { Subscriptions } from './pages/Subscriptions';
import { Budgets } from './pages/Budgets';

export type AppContextValue = {
  syncing: boolean;
  triggerSync: () => void;
};

export const App = () => {
  const [syncing, setSyncing] = useState(false);

  const triggerSync = (): void => setSyncing((s) => !s);

  const ctx: AppContextValue = { syncing, triggerSync };

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
