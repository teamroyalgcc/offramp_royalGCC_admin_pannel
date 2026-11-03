'use client';

import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Loader2, Save, ArrowLeft, Eye, EyeOff, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { apiErrorMessage } from '@/lib/axios';
import styles from '../transactions/dashboard.module.css';
import settingsStyles from './settings.module.css';
import SettingsSkeleton from './SettingsSkeleton';

/** x.y.z, numbers only (what the mobile app compares against). */
const SEMVER = /^\d+\.\d+\.\d+$/;

export default function SettingsPage() {
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

  // App release form
  const [releaseLoading, setReleaseLoading] = useState(true);
  const [releaseSaving, setReleaseSaving] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [minVersion, setMinVersion] = useState('');
  const [apkUrl, setApkUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await adminService.getMe();
          if (response.role === 'superadmin') {
            setIsAuthorized(true);
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

  useEffect(() => {
    if (isAuthorized !== true) return;
    let cancelled = false;
    adminService.getAppVersion()
      .then((v) => {
        if (cancelled) return;
        setLatestVersion(v.latestVersion ?? '');
        setMinVersion(v.minVersion ?? '');
        setApkUrl(v.apkUrl ?? '');
        setReleaseNotes(v.releaseNotes ?? '');
      })
      .catch(() => { if (!cancelled) toast.error('Could not load the app release settings'); })
      .finally(() => { if (!cancelled) setReleaseLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthorized]);

  const handleReleaseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const latest = latestVersion.trim();
    const min = minVersion.trim();
    const url = apkUrl.trim();
    if (latest && !SEMVER.test(latest)) {
      toast.error('Latest version must look like 1.2.3');
      return;
    }
    if (min && !SEMVER.test(min)) {
      toast.error('Minimum version must look like 1.2.3');
      return;
    }
    if (url && !/^https:\/\/\S+$/.test(url)) {
      toast.error('APK URL must start with https://');
      return;
    }
    setReleaseSaving(true);
    try {
      await adminService.updateAppRelease({
        latestVersion: latest || null,
        minVersion: min || null,
        apkUrl: url || null,
        releaseNotes: releaseNotes.trim() || null,
      });
      toast.success('App release settings saved');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to save the app release settings'));
    } finally {
      setReleaseSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload: { username: string; password?: string } = { username };
      if (password) payload.password = password;

      const response = await adminService.updateCredentials(payload);
      if (response.status === 'success' || response.admin || response.username) {
        toast.success(response.message || 'Credentials updated successfully');
        const updatedAdmin = response.admin || response.data || response;
        localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'An unexpected error occurred'));
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
          <p className={styles.subtitle}>Administrator credentials and mobile app release</p>
        </div>
      </header>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <>
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

        <section className={settingsStyles.settingsCard} style={{ marginTop: 24 }}>
          <div className={settingsStyles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Smartphone size={18} color="#4f46e5" />
              <h2 className={settingsStyles.sectionTitle}>App release</h2>
            </div>
            <p className={settingsStyles.sectionSubtitle}>Users on an older version see an update prompt; versions below the minimum must update before they can continue.</p>
          </div>

          {releaseLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <Loader2 className="animate-spin" size={24} color="#4f46e5" />
            </div>
          ) : (
            <form onSubmit={handleReleaseSave} className={settingsStyles.form}>
              <div className={settingsStyles.inputGroup}>
                <label htmlFor="latestVersion">Latest version (x.y.z)</label>
                <input
                  id="latestVersion"
                  type="text"
                  inputMode="decimal"
                  value={latestVersion}
                  onChange={(e) => setLatestVersion(e.target.value)}
                  placeholder="e.g. 1.2.3"
                  pattern="\d+\.\d+\.\d+"
                  disabled={releaseSaving}
                />
              </div>

              <div className={settingsStyles.inputGroup}>
                <label htmlFor="minVersion">Minimum version (x.y.z, optional)</label>
                <input
                  id="minVersion"
                  type="text"
                  inputMode="decimal"
                  value={minVersion}
                  onChange={(e) => setMinVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  pattern="\d+\.\d+\.\d+"
                  disabled={releaseSaving}
                />
              </div>

              <div className={settingsStyles.inputGroup}>
                <label htmlFor="apkUrl">APK URL (https)</label>
                <input
                  id="apkUrl"
                  type="url"
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  placeholder="https://…/app.apk"
                  disabled={releaseSaving}
                />
              </div>

              <div className={settingsStyles.inputGroup}>
                <label htmlFor="releaseNotes">Release notes</label>
                <textarea
                  id="releaseNotes"
                  className={settingsStyles.textarea}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="What changed in this version (shown to users in the update prompt)"
                  rows={4}
                  disabled={releaseSaving}
                />
              </div>

              <button
                type="submit"
                className={settingsStyles.saveButton}
                disabled={releaseSaving}
              >
                {releaseSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {releaseSaving ? 'Saving...' : 'Save app release'}
              </button>
            </form>
          )}
        </section>
        </>
      )}
    </main>
  );
}
