'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { apiErrorMessage } from '@/lib/axios';
import { toast } from 'sonner';
import { Save, Loader2, RefreshCw, AlertTriangle, IndianRupee } from 'lucide-react';
import styles from './rate.module.css';

interface RateInfo {
  rate: number | null; // what users get right now; null = exchanges are paused (pausedReason says why)
  mode: 'live' | 'manual' | null;
  pausedReason?: string | null;
  manualRate: number | null;
  updatedAt: string | null;
}

const fmt = (n: number | null | undefined) => (n == null ? '—' : Number(n).toFixed(2));

export default function RatesPage() {
  const [info, setInfo] = useState<RateInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data: RateInfo = await adminService.getLiveRate();
      setInfo(data);
      setLoadError(null);
    } catch (error) {
      setInfo(null);
      setLoadError(apiErrorMessage(error, 'Could not load the rate'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const manualActive = info?.mode === 'manual';
  const paused = !loading && !loadError && info != null && info.rate === null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.round(parseFloat(input) * 100) / 100;
    if (!Number.isFinite(value) || value < 50 || value > 500) {
      toast.error('Enter a rate between 50 and 500 INR per USDT');
      return;
    }
    const current = info?.rate != null ? `${fmt(info.rate)} INR` : 'none (paused)';
    if (!confirm(`Change the rate users get from ${current} to ${value.toFixed(2)} INR per USDT?`)) return;
    setSaving(true);
    try {
      await adminService.setManualRate(value);
      toast.success(`Rate set to ${value.toFixed(2)} INR per USDT`);
      setInput('');
      await fetchData();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to set the rate'));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear the manual rate? The app will use the live Indian exchange rate minus the spread until you set a rate again.')) return;
    setSaving(true);
    try {
      await adminService.setManualRate(null);
      toast.success('Manual rate cleared, live rate in use');
      await fetchData();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to clear the manual rate'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className={styles.title}>Rates</h1>
            <p className={styles.subtitle}>The INR per USDT rate users get on exchange orders</p>
          </div>
          <button className={styles.refreshButton} onClick={fetchData} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {loadError && !loading && (
        <div className={`${styles.card} ${styles.dangerCard}`}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0 }} />
            <p className={styles.dangerText}>{loadError}</p>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Current rate users get</h2>
          {!loading && info && (
            <span className={`${styles.badge} ${manualActive ? styles.badgeManual : styles.badgeLive}`}>
              {manualActive ? 'Manual' : 'Live fallback'}
            </span>
          )}
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
          </div>
        ) : (
          <>
            <p className={styles.bigRate}>
              {info?.rate != null ? fmt(info.rate) : '—'}
              <span className={styles.bigRateUnit}> INR per USDT</span>
            </p>
            {paused && (
              <div className={styles.pausedNote}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <p className={styles.pausedTitle}>Exchanges are paused</p>
                  <p className={styles.pausedText}>{info?.pausedReason || 'No rate is available right now.'} Set a manual rate below to resume.</p>
                </div>
              </div>
            )}
            {info?.updatedAt && (
              <p className={styles.muted}>Last updated {new Date(info.updatedAt).toLocaleString()}</p>
            )}
          </>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Set the rate</h2>
        <form onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="manualRate">INR per USDT</label>
            <div className={styles.inputWrapper}>
              <IndianRupee className={styles.inputIcon} size={20} />
              <input
                id="manualRate"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="50"
                max="500"
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={info?.rate != null ? `e.g. ${fmt(info.rate)}` : 'e.g. 92.50'}
                disabled={saving || loading}
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.button} disabled={saving || loading || !input}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save
          </button>
        </form>
        <p className={styles.muted} style={{ marginTop: 16 }}>
          This exact rate is used for every new exchange order until you change or clear it.
        </p>
        {manualActive && (
          <div className={styles.clearRow}>
            <button type="button" className={styles.linkButton} onClick={handleClear} disabled={saving}>
              Clear manual rate
            </button>
            <p className={styles.smallPrint}>Without a manual rate the app uses the live Indian exchange rate minus the spread.</p>
          </div>
        )}
      </div>
    </main>
  );
}
