import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/Shell'
import { QuestionView } from '../components/QuestionView'
import { useApp } from '../context'
import { blankQuestion, QUESTION_META, type Question, type QuestionType, type Survey } from '../types'
import { getSurvey, publishSurvey, saveSurvey } from '../lib/store'
import { uid } from '../lib/id'

const TYPES: QuestionType[] = ['radio', 'checkbox', 'text', 'textarea', 'select', 'rating', 'scale', 'nps', 'date', 'rank']

export function EditorPage() {
  const { id } = useParams()
  const { user, toast } = useApp()
  const nav = useNavigate()
  const origin = getSurvey(id || '')
  const [survey, setSurvey] = useState<Survey | null>(origin ?? null)
  const [tab, setTab] = useState<'edit' | 'settings' | 'preview'>('edit')
  const [activeId, setActiveId] = useState(origin?.questions[0]?.id ?? '')

  if (!user) return <Navigate to="/login" replace />
  if (!survey || survey.ownerId !== user.id) {
    return (
      <Page>
        <div className="wj-container py-20 text-center text-slate-500">问卷不存在或无权编辑</div>
      </Page>
    )
  }

  const active = survey.questions.find((q) => q.id === activeId)

  function persist(next: Survey) {
    const saved = saveSurvey(next)
    setSurvey(saved)
    return saved
  }

  function addQuestion(type: QuestionType) {
    const q = blankQuestion(type)
    q.id = uid('q')
    q.options = q.options?.map((o) => ({ ...o, id: uid('o') }))
    const next = { ...survey!, questions: [...survey!.questions, q] }
    persist(next)
    setActiveId(q.id)
    setTab('edit')
  }

  function patchQuestion(qid: string, patch: Partial<Question>) {
    persist({
      ...survey!,
      questions: survey!.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    })
  }

  function move(qid: string, dir: -1 | 1) {
    const list = [...survey!.questions]
    const i = list.findIndex((q) => q.id === qid)
    const j = i + dir
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    persist({ ...survey!, questions: list })
  }

  return (
    <Page bare>
      <div className="border-b border-slate-100 bg-white">
        <div className="wj-container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-slate-500 hover:text-brand-600">
              ← 返回
            </Link>
            <input
              className="wj-input max-w-md border-transparent bg-transparent text-base font-medium"
              value={survey.title}
              onChange={(e) => persist({ ...survey, title: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            {(['edit', 'settings', 'preview'] as const).map((t) => (
              <button
                key={t}
                className={`rounded-md px-3 py-1.5 text-sm ${tab === t ? 'bg-brand-50 text-brand-600' : 'text-slate-500'}`}
                onClick={() => setTab(t)}
              >
                {t === 'edit' ? '编辑问卷' : t === 'settings' ? '问卷设置' : '预览'}
              </button>
            ))}
            <button
              className="wj-btn-ghost"
              onClick={() => {
                persist(survey)
                toast('已保存')
              }}
            >
              保存
            </button>
            <button
              className="wj-btn-primary"
              onClick={() => {
                try {
                  publishSurvey(survey.id)
                  toast('已发布，可分享填写链接')
                  nav('/dashboard')
                } catch (e) {
                  toast((e as Error).message, 'err')
                }
              }}
            >
              发布
            </button>
          </div>
        </div>
      </div>

      {tab === 'preview' ? (
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="wj-card p-8">
            <h1 className="text-2xl font-semibold">{survey.title}</h1>
            <p className="mt-2 text-slate-500">{survey.description}</p>
            <div className="mt-8 space-y-8">
              {survey.questions.map((q, i) => (
                <QuestionView key={q.id} question={q} index={i} value={undefined} onChange={() => undefined} disabled />
              ))}
            </div>
          </div>
        </div>
      ) : tab === 'settings' ? (
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="wj-card space-y-4 p-6">
            <label className="block text-sm">
              问卷说明
              <textarea
                className="wj-input mt-1"
                value={survey.description}
                onChange={(e) => persist({ ...survey, description: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              欢迎语
              <input
                className="wj-input mt-1"
                value={survey.settings.welcome}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, welcome: e.target.value } })}
              />
            </label>
            <label className="block text-sm">
              结束感谢语
              <input
                className="wj-input mt-1"
                value={survey.settings.thanks}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, thanks: e.target.value } })}
              />
            </label>
            <label className="block text-sm">
              填写密码（可选）
              <input
                className="wj-input mt-1"
                value={survey.settings.password}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, password: e.target.value } })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={survey.settings.oncePerBrowser}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, oncePerBrowser: e.target.checked } })}
              />
              同一浏览器仅允许填写一次
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={survey.settings.showProgress}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, showProgress: e.target.checked } })}
              />
              显示进度条
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                开始时间
                <input
                  type="datetime-local"
                  className="wj-input mt-1"
                  value={survey.settings.startAt?.slice(0, 16) ?? ''}
                  onChange={(e) =>
                    persist({ ...survey, settings: { ...survey.settings, startAt: e.target.value || undefined } })
                  }
                />
              </label>
              <label className="block text-sm">
                结束时间
                <input
                  type="datetime-local"
                  className="wj-input mt-1"
                  value={survey.settings.endAt?.slice(0, 16) ?? ''}
                  onChange={(e) => persist({ ...survey, settings: { ...survey.settings, endAt: e.target.value || undefined } })}
                />
              </label>
            </div>
            <label className="block text-sm">
              主题色
              <input
                type="color"
                className="mt-1 h-10 w-16 cursor-pointer"
                value={survey.settings.themeColor}
                onChange={(e) => persist({ ...survey, settings: { ...survey.settings, themeColor: e.target.value } })}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[220px_1fr_280px]">
          <aside className="wj-card h-fit p-3">
            <div className="px-2 pb-2 text-xs font-medium text-slate-400">常用题型</div>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  className="rounded-md border border-slate-100 px-2 py-2 text-left text-xs hover:border-brand-300 hover:text-brand-600"
                  onClick={() => addQuestion(t)}
                >
                  <div className="text-brand-500">{QUESTION_META[t].icon}</div>
                  {QUESTION_META[t].label}
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-3">
            <div className="wj-card p-5">
              <input
                className="wj-input border-transparent text-xl font-semibold"
                value={survey.title}
                onChange={(e) => persist({ ...survey, title: e.target.value })}
              />
              <textarea
                className="wj-input mt-2 border-transparent text-sm"
                value={survey.description}
                onChange={(e) => persist({ ...survey, description: e.target.value })}
              />
            </div>
            {survey.questions.map((q, i) => (
              <div
                key={q.id}
                className={`wj-card cursor-pointer p-5 ${activeId === q.id ? 'ring-2 ring-brand-200' : ''}`}
                onClick={() => setActiveId(q.id)}
              >
                <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {QUESTION_META[q.type].label}
                    {q.required ? ' · 必填' : ''}
                  </span>
                  <span className="flex gap-2">
                    <button onClick={() => move(q.id, -1)}>上移</button>
                    <button onClick={() => move(q.id, 1)}>下移</button>
                    <button
                      className="text-rose-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = survey.questions.filter((x) => x.id !== q.id)
                        persist({ ...survey, questions: next })
                        if (activeId === q.id) setActiveId(next[0]?.id ?? '')
                      }}
                    >
                      删除
                    </button>
                  </span>
                </div>
                <QuestionView question={q} index={i} value={undefined} onChange={() => undefined} disabled />
              </div>
            ))}
          </section>

          <aside className="wj-card h-fit p-4">
            {active ? <QuestionSettings survey={survey} question={active} onChange={patchQuestion} /> : <p className="text-sm text-slate-400">选择一道题进行设置</p>}
          </aside>
        </div>
      )}
    </Page>
  )
}

function QuestionSettings({
  survey,
  question,
  onChange,
}: {
  survey: Survey
  question: Question
  onChange: (id: string, patch: Partial<Question>) => void
}) {
  const optionTypes = ['radio', 'checkbox', 'select', 'rank']
  const prevChoices = useMemo(
    () => survey.questions.filter((q) => q.id !== question.id && (q.type === 'radio' || q.type === 'select')),
    [survey.questions, question.id],
  )
  return (
    <div className="space-y-3 text-sm">
      <div className="font-medium">题目设置</div>
      <label className="block">
        题干
        <textarea className="wj-input mt-1" value={question.title} onChange={(e) => onChange(question.id, { title: e.target.value })} />
      </label>
      <label className="block">
        说明
        <input
          className="wj-input mt-1"
          value={question.description ?? ''}
          onChange={(e) => onChange(question.id, { description: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={question.required} onChange={(e) => onChange(question.id, { required: e.target.checked })} />
        必填
      </label>
      {question.type === 'checkbox' ? (
        <label className="block">
          最多可选
          <input
            type="number"
            className="wj-input mt-1"
            value={question.maxSelect ?? ''}
            onChange={(e) => onChange(question.id, { maxSelect: e.target.value ? Number(e.target.value) : undefined })}
          />
        </label>
      ) : null}
      {optionTypes.includes(question.type) ? (
        <div>
          <div className="mb-1">选项</div>
          {(question.options ?? []).map((o, i) => (
            <div key={o.id} className="mb-2 flex gap-2">
              <input
                className="wj-input"
                value={o.label}
                onChange={(e) => {
                  const options = (question.options ?? []).map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x))
                  onChange(question.id, { options })
                }}
              />
              <button
                className="text-rose-500"
                onClick={() => onChange(question.id, { options: (question.options ?? []).filter((x) => x.id !== o.id) })}
              >
                ×
              </button>
              <span className="sr-only">{i}</span>
            </div>
          ))}
          <button
            className="text-brand-600"
            onClick={() =>
              onChange(question.id, {
                options: [...(question.options ?? []), { id: uid('o'), label: `选项${(question.options?.length ?? 0) + 1}` }],
              })
            }
          >
            + 添加选项
          </button>
        </div>
      ) : null}
      <div>
        <div className="mb-1">显示逻辑</div>
        <select
          className="wj-input"
          value={question.showIf ? `${question.showIf.questionId}:${question.showIf.optionId}` : ''}
          onChange={(e) => {
            if (!e.target.value) return onChange(question.id, { showIf: undefined })
            const [questionId, optionId] = e.target.value.split(':')
            onChange(question.id, { showIf: { questionId, optionId } })
          }}
        >
          <option value="">始终显示</option>
          {prevChoices.flatMap((q) =>
            (q.options ?? []).map((o) => (
              <option key={`${q.id}:${o.id}`} value={`${q.id}:${o.id}`}>
                当「{q.title}」选择「{o.label}」
              </option>
            )),
          )}
        </select>
      </div>
    </div>
  )
}
