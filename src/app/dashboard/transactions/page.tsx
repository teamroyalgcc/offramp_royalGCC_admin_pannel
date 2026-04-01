'use client';

import { useState, useEffect } from 'react';
import MetricsGrid from '@/components/Dashboard/Metrics';
import DataTable from '@/components/Shared/DataTable';
import TransactionModal from '@/components/Transactions/TransactionModal';
import { Transaction, TransactionStatus } from '@/types';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import styles from './dashboard.module.css';
import TableSkeleton from '@/components/Shared/TableSkeleton';

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
          userId: d.user_id || 'N/A',
          userName: d.bank_accounts?.account_holder_name || d.users?.email?.split('@')[0] || 'User',
          userEmail: d.users?.email,
          type: 'exchange',
          amount: parseFloat(d.usdt_amount),
          inr_amount: parseFloat(d.inr_amount),
          rate: parseFloat(d.rate),
          currency: 'USDT',
          status: (d.status || 'pending').toLowerCase() as TransactionStatus,
          createdAt: d.created_at || new Date().toISOString(),
          gatewayRefId: d.gateway_ref_id,
          failureReason: d.failure_reason,
          bankDetails: d.bank_accounts ? {
            bankName: 'N/A',
            accountNumber: d.bank_accounts.account_number,
            accountHolder: d.bank_accounts.account_holder_name,
            ifscCode: d.bank_accounts.ifsc_code
          } : undefined
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
  }, []);



  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: TransactionStatus, note: string = '') => {
    try {
      // API expects uppercase status: "PENDING" | "PROCESSING" | "APPROVED" | "SUCCESS" | "FAILED" | "REFUNDED"
      const apiStatus = status.toUpperCase();
      await adminService.updateOrderStatus(id, { status: apiStatus, note });
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
        {loading ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable 
            data={transactions} 
            onRowClick={handleRowClick} 
          />
        )}
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
