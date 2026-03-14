'use client';

import { useState, useEffect } from 'react';
import MetricsGrid from '@/components/Dashboard/Metrics';
import DataTable from '@/components/Shared/DataTable';
import TransactionModal from '@/components/Transactions/TransactionModal';
import { Transaction, TransactionStatus } from '@/types';
import api from '@/lib/axios';
import styles from './dashboard.module.css';

// Mock data generator
const generateMockTransactions = (count: number): Transaction[] => {
  const types: any[] = ['withdraw', 'transfer', 'deposit'];
  const statuses: any[] = ['success', 'pending', 'failed'];
  const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Michael Brown', 'Emily Davis'];

  return Array.from({ length: count }, (_, i) => ({
    id: `TX${1000 + i}`,
    userId: `USR${500 + i}`,
    userName: names[i % names.length],
    amount: Math.floor(Math.random() * 10000) + 100,
    currency: 'USD',
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
    bankDetails: {
      bankName: 'Global Bank',
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      accountHolder: names[i % names.length],
      ifscCode: 'GLOB0001234',
    }
  }));
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch transactions
    const fetchData = async () => {
      try {
        // In reality: const response = await api.get('/transactions');
        const mockData = generateMockTransactions(20);
        setTransactions(mockData);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: TransactionStatus, proof?: File) => {
    try {
      console.log(`Updating transaction ${id} to ${status}`, proof);
      // In reality: await api.patch(`/transactions/${id}`, { status, proof });
      
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, status } : t
      ));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions Management</h1>
          <p className={styles.subtitle}>Manage and monitor all financial activities</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            Refresh Data
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <MetricsGrid />
        <DataTable 
          data={transactions} 
          onRowClick={handleRowClick} 
        />
      </section>

      <TransactionModal 
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </main>
  );
}
