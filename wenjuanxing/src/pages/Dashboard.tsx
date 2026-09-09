import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Page } from '../components/Shell'
import { useApp } from '../context'
import { closeSurvey, deleteSurvey, duplicateSurvey, listMySurveys, publishSurvey, responseCount } from '../lib/store'
import { KIND_META, type SurveyStatus } from '../types'
import { formatDate } from '../lib/id'

const statusMap: Record<SurveyStatus, { label: string; cls: string }> = {
  draft: { label: '草稿', cls: 'bg-slate-100 text-slate-600' },
  published: { label: '收集中', cls: 'bg-emerald-50 text-emerald-700' },
  closed: { label: '已结束', cls: 'bg-amber-50 text-amber-700' },
}

export function DashboardPage() {
  const { user, toast, refresh } = useApp()
  const nav = useNavigate()
  const list = listMySurveys()

  if (!user) return <Navigate to="/login" replace />

  return (
    <Page>
      <div className="wj-container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">我的问卷</h1>
            <p className="mt-1 text-sm text-slate-500">创建、发布、分享并查看统计报表</p>
          </div>
          <Link to="/create" className="wj-btn-primary">
            + 创建问卷
          </Link>
        </div>

        <div className="mt-8 overflow-hidden wj-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">标题</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">答卷</th>
                <th className="px-4 py-3 font-medium">更新时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    还没有问卷，先去创建一个吧
                  </td>
                </tr>
              ) : (
                list.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <Link to={`/edit/${s.id}`} className="font-medium hover:text-brand-600">
                        {s.title}
                      </Link>
                      <div className="text-xs text-slate-400">{s.questions.length} 题</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{KIND_META[s.kind].label}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusMap[s.status].cls}`}>
                        {statusMap[s.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{responseCount(s.id)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(s.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Link className="text-brand-600" to={`/edit/${s.id}`}>
                          编辑
                        </Link>
                        <Link className="text-brand-600" to={`/stats/${s.id}`}>
                          报表
                        </Link>
                        <button
                          className="text-brand-600"
                          onClick={async () => {
                            const url = `${location.origin}/s/${s.id}`
                            await navigator.clipboard.writeText(url)
                            toast('填写链接已复制')
                          }}
                        >
                          分享
                        </button>
                        {s.status === 'draft' ? (
                          <button
                            className="text-emerald-600"
                            onClick={() => {
                              try {
                                publishSurvey(s.id)
                                toast('已发布')
                                refresh()
                              } catch (e) {
                                toast((e as Error).message, 'err')
                              }
                            }}
                          >
                            发布
                          </button>
                        ) : s.status === 'published' ? (
                          <button
                            className="text-amber-600"
                            onClick={() => {
                              closeSurvey(s.id)
                              toast('已停止收集')
                              refresh()
                            }}
                          >
                            停止
                          </button>
                        ) : null}
                        <button
                          className="text-slate-500"
                          onClick={() => {
                            const copy = duplicateSurvey(s.id)
                            nav(`/edit/${copy.id}`)
                          }}
                        >
                          复制
                        </button>
                        <button
                          className="text-rose-500"
                          onClick={() => {
                            if (confirm('确定删除该问卷及全部答卷？')) {
                              deleteSurvey(s.id)
                              toast('已删除')
                              refresh()
                            }
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}
