'use client'

import { useSession, signOut } from 'next-auth/react'
import styles from './Header.module.css'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoText}>Better</span>
        <span className={styles.logoAccent}>Edtech</span>
      </div>

      <div className={styles.right}>
        {session?.user?.email && (
          <span className={styles.email}>{session.user.email}</span>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={styles.logoutButton}
        >
          Sair
        </button>
      </div>
    </header>
  )
}
