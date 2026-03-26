'use client';

import { Users, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import styles from '../KYC/metrics.module.css';

interface UserMetricsProps {
  users: any[];
  activeFilter: 'all' | 'active' | 'frozen';
  onFilterChange: (status: 'all' | 'active' | 'frozen') => void;
}

export default function UserMetrics({ users, activeFilter, onFilterChange }: UserMetricsProps) {
  const stats = {
    total: users.length,
    active: users.filter(u => !u.is_frozen).length,
    frozen: users.filter(u => u.is_frozen).length,
  };


  const metrics = [
    {
      id: 'all',
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: '#4f46e5',
    },
    {
      id: 'active',
      title: 'Active Accounts',
      value: stats.active,
      icon: UserCheck,
      color: '#10b981',
    },
    {
      id: 'frozen',
      title: 'Frozen Accounts',
      value: stats.frozen,
      icon: UserX,
      color: '#ef4444',
    }
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isActive = activeFilter === metric.id;
        
        return (
          <div 
            key={metric.id} 
            className={`${styles.metricCard} ${isActive ? styles.active : ''}`}
            onClick={() => onFilterChange(metric.id as any)}
          >
            <div className={styles.cardHeader}>
              <div 
                className={styles.iconWrapper} 
                style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
              >
                <Icon size={24} />
              </div>
              {isActive && <div className={styles.activeIndicator} style={{ backgroundColor: metric.color }} />}
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.metricValue}>{metric.value}</h3>
              <p className={styles.metricTitle}>{metric.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
