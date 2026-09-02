import { PALETTES } from '@printai/core'

export function ColorField({ value, onChange, allowTransparent }: { value: string; onChange: (v: string) => void; allowTransparent?: boolean }) {
  const isTransparent = value === 'transparent'
  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="relative h-7 w-9 overflow-hidden rounded-sm border border-line" style={{ background: isTransparent ? undefined : value }}>
          {isTransparent && <span className="checker absolute inset-0" />}
          <input type="color" value={isTransparent ? '#ffffff' : toHex(value)} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <input className="field field-sm font-mono" value={value} onChange={(e) => onChange(e.target.value)} />
        {allowTransparent && (
          <button type="button" className="btn btn-ghost btn-sm" title="No fill" onClick={() => onChange('transparent')}>
            ∅
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {PALETTES.slice(0, 6).flatMap((p) => p.colors).filter((c, i, a) => a.indexOf(c) === i).map((c) => (
          <button key={c} type="button" className="swatch" style={{ background: c }} data-active={c === value} onClick={() => onChange(c)} title={c} />
        ))}
      </div>
    </div>
  )
}

function toHex(v: string) {
  if (/^#[0-9a-f]{6}$/i.test(v)) return v
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
  return '#000000'
}
