'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, User, ShieldAlert, Loader2, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import styles from '../transactions/dashboard.module.css';
import settingsStyles from './settings.module.css';
import SettingsSkeleton from './SettingsSkeleton';

export default function SettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await adminService.getMe();
          if (response.role === 'superadmin') {
            setIsAuthorized(true);
            setAdmin(response);
            setUsername(response.username);
          } else {
            setIsAuthorized(false);
            toast.error('Only Super Admins can access this page');
          }
      } catch (error) {
        setIsAuthorized(false);
        console.error('Role check failed', error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload: any = { username };
      if (password) payload.password = password;

      const response = await adminService.updateCredentials(payload);
      if (response.status === 'success' || response.admin || response.username) {
        toast.success(response.message || 'Credentials updated successfully');
        const updatedAdmin = response.admin || response.data || response;
        setAdmin(updatedAdmin);
        localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };



  if (isAuthorized === false) {
    return (
      <div className={settingsStyles.unauthorized}>
        <div className={settingsStyles.unauthorizedIcon}>
          <ShieldAlert size={32} />
        </div>
        <h2 className={settingsStyles.unauthorizedTitle}>Access Restricted</h2>
        <p className={settingsStyles.unauthorizedText}>
          You must be a Super Administrator to access and manage system-wide settings.
        </p>
        <button 
          className={settingsStyles.backButton}
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft size={18} style={{ marginRight: '8px' }} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Settings size={24} color="#4f46e5" />
            <h1 className={styles.title}>System Settings</h1>
          </div>
          <p className={styles.subtitle}>Configure your administrative account credentials</p>
        </div>
      </header>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <section className={settingsStyles.settingsCard}>
        <div className={settingsStyles.sectionHeader}>
          <h2 className={settingsStyles.sectionTitle}>Administrator Credentials</h2>
          <p className={settingsStyles.sectionSubtitle}>Update your primary admin username and secure password</p>
        </div>

        <form onSubmit={handleUpdate} className={settingsStyles.form}>
          <div className={settingsStyles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={saving}
              required
            />
          </div>

          <div className={settingsStyles.inputGroup}>
            <label htmlFor="password">New Password (leave blank to keep current)</label>
            <div className={settingsStyles.inputWrapper}>
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={saving}
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className={settingsStyles.eyeButton} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {password && (
            <div className={settingsStyles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className={settingsStyles.inputWrapper}>
                <input 
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={saving}
                  required
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className={settingsStyles.eyeButton} 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={settingsStyles.saveButton}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Updating...' : 'Update Credentials'}
          </button>
        </form>
        </section>
      )}
    </main>
  );
}
