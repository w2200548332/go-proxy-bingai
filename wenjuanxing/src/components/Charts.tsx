export function PieChart({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1
  let acc = 0
  const segs = items.map((i) => {
    const start = acc / total
    acc += i.value
    const end = acc / total
    return { ...i, start, end }
  })
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 32 32" className="h-36 w-36 shrink-0">
        {segs.map((s) => {
          const a0 = s.start * Math.PI * 2 - Math.PI / 2
          const a1 = s.end * Math.PI * 2 - Math.PI / 2
          const x0 = 16 + 14 * Math.cos(a0)
          const y0 = 16 + 14 * Math.sin(a0)
          const x1 = 16 + 14 * Math.cos(a1)
          const y1 = 16 + 14 * Math.sin(a1)
          const large = s.end - s.start > 0.5 ? 1 : 0
          if (s.value <= 0) return null
          return (
            <path
              key={s.label}
              d={`M16 16 L${x0} ${y0} A14 14 0 ${large} 1 ${x1} ${y1} Z`}
              fill={s.color}
            />
          )
        })}
        <circle cx="16" cy="16" r="7" fill="white" />
      </svg>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
            <span className="text-ink-800">{i.label}</span>
            <span className="text-slate-400">
              {i.value}（{Math.round((i.value / total) * 100)}%）
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{i.label}</span>
            <span className="text-slate-400">{i.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const PALETTE = ['#ff6a00', '#4c8dff', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6', '#64748b']

export function palette(i: number) {
  return PALETTE[i % PALETTE.length]
}
