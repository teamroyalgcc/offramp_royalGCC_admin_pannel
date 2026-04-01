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
  onUpdateStatus: (id: string, status: TransactionStatus, note: string) => void;
}

export default function TransactionModal({ transaction, isOpen, onClose, onUpdateStatus }: TransactionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>(transaction?.status || 'pending');
  const [note, setNote] = useState('');

  if (!isOpen || !transaction) return null;

  const handleUpdate = () => {
    onUpdateStatus(transaction.id, selectedStatus, note);
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
                <span className={styles.label}>Phone / Email</span>
                <span className={styles.value}>{transaction.userEmail || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value} style={{ fontSize: '11px', wordBreak: 'break-all' }}>{transaction.userId}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Bank Account Details</h3>
            <div className={styles.bankCard}>
              {transaction.bankDetails ? (
                <>
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
                </>
              ) : (
                <p className={styles.noData}>No bank details provided</p>
              )}
            </div>
          </div>


          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Transaction Info</h3>
            <div className={styles.grid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Amount (USDT)</span>
                <span className={`${styles.value} ${styles.largeText}`}>
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Type</span>
                <span className={styles.value} style={{ textTransform: 'capitalize' }}>{transaction.type}</span>
              </div>
              {transaction.inr_amount && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Expected INR</span>
                  <span className={styles.value}>₹{transaction.inr_amount.toLocaleString()}</span>
                </div>
              )}
              {transaction.rate && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Rate</span>
                  <span className={styles.value}>₹{transaction.rate.toLocaleString()} / USDT</span>
                </div>
              )}
              {transaction.gatewayRefId && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Gateway Ref</span>
                  <span className={styles.value}>{transaction.gatewayRefId}</span>
                </div>
              )}
              {transaction.failureReason && (
                <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.label} style={{ color: '#ef4444' }}>Failure Reason</span>
                  <span className={styles.value} style={{ color: '#ef4444' }}>{transaction.failureReason}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <CustomSelect
              label="Update Status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as TransactionStatus)}
              options={[
                { label: 'Pending / Initial', value: 'pending' },
                { label: 'Approve Payout (Step 1)', value: 'approved' },
                { label: 'Finalize Success (Step 2)', value: 'success' },
                { label: 'Mark as Failed', value: 'failed' },
                { label: 'Mark as Refunded', value: 'refunded' },
              ]}
              icon={Clock}
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Add Note</h3>
            <textarea
              className={styles.noteInput}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via IMPS"
            />
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

