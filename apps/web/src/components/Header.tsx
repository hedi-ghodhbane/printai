import { Link } from '@tanstack/react-router'
import { LogIn, LogOut, PenTool } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function Header() {
  const { user, enabled, signInWithGoogle, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-ink font-display text-lg font-bold text-paper press">M</span>
          <span className="leading-tight">
            <span className="block font-display text-lg">Matbaa</span>
            <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">print studio · est. 2026</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/templates" className="nav-link" search={{}}>Templates</Link>
          <Link to="/designs" className="nav-link">My designs</Link>
          <Link to="/orders" className="nav-link">Orders</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/templates" search={{}} className="btn btn-vermillion btn-sm">
            <PenTool size={14} /> Start designing
          </Link>
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={() => void signOut()} title={user.email ?? ''}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <LogOut size={14} />
              )}
              <span className="hidden sm:inline">{user.name?.split(' ')[0] ?? 'Sign out'}</span>
            </button>
          ) : enabled ? (
            <button className="btn btn-ghost btn-sm" onClick={() => void signInWithGoogle()}>
              <LogIn size={14} /> <span className="hidden sm:inline">Sign in</span>
            </button>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">
              <LogIn size={14} /> <span className="hidden sm:inline">Guest</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
