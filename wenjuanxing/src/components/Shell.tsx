import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useApp } from '../context'
import { logout } from '../lib/store'

const nav = [
  { to: '/templates', label: '模板' },
  { to: '/pricing', label: '定价' },
  { to: '/create', label: '创建问卷' },
]

export function Header() {
  const { user } = useApp()
  const navTo = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="wj-container flex h-16 items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-700 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'text-brand-600' : 'hover:text-brand-600')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="wj-btn-ghost">
                我的问卷
              </Link>
              <button
                className="wj-btn text-sm text-slate-500 hover:text-ink-800"
                onClick={() => {
                  logout()
                  navTo('/')
                }}
              >
                {user.name} · 退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="wj-btn-ghost">
                登录
              </Link>
              <Link to="/register" className="wj-btn-primary">
                免费注册
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="菜单">
          <span className="block h-0.5 w-5 bg-ink-800" />
          <span className="mt-1 block h-0.5 w-5 bg-ink-800" />
          <span className="mt-1 block h-0.5 w-5 bg-ink-800" />
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="block py-2 text-sm" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link to="/dashboard" className="block py-2 text-sm" onClick={() => setOpen(false)}>
              我的问卷
            </Link>
          ) : (
            <Link to="/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>
              登录 / 注册
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="wj-container grid gap-8 py-12 text-sm text-slate-500 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 leading-6">一站式在线问卷、表单、考试与投票工具。数据保存在本机浏览器，可直接演示全流程。</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-800">产品</div>
          <Link to="/templates" className="block py-1 hover:text-brand-600">
            问卷模板
          </Link>
          <Link to="/pricing" className="block py-1 hover:text-brand-600">
            版本对比
          </Link>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-800">场景</div>
          <p className="py-1">问卷调查 · 在线考试</p>
          <p className="py-1">报名表单 · 在线投票</p>
          <p className="py-1">满意度 · NPS</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-800">演示账号</div>
          <p>邮箱 demo@xingwenjuan.com</p>
          <p>密码 demo123</p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        星问卷演示站点 · 界面与流程参考问卷星，仅用于产品复现
      </div>
    </footer>
  )
}

export function Page({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {bare ? null : <Footer />}
    </div>
  )
}
