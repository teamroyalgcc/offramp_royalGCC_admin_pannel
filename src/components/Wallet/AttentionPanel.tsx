'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import styles from './attention.module.css';

interface HealthItem {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  explanation: string;
  user?: string;
  address?: string;
  at?: string;
  action: { label: string; method: string; path: string } | null;
}

interface Health {
  status: 'ok' | 'attention';
  lastCheck: { at: string; addressesChecked: number } | null;
  items: HealthItem[];
}

/**
 * "Needs your attention": every deposit problem, explained in plain words, with the
 * one button that fixes it. Items without a button either fix themselves or need the developer.
 */
export default function AttentionPanel({ onChanged }: { onChanged?: () => void }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setHealth(await adminService.getDepositHealth());
    } catch {
      toast.error('Could not load deposit status');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<any>, success: string) => {
    setBusy(key);
    try {
      const res = await fn();
      toast.success(res?.newDeposits !== undefined ? `${success} Found ${res.newDeposits} new deposit(s).` : success);
      await load();
      onChanged?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>Deposits: needs your attention</h3>
          <p className={styles.panelSub}>
            {health?.lastCheck
              ? `Last balance check: ${new Date(health.lastCheck.at).toLocaleString()} (${health.lastCheck.addressesChecked} addresses). Runs automatically every day.`
              : 'The balance check has not run yet. It runs automatically every day.'}
          </p>
        </div>
        <button
          className={`${styles.button} ${styles.secondary}`}
          disabled={busy !== null}
          onClick={() => run('audit', adminService.runDepositCheck, 'Check finished.')}
        >
          {busy === 'audit' ? 'Checking...' : 'Run check now'}
        </button>
      </div>

      {health && health.items.length === 0 && (
        <div className={styles.allGood}>
          <CheckCircle2 size={20} /> All deposits are credited and moved to the treasury. Nothing to do.
        </div>
      )}

      {health?.items.map((item) => (
        <div key={item.id} className={`${styles.item} ${styles[item.severity]}`}>
          <div>
            <p className={styles.itemTitle}>{item.title}</p>
            <p className={styles.itemText}>{item.explanation}</p>
            <p className={styles.itemMeta}>
              {[item.user, item.address, item.at && new Date(item.at).toLocaleString()].filter(Boolean).join(' · ')}
            </p>
          </div>
          {item.action && (
            <button
              className={styles.button}
              disabled={busy !== null}
              onClick={() => run(item.id, () => adminService.runAction(item.action!), 'Done.')}
            >
              {busy === item.id ? 'Working...' : item.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
