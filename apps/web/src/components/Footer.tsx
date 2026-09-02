import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">Matbaa</p>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            A print shop with a modern front desk and an old press soul. Design online, we print with trusted partners across Tunisia and deliver to your door.
          </p>
          <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">Tunis · Sousse · Sfax · everywhere by post</p>
        </div>
        <div>
          <p className="label">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:underline">All products</Link></li>
            <li><Link to="/templates" search={{}} className="hover:underline">Templates</Link></li>
            <li><Link to="/designs" className="hover:underline">My designs</Link></li>
            <li><Link to="/orders" className="hover:underline">Track an order</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Occasions</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/templates" search={{ occasion: 'wedding' }} className="hover:underline">Weddings</Link></li>
            <li><Link to="/templates" search={{ occasion: 'tahour' }} className="hover:underline">Tahour</Link></li>
            <li><Link to="/templates" search={{ occasion: 'graduation' }} className="hover:underline">Graduation</Link></li>
            <li><Link to="/templates" search={{ occasion: 'business' }} className="hover:underline">Business</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-center font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
          ❦ set in Fraunces & IBM Plex · printed with care ❦
        </p>
      </div>
    </footer>
  )
}
