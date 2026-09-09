import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Page } from '../components/Shell'
import { useApp } from '../context'
import { TEMPLATES } from '../lib/templates'
import { KIND_META } from '../types'

const ROTATE = ['问卷调查', '在线考试', '报名表单', '在线投票', '360度评估']

export function HomePage() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ROTATE.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <Page>
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-brand-50/60">
        <div className="wj-container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="rise">
            <div className="mb-3 text-sm font-medium text-brand-600">不止</div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              <span className="text-brand-500">{ROTATE[idx]}</span>
              <br />
              一站式调研工具
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
              编辑问卷、发送链接、回收答卷、查看报表。完整复现问卷星核心流程：创建、填写、统计，开箱即用。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="wj-btn-primary px-6 py-2.5">
                立即开始
              </Link>
              <Link to="/s/s_demo_employee" className="wj-btn-ghost px-6 py-2.5">
                体验填写页
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">演示站点累计发布问卷 3 份，回收答卷 28+ 份</p>
          </div>
          <div className="rise wj-card p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium">员工满意度调查</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">收集中</span>
            </div>
            <div className="space-y-3 text-sm">
              {['您所在的部门是？', '对目前工作的整体满意度？', '最需要改进的方面？'].map((t, i) => (
                <div key={t} className="rounded-lg bg-ink-50 px-3 py-3">
                  <div className="text-slate-500">
                    {i + 1}. {t}
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${70 - i * 16}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/stats/s_demo_employee" className="mt-4 inline-block text-sm text-brand-600">
              查看演示报表 →
            </Link>
          </div>
        </div>
      </section>

      <section className="wj-container py-16">
        <h2 className="text-center text-2xl font-semibold">可满足各类问卷 / 表单需求</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(KIND_META) as Array<keyof typeof KIND_META>).map((k) => (
            <Link key={k} to="/create" className="wj-card p-5 hover:-translate-y-0.5 hover:shadow-pop">
              <div className="text-brand-500">●</div>
              <div className="mt-2 font-medium">{KIND_META[k].label}</div>
              <p className="mt-1 text-sm text-slate-500">{KIND_META[k].desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="wj-container">
          <h2 className="text-center text-2xl font-semibold">简单三步，完成调研项目</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: '1', t: '编辑问卷', d: '从空白或模板开始，支持 10 种常用题型、必填与显示逻辑。' },
              { n: '2', t: '发送问卷', d: '发布后生成填写链接，可设置密码、起止时间与防重复填写。' },
              { n: '3', t: '数据报表', d: '饼图、条形图、原始答卷列表，一键导出 CSV。' },
            ].map((s) => (
              <div key={s.n} className="wj-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-medium">{s.t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wj-container py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">问卷模板</h2>
          <Link to="/templates" className="text-sm text-brand-600">
            更多模板 →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TEMPLATES.slice(0, 6).map((t) => (
            <div key={t.id} className="wj-card p-5">
              <div className="text-xs text-brand-600">{t.category}</div>
              <h3 className="mt-2 font-medium">{t.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{t.description}</p>
              <div className="mt-4 text-xs text-slate-400">{t.questions.length} 道题</div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  )
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { toast } = useApp()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(mode === 'login' ? 'demo@xingwenjuan.com' : '')
  const [password, setPassword] = useState(mode === 'login' ? 'demo123' : '')

  return (
    <Page bare>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <form
          className="wj-card w-full max-w-md p-8"
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              const { login, register } = await import('../lib/store')
              if (mode === 'register') register(name, email, password)
              else login(email, password)
              toast(mode === 'register' ? '注册成功' : '欢迎回来')
              nav('/dashboard')
            } catch (err) {
              toast((err as Error).message, 'err')
            }
          }}
        >
          <h1 className="text-2xl font-semibold">{mode === 'login' ? '登录星问卷' : '免费注册'}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'login' ? '演示账号已填好，可直接登录查看报表。' : '注册后即可创建、发布并回收问卷。'}
          </p>
          {mode === 'register' ? (
            <label className="mt-6 block text-sm">
              姓名
              <input className="wj-input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          ) : null}
          <label className="mt-4 block text-sm">
            邮箱
            <input className="wj-input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="mt-4 block text-sm">
            密码
            <input className="wj-input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="wj-btn-primary mt-6 w-full py-2.5" type="submit">
            {mode === 'login' ? '登录' : '注册并进入控制台'}
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                没有账号？{' '}
                <Link className="text-brand-600" to="/register">
                  去注册
                </Link>
              </>
            ) : (
              <>
                已有账号？{' '}
                <Link className="text-brand-600" to="/login">
                  去登录
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </Page>
  )
}
