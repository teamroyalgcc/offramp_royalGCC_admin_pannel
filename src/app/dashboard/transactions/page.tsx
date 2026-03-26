'use client';

import { useState, useEffect } from 'react';
import MetricsGrid from '@/components/Dashboard/Metrics';
import DataTable from '@/components/Shared/DataTable';
import TransactionModal from '@/components/Transactions/TransactionModal';
import { Transaction, TransactionStatus } from '@/types';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import styles from './dashboard.module.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, metricsData] = await Promise.all([
          adminService.listOrders(),
          adminService.getDashboardMetrics()
        ]);
        
        const mappedData = ordersData.map((d: any) => ({
          ...d,
          id: d.id,
          type: 'exchange',
          amount: parseFloat(d.usdt_amount),
          inr_amount: parseFloat(d.inr_amount),
          rate: parseFloat(d.rate),
          status: d.status,
          createdAt: d.created_at || new Date().toISOString(),
        }));
        
        setTransactions(mappedData);
        setMetrics(metricsData);
      } catch (error: any) {
        toast.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // SSE for Real-time orders
    const token = localStorage.getItem('admin_token');
    if (token) {
      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/stream/orders?token=${token}`);
      
      eventSource.addEventListener('orders', (event) => {
        const newData = JSON.parse(event.data);
        const mappedNewData = newData.map((d: any) => ({
          ...d,
          id: d.id,
          type: 'exchange',
          amount: parseFloat(d.usdt_amount),
          inr_amount: parseFloat(d.inr_amount),
          rate: parseFloat(d.rate),
          status: d.status,
          createdAt: d.created_at || new Date().toISOString(),
        }));
        setTransactions(mappedNewData);
      });

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, []);



  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: TransactionStatus, note: string = '') => {
    try {
      await adminService.updateOrderStatus(id, { status, note });
      toast.success(`Transaction ${id} updated to ${status}`);
      
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, status } : t
      ));
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update transaction status');
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
        <MetricsGrid data={metrics} />
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
