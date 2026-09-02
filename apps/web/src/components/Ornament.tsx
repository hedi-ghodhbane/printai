export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <span className="font-display text-lg leading-none">❦</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

export function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <p className="kicker mb-2">{kicker}</p>
      <h2 className="text-3xl md:text-4xl">{title}</h2>
      {sub && <p className="mt-2 max-w-xl text-ink-soft">{sub}</p>}
    </div>
  )
}
