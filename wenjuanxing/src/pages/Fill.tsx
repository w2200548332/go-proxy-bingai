import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QuestionView } from '../components/QuestionView'
import { Logo } from '../components/Logo'
import { useApp } from '../context'
import type { AnswerValue } from '../types'
import { getSurvey, hasSubmitted, submitResponse, visibleQuestions } from '../lib/store'

export function FillPage() {
  const { id } = useParams()
  const { toast } = useApp()
  const survey = getSurvey(id || '')
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [gate, setGate] = useState('')
  const [unlocked, setUnlocked] = useState(!survey?.settings.password)
  const [started] = useState(() => Date.now())
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const visible = useMemo(() => (survey ? visibleQuestions(survey, answers) : []), [survey, answers])
  const requiredDone = visible.filter((q) => q.required && isEmpty(answers[q.id])).length
  const progress = visible.length ? Math.round(((visible.length - requiredDone) / visible.length) * 100) : 0

  useEffect(() => {
    document.title = survey ? `${survey.title} - 星问卷` : '星问卷'
  }, [survey])

  if (!survey) {
    return (
      <Shell>
        <Empty text="问卷不存在或链接已失效" />
      </Shell>
    )
  }
  if (survey.status === 'draft') {
    return (
      <Shell>
        <Empty text="该问卷尚未发布" />
      </Shell>
    )
  }
  if (survey.status === 'closed') {
    return (
      <Shell>
        <Empty text="该问卷已停止收集" />
      </Shell>
    )
  }
  if (survey.settings.oncePerBrowser && hasSubmitted(survey.id)) {
    return (
      <Shell>
        <Empty text="您已填写过本问卷" />
      </Shell>
    )
  }
  if (!unlocked) {
    return (
      <Shell color={survey.settings.themeColor}>
        <div className="wj-card mx-auto max-w-md p-8">
          <h1 className="text-xl font-semibold">{survey.title}</h1>
          <p className="mt-2 text-sm text-slate-500">该问卷已设置填写密码</p>
          <input className="wj-input mt-4" type="password" value={gate} onChange={(e) => setGate(e.target.value)} placeholder="请输入密码" />
          <button
            className="wj-btn-primary mt-4 w-full"
            onClick={() => {
              if (gate === survey.settings.password) setUnlocked(true)
              else toast('密码不正确', 'err')
            }}
          >
            进入问卷
          </button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell color={survey.settings.themeColor}>
      <form
        className="wj-card mx-auto max-w-2xl p-6 md:p-10"
        onSubmit={(e) => {
          e.preventDefault()
          setErr('')
          const missing = visible.find((q) => q.required && isEmpty(answers[q.id]))
          if (missing) {
            setErr(`请完成必填题：${missing.title}`)
            return
          }
          try {
            submitResponse(survey.id, answers, Math.round((Date.now() - started) / 1000))
            nav(`/s/${survey.id}/thanks`)
          } catch (error) {
            setErr((error as Error).message)
          }
        }}
      >
        <div className="h-1.5 rounded-full" style={{ background: survey.settings.themeColor }} />
        <h1 className="mt-6 text-2xl font-semibold">{survey.title}</h1>
        <p className="mt-2 leading-7 text-slate-500">{survey.settings.welcome || survey.description}</p>
        {survey.settings.showProgress ? (
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>填写进度</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full" style={{ width: `${progress}%`, background: survey.settings.themeColor }} />
            </div>
          </div>
        ) : null}
        <div className="mt-8 space-y-10">
          {visible.map((q, i) => (
            <QuestionView
              key={q.id}
              question={q}
              index={i}
              showNumber={survey.settings.showQuestionNumber}
              value={answers[q.id]}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            />
          ))}
        </div>
        {err ? <p className="mt-6 text-sm text-rose-500">{err}</p> : null}
        <button className="wj-btn-primary mt-8 w-full py-3" type="submit" style={{ background: survey.settings.themeColor }}>
          提交答卷
        </button>
      </form>
    </Shell>
  )
}

export function ThanksPage() {
  const { id } = useParams()
  const survey = getSurvey(id || '')
  return (
    <Shell color={survey?.settings.themeColor}>
      <div className="wj-card mx-auto max-w-lg p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">提交成功</h1>
        <p className="mt-3 text-slate-500">{survey?.settings.thanks}</p>
        <Link to="/" className="wj-btn-ghost mt-6 inline-flex">
          返回首页
        </Link>
      </div>
    </Shell>
  )
}

function isEmpty(v: AnswerValue | undefined) {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  return false
}

function Shell({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div className="min-h-screen bg-[#f2f4f7]">
      <div className="border-b bg-white" style={{ borderTop: `4px solid ${color || '#ff6a00'}` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <span className="text-xs text-slate-400">星问卷提供技术支持</span>
        </div>
      </div>
      <div className="px-4 py-10">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="wj-card mx-auto max-w-md p-10 text-center">
      <p className="text-slate-500">{text}</p>
      <Link to="/" className="mt-4 inline-block text-sm text-brand-600">
        返回首页
      </Link>
    </div>
  )
}
