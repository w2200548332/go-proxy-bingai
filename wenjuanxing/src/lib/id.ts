export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatShort(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export function fillIds<T extends { id: string }>(items: T[], prefix: string): T[] {
  return items.map((item) => ({ ...item, id: item.id || uid(prefix) }))
}
