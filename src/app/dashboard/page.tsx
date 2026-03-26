'use client';

import { useState, useEffect } from 'react';
import WalletConfig from '@/components/Wallet/WalletConfig';
import RecentDepositsTable from '@/components/Wallet/RecentDepositsTable';

import { Transaction } from '@/types';
import styles from './transactions/dashboard.module.css';

import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import MetricsGrid from '@/components/Dashboard/Metrics';

export default function WalletDashboard() {
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depositsData, metricsData] = await Promise.all([
          adminService.listDeposits(),
          adminService.getDashboardMetrics()
        ]);
        
        const mappedDeposits = depositsData.map((d: any) => ({
          ...d,
          id: d.id,
          type: 'deposit',
          amount: parseFloat(d.amount),
          currency: d.token_symbol || 'USDT',
          status: d.status,
          createdAt: d.created_at || d.processed_at || new Date().toISOString(),
        }));
        
        setDeposits(mappedDeposits);
        setMetrics(metricsData);
      } catch (error: any) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Aggregated metrics and recent deposit activities</p>
        </div>
      </header>

      <section className={styles.content}>
        <MetricsGrid data={metrics} />
        <RecentDepositsTable data={deposits} />
      </section>
    </main>
  );
}
