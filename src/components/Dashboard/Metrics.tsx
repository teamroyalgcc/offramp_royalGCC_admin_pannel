import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  Activity 
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

export default function MetricsGrid() {
  const metrics = [
    {
      title: 'Total Deposits',
      value: '$245,850',
      change: '+12.5%',
      isPositive: true,
      icon: ArrowDownLeft,
      color: '#10b981',
    },
    {
      title: 'Total Withdrawals',
      value: '$120,420',
      change: '+8.2%',
      isPositive: false,
      icon: ArrowUpRight,
      color: '#ef4444',
    },
    {
      title: 'Pending Approvals',
      value: '18',
      change: '-2',
      isPositive: true,
      icon: Clock,
      color: '#f59e0b',
    },
    {
      title: 'Active Volume',
      value: '$48,200',
      change: '+4.3%',
      isPositive: true,
      icon: Activity,
      color: '#4f46e5',
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
