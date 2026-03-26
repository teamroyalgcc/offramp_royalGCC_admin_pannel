import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  Activity,
  ShieldCheck
} from 'lucide-react';

import styles from './metrics.module.css';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  color: string;
}

function MetricCard({ title, value, change, isPositive, icon: Icon, color }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        <div className={`${styles.badge} ${isPositive ? styles.badgePositive : styles.badgeNegative}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          {change}
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  );
}

export default function MetricsGrid({ data }: { data?: any }) {
  const metrics = [
    {
      title: 'Total USDT Volume',
      value: data?.total_volume_usdt ? `${parseFloat(data.total_volume_usdt).toLocaleString()} USDT` : '0 USDT',
      change: '+0%',
      isPositive: true,
      icon: Activity,
      color: '#4f46e5',
    },
    {
      title: 'Total Users',
      value: data?.total_users?.toString() || '0',
      change: '+0',
      isPositive: true,
      icon: Clock,
      color: '#f59e0b',
    },
    {
      title: 'Pending KYC',
      value: data?.pending_kyc?.toString() || '0',
      change: '-0',
      isPositive: false,
      icon: ShieldCheck, // Need to import this or Use Shield
      color: '#ef4444',
    },
    {
      title: 'Success Orders',
      value: data?.success_orders?.toString() || '0',
      change: '+0',
      isPositive: true,
      icon: ArrowUpRight,
      color: '#10b981',
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

