'use client';

import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import styles from './modal.module.css';
import { Transaction, TransactionStatus } from '@/types';
import CustomSelect from '@/components/Shared/CustomSelect';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TransactionStatus, proof?: File) => void;
}

export default function TransactionModal({ transaction, isOpen, onClose, onUpdateStatus }: TransactionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>(transaction?.status || 'pending');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen || !transaction) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = () => {
    onUpdateStatus(transaction.id, selectedStatus, file || undefined);
    toast.success(`Transaction #${transaction.id} updated to ${selectedStatus}`);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Transaction Details</h2>
            <p className={styles.subtitle}>ID: #{transaction.id}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>User Information</h3>
            <div className={styles.grid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>{transaction.userName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value}>{transaction.userId}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Bank Account Details</h3>
            <div className={styles.bankCard}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Bank Name</span>
                <span className={styles.value}>{transaction.bankDetails.bankName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Account Holder</span>
                <span className={styles.value}>{transaction.bankDetails.accountHolder}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Account Number</span>
                <span className={styles.value}>{transaction.bankDetails.accountNumber}</span>
              </div>
              {transaction.bankDetails.ifscCode && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>IFSC Code</span>
                  <span className={styles.value}>{transaction.bankDetails.ifscCode}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Transaction Info</h3>
            <div className={styles.grid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Amount</span>
                <span className={`${styles.value} ${styles.largeText}`}>
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Type</span>
                <span className={styles.value}>{transaction.type}</span>
              </div>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <CustomSelect
              label="Update Status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as TransactionStatus)}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Success / Completed', value: 'success' },
                { label: 'Failed / Rejected', value: 'failed' },
              ]}
              icon={Clock}
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Upload Proof of Transaction</h3>
            <div className={styles.uploadArea}>
              <input 
                type="file" 
                id="proof-upload" 
                className={styles.fileInput} 
                onChange={handleFileChange}
              />
              <label htmlFor="proof-upload" className={styles.uploadLabel}>
                <Upload size={24} />
                <span>{file ? file.name : 'Click to select or drag and drop proof file'}</span>
                <span className={styles.smallText}>PNG, JPG or PDF up to 5MB</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.saveButton} onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
