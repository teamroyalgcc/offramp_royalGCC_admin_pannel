'use client';

import { useState } from 'react';
import { Wallet, Edit2, Check, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import styles from './wallet.module.css';

export default function WalletConfig() {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  const handleEdit = () => {
    setTempAddress(address);
    setIsEditing(true);
  };

  const handleSave = () => {
    setAddress(tempAddress);
    setIsEditing(false);
    toast.success('Wallet address updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  return (
    <div className={styles.configCard}>
      <div className={styles.configHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrapper}>
            <Wallet size={24} />
          </div>
          <div>
            <h2 className={styles.title}>Wallet Configuration</h2>
            <p className={styles.subtitle}>Manage your crypto public address for receiving deposits</p>
          </div>
        </div>
        {!isEditing ? (
          <button className={styles.editButton} onClick={handleEdit}>
            <Edit2 size={18} />
            <span>Edit Address</span>
          </button>
        ) : (
          <div className={styles.actionButtons}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              <Check size={18} />
              <span>Save Address</span>
            </button>
          </div>
        )}
      </div>

      <div className={styles.configBody}>
        <div className={styles.addressWrapper}>
          <label className={styles.label}>Crypto Public Address (ERC-20 / BEP-20)</label>
          <div className={styles.inputContainer}>
            {isEditing ? (
              <input 
                type="text" 
                className={styles.addressInput}
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder="Enter wallet address (e.g. 0x123...)"
                autoFocus
              />
            ) : (
              <div className={styles.addressDisplay}>
                <span className={address ? styles.addressText : styles.emptyText}>
                  {address || 'No address configured. Click Edit to add one.'}
                </span>
                {address && (
                  <button className={styles.copyButton} onClick={copyToClipboard} title="Copy to clipboard">
                    <Copy size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
