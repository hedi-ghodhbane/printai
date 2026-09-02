import { Link, createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_site/login')({
  head: () => ({ meta: [{ title: 'Sign in — Matbaa' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { user, enabled, guestId, signInWithGoogle, signOut } = useAuth()
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <div className="paper-card p-8 text-center">
        <p className="kicker mb-2">Account</p>
        {user ? (
          <>
            <h1 className="text-3xl">Hello, {user.name ?? user.email}</h1>
            <p className="mt-2 text-sm text-ink-soft">Your designs and orders sync to this account.</p>
            <button className="btn btn-outline mt-6" onClick={() => void signOut()}>Sign out</button>
          </>
        ) : (
          <>
            <h1 className="text-3xl">Keep your designs everywhere</h1>
            <p className="mt-2 text-sm text-ink-soft">
              You're browsing as a guest: designs are saved in this browser. Sign in with Google to sync them and track orders on any device.
            </p>
            {enabled ? (
              <button className="btn btn-ink mt-6 w-full" onClick={() => void signInWithGoogle()}>
                <GoogleMark /> Continue with Google
              </button>
            ) : (
              <p className="mt-6 rounded-sm border border-dashed border-line p-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                Google sign-in isn't configured on this deployment (set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).
              </p>
            )}
            <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">guest id · {guestId || '…'}</p>
            <Link to="/templates" search={{}} className="btn btn-ghost mt-2">Continue as guest</Link>
          </>
        )}
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 35.4 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}
