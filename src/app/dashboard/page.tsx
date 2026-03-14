'use client';

import { useState, useEffect } from 'react';
import WalletConfig from '@/components/Wallet/WalletConfig';
import RecentDepositsTable from '@/components/Wallet/RecentDepositsTable';
import { Transaction } from '@/types';
import styles from './transactions/dashboard.module.css';

// Mock data generator for Wallet Deposits
const generateMockDeposits = (count: number): Transaction[] => {
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Michael Brown', 'Emily Davis'];

  return Array.from({ length: count }, (_, i) => ({
    id: `DP${3000 + i}`,
    userId: `USR${500 + i}`,
    userName: names[i % names.length],
    amount: Math.floor(Math.random() * 50000) + 500,
    currency: 'USD',
    type: 'deposit',
    status: 'success',
    createdAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
    bankDetails: {
      bankName: 'Global Bank',
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      accountHolder: names[i % names.length],
      ifscCode: 'GLOB0001234',
    }
  }));
};

export default function WalletDashboard() {
  const [deposits, setDeposits] = useState<Transaction[]>([]);

  useEffect(() => {
    // Simulate API call to fetch recent deposits
    const fetchData = async () => {
      const mockData = generateMockDeposits(12);
      setDeposits(mockData);
    };
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Wallet Management</h1>
          <p className={styles.subtitle}>Configure your receiving wallet and monitor recent deposits</p>
        </div>
      </header>

      <section className={styles.content}>
        <WalletConfig />
        <RecentDepositsTable data={deposits} />
      </section>
    </main>
  );
}
