'use client';
import styles from './settings_skeleton.module.css';

export default function SettingsSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.headerSkeleton}>
        <div className={styles.titleSkeleton}></div>
        <div className={styles.subtitleSkeleton}></div>
      </div>
      <div className={styles.formSkeleton}>
        <div className={styles.inputGroup}>
          <div className={styles.labelSkeleton}></div>
          <div className={styles.inputSkeleton}></div>
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.labelSkeleton}></div>
          <div className={styles.inputSkeleton}></div>
        </div>
        <div className={styles.buttonSkeleton}></div>
      </div>
    </div>
  );
}
