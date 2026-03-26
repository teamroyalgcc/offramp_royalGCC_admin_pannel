'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import styles from './admin_modal.module.css';
import { AdminUser } from '@/types';
import CustomSelect from '@/components/Shared/CustomSelect';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (admin: Partial<AdminUser> & { password?: string }) => void;
  editingAdmin: AdminUser | null;
  mode: 'add' | 'password';
}

export default function AdminModal({ isOpen, onClose, onSave, editingAdmin, mode }: AdminModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAdmin && mode === 'password') {
      setUsername(editingAdmin.username);
      setEmail(editingAdmin.email);
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('admin');
    }
    setErrors({});
  }, [editingAdmin, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'add') {
      if (!username.trim()) newErrors.username = 'Username is required';
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Email is invalid';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (mode === 'add') {
      onSave({ username, email, password, role });
      toast.success('Administrator added successfully');
    } else {
      onSave({ id: editingAdmin?.id, password });
      toast.success('Password updated successfully');
    }
    
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {mode === 'add' ? 'Add New Administrator' : 'Change Password'}
            </h2>
            <p className={styles.subtitle}>
              {mode === 'add' 
                ? 'Create a new account with portal access' 
                : `Update password for ${editingAdmin?.username}`}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            {mode === 'add' && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>User Name</label>
                  <div className={`${styles.inputWrapper} ${errors.username ? styles.inputError : ''}`}>
                    <User className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                      }}
                      placeholder="e.g. FinanceManager"
                      className={styles.input}
                    />
                  </div>
                  {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ''}`}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="admin@example.com"
                      className={styles.input}
                    />
                  </div>
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <CustomSelect
                    label="Access Role"
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { label: 'Standard Admin', value: 'admin' },
                      { label: 'Super Admin', value: 'super_admin' },
                    ]}
                    icon={ShieldCheck}
                  />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {mode === 'add' ? 'Password' : 'New Password'}
              </label>
              <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••••••"
                  className={styles.input}
                />
              </div>
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={`${styles.inputWrapper} ${errors.confirmPassword ? styles.inputError : ''}`}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="••••••••••••"
                  className={styles.input}
                />
              </div>
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>

            {mode === 'password' && (
              <div className={styles.warningBox}>
                <AlertCircle size={20} />
                <p>Ensure the administrator is notified of their new credentials after the update.</p>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {mode === 'add' ? 'Create Account' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
