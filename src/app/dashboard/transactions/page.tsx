'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import DataTable from '@/components/Shared/DataTable';
import TransactionModal from '@/components/Transactions/TransactionModal';
import { Transaction, TransactionStatus } from '@/types';
import { adminService } from '@/services/adminService';
import { apiErrorMessage } from '@/lib/axios';
import { toast } from 'sonner';
import styles from './dashboard.module.css';
import TableSkeleton from '@/components/Shared/TableSkeleton';

/** Row shape of GET /api/admin/orders. */
interface OrderRow {
  id: string;
  order_no?: number | string | null;
  user_id?: string;
  usdt_amount?: string | number;
  inr_amount?: string | number;
  rate?: string | number;
  status?: string;
  created_at?: string;
  completed_at?: string | null;
  payout_reference?: string | null;
  failure_reason?: string | null;
  bank_accounts?: {
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
  } | null;
  users?: { email?: string; account_holder_name?: string } | null;
}

const IST_FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

/** dd/mm/yyyy HH:mm in Indian time; empty when there is no date. */
function formatIST(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // en-GB gives "dd/mm/yyyy, HH:mm"
  return IST_FORMAT.format(d).replace(',', '');
}

/** The calendar day (yyyy-mm-dd) of a date in Indian time, to compare with the date inputs. */
function istDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return parts; // en-CA is yyyy-mm-dd
}

function mapOrder(d: OrderRow): Transaction {
  return {
    id: d.id,
    orderNo: d.order_no != null ? String(d.order_no) : '',
    userId: d.user_id || 'N/A',
    userName: d.bank_accounts?.account_holder_name || d.users?.account_holder_name || d.users?.email?.split('@')[0] || 'User',
    userEmail: d.users?.email,
    type: 'exchange',
    amount: parseFloat(String(d.usdt_amount ?? 0)),
    inr_amount: parseFloat(String(d.inr_amount ?? 0)),
    rate: parseFloat(String(d.rate ?? 0)),
    currency: 'USDT',
    status: (d.status || 'pending').toLowerCase() as TransactionStatus,
    createdAt: d.created_at || new Date().toISOString(),
    completedAt: d.completed_at ?? null,
    gatewayRefId: d.payout_reference,
    failureReason: d.failure_reason,
    bankDetails: d.bank_accounts ? {
      bankName: d.bank_accounts.bank_name || '',
      accountNumber: d.bank_accounts.account_number || '',
      accountHolder: d.bank_accounts.account_holder_name || '',
      ifscCode: d.bank_accounts.ifsc_code || '',
      kycName: d.users?.account_holder_name,
    } : undefined,
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ordersData: OrderRow[] = await adminService.listOrders();
      setTransactions(ordersData.map(mapOrder));
    } catch {
      toast.error('Failed to fetch exchange orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date range (inclusive, Indian calendar days) applied before search and export.
  const filteredTransactions = useMemo(() => {
    if (!fromDate && !toDate) return transactions;
    return transactions.filter(t => {
      const day = istDay(t.createdAt);
      if (!day) return false;
      if (fromDate && day < fromDate) return false;
      if (toDate && day > toDate) return false;
      return true;
    });
  }, [transactions, fromDate, toDate]);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: TransactionStatus, note: string = '') => {
    try {
      await adminService.updateOrderStatus(id, { status: status.toUpperCase(), note });
      toast.success(status === 'success' ? 'Order marked as paid' : 'Order refunded to the user');
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, status, gatewayRefId: status === 'success' ? note : t.gatewayRefId } : t
      ));
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to update the order'));
      return false;
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No exchange orders to export for this date range');
      return;
    }
    const rows = filteredTransactions.map(t => ({
      'Order No': t.orderNo,
      'Created': formatIST(t.createdAt),
      'Status': t.status,
      'User name': t.userName,
      'Email': t.userEmail || '',
      'USDT': t.amount,
      'INR': t.inr_amount ?? '',
      'Rate': t.rate ?? '',
      'Bank holder': t.bankDetails?.accountHolder || '',
      'Account number': t.bankDetails?.accountNumber || '',
      'IFSC': t.bankDetails?.ifscCode || '',
      'Bank': t.bankDetails?.bankName || '',
      'UTR': t.gatewayRefId || '',
      'Completed at': formatIST(t.completedAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    // Keep Order No and Account number as text so Excel does not drop leading zeros or round them.
    const textColumns = ['A', 'J'];
    for (let r = 2; r <= rows.length + 1; r++) {
      for (const col of textColumns) {
        const cell = sheet[`${col}${r}`];
        if (cell) { cell.t = 's'; cell.v = String(cell.v ?? ''); }
      }
    }
    sheet['!cols'] = [14, 17, 11, 22, 26, 10, 12, 8, 22, 20, 12, 18, 18, 17].map(wch => ({ wch }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Exchange orders');
    const from = fromDate || 'all';
    const to = toDate || 'all';
    XLSX.writeFile(book, `exchange-orders_${from}_${to}.xlsx`);
    toast.success(`Exported ${rows.length} order${rows.length === 1 ? '' : 's'}`);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Exchange Orders (USDT → INR)</h1>
          <p className={styles.subtitle}>For each Processing order: send the INR to the user&apos;s bank, then open the order and mark it as paid with the UTR.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <label className={styles.toolbarField}>
            <span>From</span>
            <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className={styles.toolbarField}>
            <span>To</span>
            <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
          </label>
          {(fromDate || toDate) && (
            <button type="button" className={styles.linkButton} onClick={() => { setFromDate(''); setToDate(''); }}>
              Clear dates
            </button>
          )}
          <span className={styles.toolbarSpacer} />
          <button type="button" className={styles.exportButton} onClick={handleExport} disabled={loading || filteredTransactions.length === 0}>
            <Download size={16} />
            Export .xlsx
          </button>
        </div>
        {loading ? (
          <TableSkeleton columns={6} />
        ) : (
          <DataTable
            data={filteredTransactions}
            onRowClick={handleRowClick}
          />
        )}
      </section>

      <TransactionModal
        key={isModalOpen ? selectedTransaction?.id : 'closed'}
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </main>
  );
}
