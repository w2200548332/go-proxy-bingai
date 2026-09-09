import type { AnswerValue, Question, Survey, SurveyKind, SurveyResponse, User } from '../types'
import { defaultSettings } from '../types'
import { clone, nowIso, uid } from './id'
import { TEMPLATES, emptySurvey, templateToSurvey } from './templates'

const K_USERS = 'xwj_users'
const K_SESSION = 'xwj_session'
const K_SURVEYS = 'xwj_surveys'
const K_RESPONSES = 'xwj_responses'
const K_SEEDED = 'xwj_seeded_v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((fn) => fn())
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function users(): User[] {
  return read<User[]>(K_USERS, [])
}
function surveys(): Survey[] {
  return read<Survey[]>(K_SURVEYS, [])
}
function responses(): SurveyResponse[] {
  return read<SurveyResponse[]>(K_RESPONSES, [])
}

export function currentUser(): User | null {
  const id = localStorage.getItem(K_SESSION)
  if (!id) return null
  return users().find((u) => u.id === id) ?? null
}

export function register(name: string, email: string, password: string): User {
  const list = users()
  if (list.some((u) => u.email === email.trim().toLowerCase())) {
    throw new Error('该邮箱已注册')
  }
  const user: User = {
    id: uid('u'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    createdAt: nowIso(),
  }
  write(K_USERS, [...list, user])
  localStorage.setItem(K_SESSION, user.id)
  emit()
  return user
}

export function login(email: string, password: string): User {
  const user = users().find((u) => u.email === email.trim().toLowerCase() && u.password === password)
  if (!user) throw new Error('邮箱或密码不正确')
  localStorage.setItem(K_SESSION, user.id)
  emit()
  return user
}

export function logout() {
  localStorage.removeItem(K_SESSION)
  emit()
}

export function listMySurveys(): Survey[] {
  const me = currentUser()
  if (!me) return []
  return surveys()
    .filter((s) => s.ownerId === me.id)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
}

export function getSurvey(id: string): Survey | undefined {
  return surveys().find((s) => s.id === id)
}

export function saveSurvey(survey: Survey): Survey {
  const list = surveys()
  const idx = list.findIndex((s) => s.id === survey.id)
  const next = { ...survey, updatedAt: nowIso() }
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  write(K_SURVEYS, list)
  emit()
  return next
}

export function createFromKind(kind: SurveyKind): Survey {
  const me = currentUser()
  if (!me) throw new Error('请先登录')
  const draft = emptySurvey(me.id, kind)
  const survey: Survey = { ...draft, id: uid('s'), createdAt: nowIso(), updatedAt: nowIso() }
  return saveSurvey(survey)
}

export function createFromTemplate(templateId: string): Survey {
  const me = currentUser()
  if (!me) throw new Error('请先登录')
  const tpl = TEMPLATES.find((t) => t.id === templateId)
  if (!tpl) throw new Error('模板不存在')
  const draft = templateToSurvey(me.id, tpl)
  const survey: Survey = { ...draft, id: uid('s'), createdAt: nowIso(), updatedAt: nowIso() }
  return saveSurvey(survey)
}

export function duplicateSurvey(id: string): Survey {
  const me = currentUser()
  if (!me) throw new Error('请先登录')
  const src = getSurvey(id)
  if (!src || src.ownerId !== me.id) throw new Error('问卷不存在')
  const copy = clone(src)
  copy.id = uid('s')
  copy.title = `${src.title}（副本）`
  copy.status = 'draft'
  copy.createdAt = nowIso()
  copy.updatedAt = nowIso()
  copy.questions = copy.questions.map((q) => ({
    ...q,
    id: uid('q'),
    options: q.options?.map((o) => ({ ...o, id: uid('o') })),
  }))
  return saveSurvey(copy)
}

export function deleteSurvey(id: string) {
  const me = currentUser()
  if (!me) throw new Error('请先登录')
  write(
    K_SURVEYS,
    surveys().filter((s) => !(s.id === id && s.ownerId === me.id)),
  )
  write(
    K_RESPONSES,
    responses().filter((r) => r.surveyId !== id),
  )
  emit()
}

export function publishSurvey(id: string) {
  const s = getSurvey(id)
  if (!s) throw new Error('问卷不存在')
  if (!s.title.trim()) throw new Error('请填写问卷标题')
  if (s.questions.length === 0) throw new Error('至少添加一道题目')
  return saveSurvey({ ...s, status: 'published' })
}

export function closeSurvey(id: string) {
  const s = getSurvey(id)
  if (!s) throw new Error('问卷不存在')
  return saveSurvey({ ...s, status: 'closed' })
}

export function listResponses(surveyId: string): SurveyResponse[] {
  return responses()
    .filter((r) => r.surveyId === surveyId)
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
}

export function hasSubmitted(surveyId: string): boolean {
  return localStorage.getItem(`xwj_done_${surveyId}`) === '1'
}

export function markSubmitted(surveyId: string) {
  localStorage.setItem(`xwj_done_${surveyId}`, '1')
}

export function submitResponse(surveyId: string, answers: Record<string, AnswerValue>, durationSec: number) {
  const survey = getSurvey(surveyId)
  if (!survey) throw new Error('问卷不存在')
  if (survey.status !== 'published') throw new Error('该问卷未开放填写')
  if (survey.settings.startAt && new Date(survey.settings.startAt) > new Date()) {
    throw new Error('问卷尚未开始')
  }
  if (survey.settings.endAt && new Date(survey.settings.endAt) < new Date()) {
    throw new Error('问卷已结束')
  }
  if (survey.settings.oncePerBrowser && hasSubmitted(surveyId)) {
    throw new Error('您已填写过本问卷')
  }
  const rec: SurveyResponse = {
    id: uid('r'),
    surveyId,
    answers,
    durationSec,
    submittedAt: nowIso(),
  }
  write(K_RESPONSES, [rec, ...responses()])
  if (survey.settings.oncePerBrowser) markSubmitted(surveyId)
  emit()
  return rec
}

export function visibleQuestions(survey: Survey, answers: Record<string, AnswerValue>): Question[] {
  return survey.questions.filter((q) => {
    if (!q.showIf) return true
    return answers[q.showIf.questionId] === q.showIf.optionId
  })
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function seedDemo() {
  if (localStorage.getItem(K_SEEDED)) return
  const demo: User = {
    id: 'u_demo',
    name: '演示账号',
    email: 'demo@xingwenjuan.com',
    password: 'demo123',
    createdAt: nowIso(),
  }
  const existingUsers = users()
  if (!existingUsers.some((u) => u.email === demo.email)) {
    write(K_USERS, [...existingUsers, demo])
  }

  const tpl = TEMPLATES.find((t) => t.id === 'tpl-employee')!
  const draft = templateToSurvey(demo.id, tpl)
  const survey: Survey = {
    ...draft,
    id: 's_demo_employee',
    status: 'published',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    settings: { ...defaultSettings(), oncePerBrowser: false },
  }
  const voteTpl = TEMPLATES.find((t) => t.id === 'tpl-vote')!
  const voteDraft = templateToSurvey(demo.id, voteTpl)
  const vote: Survey = {
    ...voteDraft,
    id: 's_demo_vote',
    status: 'published',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const formTpl = TEMPLATES.find((t) => t.id === 'tpl-signup')!
  const formDraft = templateToSurvey(demo.id, formTpl)
  const form: Survey = {
    ...formDraft,
    id: 's_demo_form',
    status: 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const current = surveys()
  const extras = [survey, vote, form].filter((s) => !current.some((x) => x.id === s.id))
  write(K_SURVEYS, [...extras, ...current])

  const dept = survey.questions[0]
  const years = survey.questions[1]
  const sat = survey.questions[2]
  const rate = survey.questions[3]
  const improve = survey.questions[4]
  const nps = survey.questions[5]
  const demoAnswers: SurveyResponse[] = Array.from({ length: 28 }).map((_, i) => {
    const dOpt = pick(dept.options!)
    const yOpt = pick(years.options!)
    const improvePick = [...improve.options!].sort(() => Math.random() - 0.5).slice(0, 1 + (i % 3))
    return {
      id: uid('r'),
      surveyId: survey.id,
      durationSec: 40 + (i * 7) % 180,
      submittedAt: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
      answers: {
        [dept.id]: dOpt.id,
        [years.id]: yOpt.id,
        [sat.id]: 2 + (i % 4),
        [rate.id]: 3 + (i % 3),
        [improve.id]: improvePick.map((o) => o.id),
        [nps.id]: 6 + (i % 5),
        [survey.questions[6].id]: i % 4 === 0 ? '希望增加内部培训和轮岗机会。' : '',
      },
    }
  })
  write(K_RESPONSES, [...demoAnswers, ...responses()])
  localStorage.setItem(K_SEEDED, '1')
}

export function ensureSeed() {
  if (typeof window === 'undefined') return
  seedDemo()
}

if (typeof window !== 'undefined') {
  seedDemo()
}

export function responseCount(surveyId: string): number {
  return responses().filter((r) => r.surveyId === surveyId).length
}

export function exportCsv(survey: Survey, rows: SurveyResponse[]): string {
  const cols = ['提交时间', '用时(秒)', ...survey.questions.map((q, i) => `${i + 1}.${q.title}`)]
  const lines = [cols.join(',')]
  for (const row of rows) {
    const cells = [
      row.submittedAt,
      String(row.durationSec),
      ...survey.questions.map((q) => csvCell(formatAnswer(q, row.answers[q.id]))),
    ]
    lines.push(cells.join(','))
  }
  return lines.join('\n')
}

function csvCell(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function formatAnswer(q: Question, value: AnswerValue | undefined): string {
  if (value === undefined || value === null || value === '') return ''
  if (q.type === 'checkbox' || q.type === 'rank') {
    const ids = Array.isArray(value) ? value : []
    return ids.map((id) => q.options?.find((o) => o.id === id)?.label ?? id).join('；')
  }
  if (['radio', 'select'].includes(q.type)) {
    return q.options?.find((o) => o.id === value)?.label ?? String(value)
  }
  return String(value)
}
