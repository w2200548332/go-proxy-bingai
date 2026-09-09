export type QuestionType =
  | 'radio'
  | 'checkbox'
  | 'text'
  | 'textarea'
  | 'select'
  | 'rating'
  | 'scale'
  | 'nps'
  | 'date'
  | 'rank'

export type SurveyKind = 'survey' | 'form' | 'exam' | 'vote' | 'assessment'
export type SurveyStatus = 'draft' | 'published' | 'closed'

export interface QuestionOption {
  id: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: QuestionOption[]
  maxSelect?: number
  min?: number
  max?: number
  lowLabel?: string
  highLabel?: string
  showIf?: { questionId: string; optionId: string }
}

export interface SurveySettings {
  password: string
  oncePerBrowser: boolean
  welcome: string
  thanks: string
  showProgress: boolean
  showQuestionNumber: boolean
  themeColor: string
  startAt?: string
  endAt?: string
}

export interface Survey {
  id: string
  ownerId: string
  title: string
  description: string
  kind: SurveyKind
  status: SurveyStatus
  questions: Question[]
  settings: SurveySettings
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export type AnswerValue = string | string[] | number | null

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: Record<string, AnswerValue>
  durationSec: number
  submittedAt: string
}

export const QUESTION_META: Record<
  QuestionType,
  { label: string; hint: string; icon: string }
> = {
  radio: { label: '单选题', hint: '从多个选项中选择一项', icon: '○' },
  checkbox: { label: '多选题', hint: '可同时选择多个选项', icon: '☑' },
  text: { label: '填空题', hint: '一行简短文字作答', icon: '▁' },
  textarea: { label: '简答题', hint: '多行开放作答', icon: '¶' },
  select: { label: '下拉题', hint: '以下拉菜单选择一项', icon: '▾' },
  rating: { label: '评分题', hint: '星级或分数评价', icon: '★' },
  scale: { label: '量表题', hint: '李克特满意度量表', icon: '▮' },
  nps: { label: 'NPS', hint: '0-10 净推荐值', icon: '10' },
  date: { label: '日期', hint: '选择日期', icon: '日' },
  rank: { label: '排序题', hint: '按偏好拖动排序', icon: '↕' },
}

export const KIND_META: Record<SurveyKind, { label: string; desc: string }> = {
  survey: { label: '问卷调查', desc: '员工、客户、学术与市场调研' },
  form: { label: '报名表单', desc: '报名、回执、信息收集' },
  exam: { label: '在线考试', desc: '培训考核、课后练习' },
  vote: { label: '在线投票', desc: '推优评优、意见征集' },
  assessment: { label: '在线测评', desc: '满意度与体验评估' },
}

export function defaultSettings(): SurveySettings {
  return {
    password: '',
    oncePerBrowser: false,
    welcome: '',
    thanks: '感谢您的填写，您的反馈对我们非常重要！',
    showProgress: true,
    showQuestionNumber: true,
    themeColor: '#ff6a00',
  }
}

export function blankQuestion(type: QuestionType): Question {
  const base: Question = {
    id: '',
    type,
    title: QUESTION_META[type].label,
    required: true,
  }
  if (type === 'radio' || type === 'select') {
    base.options = [
      { id: '', label: '选项1' },
      { id: '', label: '选项2' },
      { id: '', label: '选项3' },
    ]
  }
  if (type === 'checkbox' || type === 'rank') {
    base.options = [
      { id: '', label: '选项1' },
      { id: '', label: '选项2' },
      { id: '', label: '选项3' },
      { id: '', label: '选项4' },
    ]
  }
  if (type === 'rating') {
    base.min = 1
    base.max = 5
    base.lowLabel = '很差'
    base.highLabel = '很好'
  }
  if (type === 'scale') {
    base.min = 1
    base.max = 5
    base.lowLabel = '非常不满意'
    base.highLabel = '非常满意'
  }
  if (type === 'nps') {
    base.min = 0
    base.max = 10
    base.lowLabel = '非常不愿意'
    base.highLabel = '非常愿意'
  }
  return base
}
