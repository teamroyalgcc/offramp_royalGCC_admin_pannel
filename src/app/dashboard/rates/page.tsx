'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import { Percent, TrendingUp, Save, Loader2, Info, RefreshCw, Calculator, Lock, AlertTriangle } from 'lucide-react';
import styles from './rate.module.css';

interface RateInfo {
  rate: number;
  marketRate: number | null;
  spreadPercent: number;
  source: string | null;
  sources?: Record<string, number | null>;
  updatedAt: string | null;
  mode: 'live' | 'manual';
  manualRate: number | null;
  manualRateExpiresAt: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  coindcx: 'CoinDCX',
  wazirx: 'WazirX',
  zebpay: 'ZebPay',
};

const fmt = (n: number | null | undefined) => (n == null ? '---' : `${Number(n).toFixed(2)} INR`);

export default function RatesPage() {
  const [info, setInfo] = useState<RateInfo | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [spreadPercent, setSpreadPercent] = useState<string>('');
  const [manualRate, setManualRate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    fetchData(true);
  }, []);

  const fetchData = async (loadSpread = false) => {
    setLoading(true);
    try {
      const data: RateInfo = await adminService.getLiveRate();
      setInfo(data);
      setRateError(null);
      if (loadSpread) setSpreadPercent(String(data.spreadPercent));
    } catch (error: any) {
      setInfo(null);
      setRateError(error.response?.data?.message || error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const spread = parseFloat(spreadPercent);
    if (isNaN(spread) || spread < 0 || spread > 10) {
      toast.error('Spread must be between 0 and 10%');
      return;
    }
    setUpdating(true);
    try {
      const response = await adminService.updateExchangeSpread(spread);
      if (response.success) {
        toast.success('Exchange spread updated');
        await fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update spread');
    } finally {
      setUpdating(false);
    }
  };

  const applyOverride = async (value: number | null) => {
    if (value !== null && (isNaN(value) || value <= 0)) {
      toast.error('Enter a valid rate in INR per USDT');
      return;
    }
    setOverriding(true);
    try {
      const response = await adminService.setManualRate(value);
      if (response.success) {
        toast.success(value === null ? 'Override cleared: live rate in use' : 'Fixed rate set for 24 hours');
        setManualRate('');
        await fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update override');
    } finally {
      setOverriding(false);
    }
  };

  const manualActive = info?.mode === 'manual';

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>Rates Configuration</h1>
            <p className={styles.subtitle}>Live market prices, exchange spread and manual override</p>
          </div>
          <button className={styles.refreshButton} onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>Refresh Market Data</span>
          </button>
        </div>
      </header>

      {rateError && !loading && (
        <div className={styles.card} style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: '#991b1b' }}>Live rate unavailable: sells are paused</p>
              <p className={styles.infoText} style={{ color: '#7f1d1d' }}>{rateError}. Set a fixed rate below to resume sells, or refresh in a minute.</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>USDT / INR Market</h2>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Market Rate (lowest live source)</label>
                <div className={styles.inputWrapper}>
                  <TrendingUp className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={styles.input}
                    value={info?.marketRate != null ? `${fmt(info.marketRate)}${info.source ? ` · ${SOURCE_LABELS[info.source] ?? info.source}` : ''}` : '---'}
                    readOnly
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Update</label>
                <div className={styles.inputWrapper}>
                  <RefreshCw className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={styles.input}
                    value={info?.updatedAt ? new Date(info.updatedAt).toLocaleString() : '---'}
                    readOnly
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}
                  />
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '8px 0' }}>Source</th>
                  <th style={{ padding: '8px 0' }}>What a USDT seller gets</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(SOURCE_LABELS).map((key) => {
                  const v = info?.sources?.[key];
                  return (
                    <tr key={key} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0' }}>
                        {SOURCE_LABELS[key]}{info?.source === key ? ' (lowest)' : ''}
                      </td>
                      <td style={{ padding: '8px 0', color: v == null ? '#94a3b8' : '#0f172a' }}>
                        {v == null ? 'unavailable' : fmt(v)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.calculatorCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'white', borderRadius: '10px', display: 'flex', color: '#3b82f6', border: '1px solid #e2e8f0' }}>
                  <Calculator size={24} />
                </div>
                <div>
                  <p className={styles.effectiveTitle}>
                    Users Get Now {manualActive ? '(fixed rate)' : info ? `(market − ${info.spreadPercent}%)` : ''}
                  </p>
                  <p className={styles.effectiveValue}>1 USDT = {info ? Number(info.rate).toFixed(2) : '---'} INR</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Exchange Spread</h2>
        <form onSubmit={handleUpdate}>
          <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.label}>Spread (%), 0 to 10</label>
            <div className={styles.inputWrapper}>
              <Percent className={styles.inputIcon} size={20} />
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className={styles.input}
                value={spreadPercent}
                onChange={(e) => setSpreadPercent(e.target.value)}
                placeholder="e.g. 1.5"
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.button} disabled={updating}>
            {updating ? (<><Loader2 className="animate-spin" size={20} />Saving...</>) : (<><Save size={20} />Save Spread</>)}
          </button>
          <div className={styles.info}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <p className={styles.infoText} style={{ color: '#1e293b' }}>
                Users get the lowest exchange price (what CoinDCX / WazirX / ZebPay pay for USDT) minus the spread. Lower rate = less INR paid per USDT.
              </p>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle}>Manual Override</h2>
          <span
            style={{
              padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
              background: manualActive ? '#fef3c7' : '#dcfce7', color: manualActive ? '#92400e' : '#166534',
            }}
          >
            {manualActive && info?.manualRateExpiresAt
              ? `Manual until ${new Date(info.manualRateExpiresAt).toLocaleString()}`
              : 'Live'}
          </span>
        </div>
        {manualActive && info?.manualRate != null && (
          <p className={styles.infoText} style={{ marginBottom: '16px' }}>Current fixed rate: {fmt(info.manualRate)}</p>
        )}
        <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
          <label className={styles.label}>Fixed user rate (INR per USDT)</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="number"
              step="0.01"
              min="0"
              className={styles.input}
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              placeholder="e.g. 98.50"
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className={styles.button}
            disabled={overriding || !manualRate}
            onClick={() => applyOverride(parseFloat(manualRate))}
          >
            {overriding ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Set for 24 h
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={overriding || !manualActive}
            onClick={() => applyOverride(null)}
            style={{ background: '#64748b' }}
          >
            Clear override
          </button>
        </div>
        <div className={styles.info}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <p className={styles.infoText} style={{ color: '#1e293b' }}>
              Users get this rate for 24 h. It can never be higher than the live market; if live prices are unavailable, this rate is used until it expires.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
