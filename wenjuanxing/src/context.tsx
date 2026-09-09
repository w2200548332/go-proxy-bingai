import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from './types'
import { currentUser, ensureSeed, subscribe } from './lib/store'

interface ToastItem {
  id: number
  text: string
  tone: 'ok' | 'err'
}

interface AppCtx {
  user: User | null
  toast: (text: string, tone?: 'ok' | 'err') => void
  refresh: () => void
}

const Ctx = createContext<AppCtx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    ensureSeed()
    setUser(currentUser())
    return subscribe(() => {
      setUser(currentUser())
      setTick((n) => n + 1)
    })
  }, [])

  const api = useMemo<AppCtx>(
    () => ({
      user,
      refresh: () => setTick((n) => n + 1),
      toast: (text, tone = 'ok') => {
        const id = Date.now() + Math.random()
        setToasts((list) => [...list, { id, text, tone }])
        setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2800)
      },
    }),
    [user, tick],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-2 text-sm text-white shadow-pop ${
              t.tone === 'err' ? 'bg-rose-500' : 'bg-ink-900'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AppProvider missing')
  return ctx
}
