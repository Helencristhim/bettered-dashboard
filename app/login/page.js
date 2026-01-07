'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './login.module.css'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isVerify = searchParams.get('verify') === 'true'
  const authError = searchParams.get('error')

  useEffect(() => {
    if (session) {
      router.push('/dashboard/input')
    }
  }, [session, router])

  useEffect(() => {
    if (authError) {
      setError('Erro na autenticacao. Tente novamente.')
    }
  }, [authError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/dashboard/input',
      })

      if (result?.error) {
        setError('Erro ao enviar email. Verifique o endereco.')
      } else {
        router.push('/login?verify=true')
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loader} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradient1} />
        <div className={styles.gradient2} />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Better</span>
          <span className={styles.logoAccent}>Edtech</span>
        </div>

        <h1 className={styles.title}>Dashboard de Marketing</h1>

        {isVerify ? (
          <div className={styles.verifyMessage}>
            <div className={styles.verifyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h2>Verifique seu email</h2>
            <p>Enviamos um link de acesso para o seu email. Clique no link para entrar.</p>
            <button
              className={styles.backButton}
              onClick={() => router.push('/login')}
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>
              Entre com seu email para acessar o dashboard
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !email}
              >
                {loading ? (
                  <span className={styles.buttonLoader} />
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.loader} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
