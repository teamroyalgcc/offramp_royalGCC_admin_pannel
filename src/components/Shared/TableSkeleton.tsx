'use client';
import styles from './table_skeleton.module.css';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className={styles.skeletonContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className={styles.skeletonHeader}></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className={styles.tableRow}>
              {[...Array(columns)].map((_, j) => (
                <td key={j}>
                  {j === 0 ? (
                    <div className={styles.userInfo}>
                      <div className={styles.avatarSkeleton}></div>
                      <div className={styles.textSkeletonShort}></div>
                    </div>
                  ) : j === columns - 1 ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <div className={styles.actionSkeleton}></div>
                    </div>
                  ) : (
                    <div className={j % 2 === 0 ? styles.badgeSkeleton : styles.textSkeletonLong}></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
