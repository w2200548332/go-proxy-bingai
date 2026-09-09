import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Page } from '../components/Shell'
import { BarList, PieChart, palette } from '../components/Charts'
import { useApp } from '../context'
import { exportCsv, formatAnswer, getSurvey, listResponses, responseCount } from '../lib/store'
import { formatDate as fmt } from '../lib/id'

export function StatsPage() {
  const { id } = useParams()
  const { user } = useApp()
  const survey = getSurvey(id || '')
  const rows = survey ? listResponses(survey.id) : []
  const [tab, setTab] = useState<'chart' | 'table'>('chart')
  const isDemo = !!survey && survey.id.startsWith('s_demo_')

  const overview = useMemo(() => {
    const today = new Date().toDateString()
    return {
      total: rows.length,
      today: rows.filter((r) => new Date(r.submittedAt).toDateString() === today).length,
      avg: rows.length ? Math.round(rows.reduce((s, r) => s + r.durationSec, 0) / rows.length) : 0,
    }
  }, [rows])

  if (!survey) {
    return (
      <Page>
        <div className="wj-container py-20 text-center text-slate-500">问卷不存在</div>
      </Page>
    )
  }
  if (!isDemo && !user) return <Navigate to="/login" replace />
  if (!isDemo && survey.ownerId !== user?.id) {
    return (
      <Page>
        <div className="wj-container py-20 text-center text-slate-500">无权查看该报表</div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="wj-container py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-brand-600">
              ← 我的问卷
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{survey.title}</h1>
            <p className="text-sm text-slate-500">已回收 {responseCount(survey.id)} 份答卷</p>
          </div>
          <button
            className="wj-btn-ghost"
            onClick={() => {
              const csv = exportCsv(survey, rows)
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `${survey.title}.csv`
              a.click()
            }}
          >
            导出 CSV
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { k: '回收总量', v: overview.total },
            { k: '今日新增', v: overview.today },
            { k: '平均用时', v: `${overview.avg} 秒` },
          ].map((x) => (
            <div key={x.k} className="wj-card p-5">
              <div className="text-sm text-slate-500">{x.k}</div>
              <div className="mt-2 text-2xl font-semibold">{x.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button className={`wj-btn ${tab === 'chart' ? 'wj-btn-primary' : 'wj-btn-ghost'}`} onClick={() => setTab('chart')}>
            分类统计
          </button>
          <button className={`wj-btn ${tab === 'table' ? 'wj-btn-primary' : 'wj-btn-ghost'}`} onClick={() => setTab('table')}>
            原始答卷
          </button>
        </div>

        {tab === 'table' ? (
          <div className="wj-card mt-4 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2">提交时间</th>
                  <th className="px-3 py-2">用时</th>
                  {survey.questions.map((q, i) => (
                    <th key={q.id} className="px-3 py-2">
                      {i + 1}.{q.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-3 py-2">{fmt(r.submittedAt)}</td>
                    <td className="px-3 py-2">{r.durationSec}s</td>
                    {survey.questions.map((q) => (
                      <td key={q.id} className="max-w-xs truncate px-3 py-2">
                        {formatAnswer(q, r.answers[q.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {survey.questions.map((q, i) => {
              const values = rows.map((r) => r.answers[q.id])
              return (
                <div key={q.id} className="wj-card p-5">
                  <h3 className="font-medium">
                    {i + 1}. {q.title}
                  </h3>
                  <p className="mb-4 text-xs text-slate-400">作答 {values.filter((v) => v !== undefined && v !== '' && v !== null).length} 次</p>
                  {['radio', 'select'].includes(q.type) ? (
                    <PieChart
                      items={(q.options ?? []).map((o, idx) => ({
                        label: o.label,
                        value: values.filter((v) => v === o.id).length,
                        color: palette(idx),
                      }))}
                    />
                  ) : q.type === 'checkbox' || q.type === 'rank' ? (
                    <BarList
                      items={(q.options ?? []).map((o) => ({
                        label: o.label,
                        value: values.filter((v) => Array.isArray(v) && v.includes(o.id)).length,
                      }))}
                    />
                  ) : q.type === 'rating' || q.type === 'scale' || q.type === 'nps' ? (
                    <BarList
                      items={Array.from({ length: (q.max ?? 5) - (q.min ?? 1) + 1 }, (_, n) => {
                        const num = (q.min ?? 1) + n
                        return { label: String(num), value: values.filter((v) => v === num).length }
                      })}
                    />
                  ) : (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {values
                        .filter((v) => typeof v === 'string' && v.trim())
                        .slice(0, 8)
                        .map((v, idx) => (
                          <li key={idx} className="rounded-md bg-ink-50 px-3 py-2">
                            {String(v)}
                          </li>
                        ))}
                      {values.filter((v) => typeof v === 'string' && v.trim()).length === 0 ? (
                        <li className="text-slate-400">暂无文本答卷</li>
                      ) : null}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Page>
  )
}
