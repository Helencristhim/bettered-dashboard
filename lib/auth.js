import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // Credenciais fixas
        const users = [
          { email: 'admin@betteredtech.com.br', password: 'better2024' },
          { email: 'admin@better.com', password: 'admin123' },
        ]

        const user = users.find(
          (u) =>
            u.email === credentials?.email &&
            u.password === credentials?.password
        )

        if (user) {
          return {
            id: '1',
            email: user.email,
            name: 'Admin',
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-bettered-2024',
}
