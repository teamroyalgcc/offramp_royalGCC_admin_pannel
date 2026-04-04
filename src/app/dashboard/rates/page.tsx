'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import { Percent, TrendingUp, Save, Loader2, Info, RefreshCw, Calculator } from 'lucide-react';
import styles from './rate.module.css';

export default function RatesPage() {
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [spreadPercent, setSpreadPercent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rateData = await adminService.getLiveRate();
      setLiveRate(rateData.rate);
    } catch (error) {
      console.error('Failed to fetch rate:', error);
      toast.error('Failed to fetch real-time rate data');
    } finally {
      setLoading(true); // Short delay for UX if we want, or just set true then false 
      // Actually fetchData already starts with setLoading(true)
      // I'll just set it to false
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const spread = parseFloat(spreadPercent);
    if (isNaN(spread) || spread > 100) {
      toast.error('Spread must be a numeric value less than or equal to 100');
      return;
    }

    setUpdating(true);
    try {
      const response = await adminService.updateExchangeSpread(spread);
      if (response.success) {
        toast.success('Exchange spread updated successfully');
        if (response.config?.exchange_spread_percent !== undefined) {
          setSpreadPercent(response.config.exchange_spread_percent.toString());
        }
      }
    } catch (error: any) {
      console.error('Failed to update spread:', error);
      toast.error(error.response?.data?.message || 'Failed to update spread');
    } finally {
      setUpdating(false);
    }
  };

  const effectiveRate = (() => {
    if (!liveRate) return null;
    const spread = parseFloat(spreadPercent);
    if (isNaN(spread)) return liveRate;
    return liveRate * (1 - spread / 100);
  })();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>Rates Configuration</h1>
            <p className={styles.subtitle}>Manage market rates and exchange spread settings</p>
          </div>
          <button className={styles.refreshButton} onClick={fetchData} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span>Refresh Market Data</span>
          </button>
        </div>
      </header>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>USDT / INR Settings</h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Live Market Rate</label>
                <div className={styles.inputWrapper}>
                  <TrendingUp className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={styles.input}
                    value={liveRate ? `${liveRate.toFixed(2)} INR` : '---'}
                    readOnly
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Exchange Spread (%)</label>
                <div className={styles.inputWrapper}>
                  <Percent className={styles.inputIcon} size={20} />
                  <input
                    type="number"
                    step="0.1"
                    className={styles.input}
                    value={spreadPercent}
                    onChange={(e) => setSpreadPercent(e.target.value)}
                    placeholder="e.g. 1.0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.calculatorCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'white', borderRadius: '10px', display: 'flex', color: '#3b82f6', border: '1px solid #e2e8f0' }}>
                  <Calculator size={24} />
                </div>
                <div>
                  <p className={styles.effectiveTitle}>Effective User Rate</p>
                  <p className={styles.effectiveValue}>
                    1 USDT = {effectiveRate !== null ? effectiveRate.toFixed(2) : '---'} INR
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating Settings...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Configuration
                </>
              )}
            </button>

            <div className={styles.info}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Info size={20} style={{ color: '#3b82f6' }} />
                <p className={styles.infoText} style={{ color: '#1e293b' }}>
                  The spread is subtracted from the market rate. 1% spread means users get market rate - 1%; -1% spread means users get market rate + 1%.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
