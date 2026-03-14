'use client';

import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import styles from './metrics.module.css';
import { KYCStatus } from '@/types';

interface KYCMetricsProps {
  requests: any[];
  activeFilter: KYCStatus | 'all';
  onFilterChange: (status: KYCStatus | 'all') => void;
}

export default function KYCMetrics({ requests, activeFilter, onFilterChange }: KYCMetricsProps) {
  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const metrics = [
    {
      id: 'all',
      title: 'Total Applicants',
      value: stats.total,
      icon: Users,
      color: '#4f46e5',
    },
    {
      id: 'approved',
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: '#f59e0b',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: stats.rejected,
      icon: AlertCircle,
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
