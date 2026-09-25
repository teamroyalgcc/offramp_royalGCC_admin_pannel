'use client';

import { useCallback, useEffect, useState } from 'react';
import RecentDepositsTable, { Deposit } from '@/components/Wallet/RecentDepositsTable';
import AttentionPanel from '@/components/Wallet/AttentionPanel';
import styles from './transactions/dashboard.module.css';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import MetricsGrid from '@/components/Dashboard/Metrics';
import TableSkeleton from '@/components/Shared/TableSkeleton';

export default function WalletDashboard() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [depositsData, metricsData] = await Promise.all([
        adminService.listDeposits(),
        adminService.getDashboardMetrics(),
      ]);
      setDeposits(depositsData);
      setMetrics(metricsData);
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Treasury, deposits and anything that needs your attention</p>
        </div>
      </header>

      <section className={styles.content}>
        <MetricsGrid data={metrics} />
        <AttentionPanel onChanged={fetchData} />
        {loading ? <TableSkeleton columns={7} /> : <RecentDepositsTable data={deposits} />}
      </section>
    </main>
  );
}
