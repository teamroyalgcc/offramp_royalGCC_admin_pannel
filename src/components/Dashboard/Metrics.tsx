import { 
  Wallet, 
  Coins, 
  Clock, 
  ShieldCheck,
  ArrowRightLeft,
  DownloadCloud
} from 'lucide-react';

import styles from './metrics.module.css';

interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.title}>{title}</p>
        {subtitle && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function MetricsGrid({ data }: { data?: any }) {
  const metrics = [
    {
      title: 'Treasury USDT',
      value: data?.treasury?.usdt !== undefined ? `${parseFloat(data.treasury.usdt).toLocaleString()} USDT` : '0 USDT',
      icon: Wallet,
      color: '#3b82f6',
      subtitle: data?.treasury?.address || '',
    },
    {
      title: 'Treasury TRX',
      value: data?.treasury?.trx !== undefined ? `${parseFloat(data.treasury.trx).toLocaleString()} TRX` : '0 TRX',
      icon: Coins,
      color: '#ef4444',
    },
    {
      title: 'Pending Orders',
      value: data?.stats?.pendingOrders?.toString() || '0',
      icon: ArrowRightLeft,
      color: '#f59e0b',
    },
    {
      title: 'Pending KYC',
      value: data?.stats?.pendingKYC?.toString() || '0',
      icon: ShieldCheck,
      color: '#10b981',
    },
    {
      title: 'Pending Withdrawals',
      value: data?.stats?.pendingWithdrawals?.toString() || '0',
      icon: DownloadCloud,
      color: '#6366f1',
    }
  ];

  return (
    <div className={styles.grid}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
