'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RecentDepositsTable, { Deposit } from '@/components/Wallet/RecentDepositsTable';
import AttentionPanel from '@/components/Wallet/AttentionPanel';
import SweepsPanel from '@/components/Wallet/SweepsPanel';
import styles from './transactions/dashboard.module.css';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import MetricsGrid, { DashboardMetrics } from '@/components/Dashboard/Metrics';
import TableSkeleton from '@/components/Shared/TableSkeleton';

const METRICS_REFRESH_MS = 30_000;

export default function WalletDashboard() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Metrics (treasury balance, pending counts) only; polled while the page is open.
  const fetchMetrics = useCallback(async () => {
    try {
      setMetrics(await adminService.getDashboardMetrics());
    } catch {
      // Keep the last good numbers; the next tick will try again.
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const id = setInterval(fetchMetrics, METRICS_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Treasury, deposits and anything that needs your attention. Balances refresh every 30 seconds.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <MetricsGrid data={metrics} />
        <AttentionPanel onChanged={fetchData} />
        {loading ? <TableSkeleton columns={7} /> : <RecentDepositsTable data={deposits} />}
        <SweepsPanel />
      </section>
    </main>
  );
}
