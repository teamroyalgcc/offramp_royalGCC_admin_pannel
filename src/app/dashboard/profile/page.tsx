'use client';

import styles from '../transactions/dashboard.module.css';
import profileStyles from './profile.module.css';

export default function ProfilePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Profile</h1>
          <p className={styles.subtitle}>Manage your account settings and preferences</p>
        </div>
      </header>

      <section className={profileStyles.profileCard}>
          <div className={profileStyles.avatarSection}>
              <div className={profileStyles.largeAvatar}>AD</div>
              <button className={profileStyles.changePhoto}>Change Photo</button>
          </div>

          <form className={profileStyles.form}>
              <div className={profileStyles.inputGrid}>
                  <div className={profileStyles.inputGroup}>
                      <label>Full Name</label>
                      <input type="text" defaultValue="Admin User" />
                  </div>
                  <div className={profileStyles.inputGroup}>
                      <label>Email Address</label>
                      <input type="email" defaultValue="admin@fintech.com" />
                  </div>
                  <div className={profileStyles.inputGroup}>
                      <label>Role</label>
                      <input type="text" defaultValue="Super Admin" disabled />
                  </div>
                  <div className={profileStyles.inputGroup}>
                      <label>Department</label>
                      <input type="text" defaultValue="Finance Operations" />
                  </div>
              </div>
              <button type="submit" className={profileStyles.saveButton}>Save Profile</button>
          </form>
      </section>
    </main>
  );
}
