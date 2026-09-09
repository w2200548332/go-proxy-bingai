import { Navigate, useNavigate } from 'react-router-dom'
import { Page } from '../components/Shell'
import { useApp } from '../context'
import { TEMPLATES } from '../lib/templates'
import { createFromKind, createFromTemplate } from '../lib/store'
import { KIND_META, type SurveyKind } from '../types'

export function CreatePage() {
  const { user, toast } = useApp()
  const nav = useNavigate()
  if (!user) return <Navigate to="/login" replace />

  function goKind(kind: SurveyKind) {
    const s = createFromKind(kind)
    nav(`/edit/${s.id}`)
  }

  function goTpl(id: string) {
    try {
      const s = createFromTemplate(id)
      nav(`/edit/${s.id}`)
    } catch (e) {
      toast((e as Error).message, 'err')
    }
  }

  return (
    <Page>
      <div className="wj-container py-10">
        <h1 className="text-2xl font-semibold">创建问卷</h1>
        <p className="mt-1 text-sm text-slate-500">选择业务类型，或直接套用模板快速开始</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(KIND_META) as SurveyKind[]).map((k) => (
            <button key={k} className="wj-card p-5 text-left hover:border-brand-200 hover:shadow-pop" onClick={() => goKind(k)}>
              <div className="text-brand-500">＋</div>
              <div className="mt-2 font-medium">{KIND_META[k].label}</div>
              <p className="mt-1 text-sm text-slate-500">{KIND_META[k].desc}</p>
            </button>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold">从模板创建</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="wj-card p-5 text-left hover:shadow-pop" onClick={() => goTpl(t.id)}>
              <div className="text-xs text-brand-600">{t.category}</div>
              <div className="mt-2 font-medium">{t.title}</div>
              <p className="mt-2 text-sm text-slate-500">{t.description}</p>
              <div className="mt-3 text-xs text-slate-400">{t.questions.length} 道题 · {KIND_META[t.kind].label}</div>
            </button>
          ))}
        </div>
      </div>
    </Page>
  )
}

export function TemplatesPage() {
  return (
    <Page>
      <div className="wj-container py-10">
        <h1 className="text-2xl font-semibold">问卷模板</h1>
        <p className="mt-1 text-sm text-slate-500">覆盖市场调查、员工满意度、报名、投票与考试等场景</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="wj-card p-5">
              <div className="text-xs text-brand-600">{t.category}</div>
              <h3 className="mt-2 font-medium">{t.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {t.questions.slice(0, 3).map((q) => (
                  <li key={q.id}>· {q.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}

export function PricingPage() {
  const plans = [
    { name: '免费版', price: '0', desc: '适用于学生等个人', items: ['不限问卷数量', '常用 10 种题型', '链接收集', '基础报表与 CSV'] },
    { name: '标准版', price: '99', desc: '适用于团队协作', items: ['显示逻辑', '填写密码', '防重复填写', '主题色定制'] },
    { name: '尊享版', price: '999', desc: '适用于中大型调研', items: ['交叉分析（规划中）', '协作空间（规划中）', '数据大屏（规划中）', '优先支持'] },
  ]
  return (
    <Page>
      <div className="wj-container py-12">
        <h1 className="text-center text-3xl font-semibold">版本对比</h1>
        <p className="mt-2 text-center text-slate-500">本演示站全部功能均可免费使用，定价页仅作界面复现</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <div key={p.name} className={`wj-card p-6 ${i === 1 ? 'border-brand-300 ring-2 ring-brand-100' : ''}`}>
              <div className="text-sm text-brand-600">{p.name}</div>
              <div className="mt-3 text-3xl font-semibold">
                {p.price}
                <span className="text-sm font-normal text-slate-400"> 元/年</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{p.desc}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink-700">
                {p.items.map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
