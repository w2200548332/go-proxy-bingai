import type { Question, Survey, SurveyKind } from '../types'
import { blankQuestion, defaultSettings } from '../types'
import { uid } from './id'

function q(type: Question['type'], title: string, extra: Partial<Question> = {}): Question {
  const base = blankQuestion(type)
  const options = (extra.options ?? base.options)?.map((o, i) => ({
    id: o.id || uid('o'),
    label: o.label || `选项${i + 1}`,
  }))
  return {
    ...base,
    ...extra,
    type,
    title,
    id: uid('q'),
    options,
  }
}

export interface Template {
  id: string
  title: string
  kind: SurveyKind
  category: string
  description: string
  questions: Question[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-employee',
    title: '员工满意度调查',
    kind: 'assessment',
    category: '员工满意度',
    description: '覆盖部门、整体满意度、管理评价与改进建议，适合企业内部调研。',
    questions: [
      q('radio', '您所在的部门是？', {
        options: [
          { id: '', label: '产品研发' },
          { id: '', label: '市场销售' },
          { id: '', label: '客户成功' },
          { id: '', label: '运营支持' },
          { id: '', label: '综合管理' },
        ],
      }),
      q('radio', '您在本公司的工作年限？', {
        options: [
          { id: '', label: '不足 1 年' },
          { id: '', label: '1-3 年' },
          { id: '', label: '3-5 年' },
          { id: '', label: '5 年以上' },
        ],
      }),
      q('scale', '您对目前工作的整体满意度如何？'),
      q('rating', '您对直接上级的管理方式评价如何？'),
      q('checkbox', '您认为公司最需要改进的方面是？（可多选）', {
        options: [
          { id: '', label: '薪酬福利' },
          { id: '', label: '职业发展' },
          { id: '', label: '工作负荷' },
          { id: '', label: '团队氛围' },
          { id: '', label: '培训体系' },
          { id: '', label: '办公环境' },
        ],
      }),
      q('nps', '您有多大意愿向朋友推荐本公司作为工作选择？'),
      q('textarea', '如果还有其他建议，欢迎写在这里。', { required: false }),
    ],
  },
  {
    id: 'tpl-nps',
    title: '客户满意度与 NPS',
    kind: 'assessment',
    category: '客户体验',
    description: '快速收集推荐意愿、产品体验与流失风险。',
    questions: [
      q('nps', '您有多大可能向同事或朋友推荐我们的产品？'),
      q('radio', '您使用我们产品的时长？', {
        options: [
          { id: '', label: '不到 1 个月' },
          { id: '', label: '1-6 个月' },
          { id: '', label: '6-12 个月' },
          { id: '', label: '1 年以上' },
        ],
      }),
      q('checkbox', '您最认可的产品能力？（可多选）', {
        options: [
          { id: '', label: '功能完整' },
          { id: '', label: '操作简单' },
          { id: '', label: '稳定可靠' },
          { id: '', label: '客服响应' },
          { id: '', label: '价格合理' },
        ],
      }),
      q('scale', '您对客服响应速度是否满意？'),
      q('textarea', '最希望我们接下来改进什么？', { required: false }),
    ],
  },
  {
    id: 'tpl-signup',
    title: '活动报名表',
    kind: 'form',
    category: '报名表单',
    description: '姓名、联系方式、场次选择与饮食忌口，适合线下活动。',
    questions: [
      q('text', '姓名'),
      q('text', '手机号'),
      q('text', '邮箱', { required: false }),
      q('radio', '希望参加的场次', {
        options: [
          { id: '', label: '9 月 20 日（周六）上午' },
          { id: '', label: '9 月 20 日（周六）下午' },
          { id: '', label: '9 月 21 日（周日）上午' },
        ],
      }),
      q('checkbox', '感兴趣的议题', {
        required: false,
        options: [
          { id: '', label: '产品发布' },
          { id: '', label: '客户案例' },
          { id: '', label: '圆桌讨论' },
          { id: '', label: '动手工作坊' },
        ],
      }),
      q('radio', '是否有饮食忌口？', {
        options: [
          { id: '', label: '无' },
          { id: '', label: '素食' },
          { id: '', label: '清真' },
          { id: '', label: '其他（请在下一题说明）' },
        ],
      }),
      q('textarea', '其他需要我们协助的事项', { required: false }),
    ],
  },
  {
    id: 'tpl-market',
    title: '产品市场需求调查',
    kind: 'survey',
    category: '市场调查',
    description: '了解目标用户购买意愿、价格敏感度与渠道偏好。',
    questions: [
      q('radio', '您的年龄段', {
        options: [
          { id: '', label: '18 岁以下' },
          { id: '', label: '18-25 岁' },
          { id: '', label: '26-35 岁' },
          { id: '', label: '36-45 岁' },
          { id: '', label: '46 岁以上' },
        ],
      }),
      q('radio', '过去 3 个月是否购买过同类产品？', {
        options: [
          { id: '', label: '是' },
          { id: '', label: '否' },
        ],
      }),
      q('rank', '请按重要性为以下因素排序', {
        options: [
          { id: '', label: '价格' },
          { id: '', label: '品牌' },
          { id: '', label: '功能' },
          { id: '', label: '口碑' },
          { id: '', label: '售后' },
        ],
      }),
      q('select', '您更能接受的价格区间', {
        options: [
          { id: '', label: '50 元以内' },
          { id: '', label: '50-100 元' },
          { id: '', label: '100-200 元' },
          { id: '', label: '200 元以上' },
        ],
      }),
      q('textarea', '还有哪些需求目前市场上没有被满足？', { required: false }),
    ],
  },
  {
    id: 'tpl-vote',
    title: '年度优秀员工投票',
    kind: 'vote',
    category: '在线投票',
    description: '匿名投票评选优秀员工，支持多选限额。',
    questions: [
      q('checkbox', '请选出您心目中的优秀员工（最多 3 人）', {
        maxSelect: 3,
        options: [
          { id: '', label: '陈思远' },
          { id: '', label: '林晓月' },
          { id: '', label: '王浩然' },
          { id: '', label: '赵婧怡' },
          { id: '', label: '周子昂' },
        ],
      }),
      q('textarea', '推荐理由', { required: false }),
    ],
  },
  {
    id: 'tpl-exam',
    title: '信息安全培训考试',
    kind: 'exam',
    category: '业务知识考试',
    description: '短平快的应知应会考核，适合培训后测验。',
    questions: [
      q('radio', '以下哪项属于弱密码？', {
        options: [
          { id: '', label: '包含大小写、数字和符号的 12 位密码' },
          { id: '', label: '与用户名相同的密码' },
          { id: '', label: '密码管理器随机生成的密码' },
          { id: '', label: '定期更换且不复用的密码' },
        ],
      }),
      q('checkbox', '发现钓鱼邮件时应如何处理？（可多选）', {
        options: [
          { id: '', label: '不要点击可疑链接' },
          { id: '', label: '转发给同事提醒' },
          { id: '', label: '向安全团队报告' },
          { id: '', label: '立即回复对方核实' },
        ],
      }),
      q('radio', '离开工位时，电脑应处于什么状态？', {
        options: [
          { id: '', label: '锁屏' },
          { id: '', label: '保持登录以便回来继续' },
          { id: '', label: '把密码贴在显示器上' },
        ],
      }),
    ],
  },
]

export function templateToSurvey(ownerId: string, tpl: Template): Omit<Survey, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    ownerId,
    title: tpl.title,
    description: tpl.description,
    kind: tpl.kind,
    status: 'draft',
    questions: tpl.questions.map((item) => ({
      ...item,
      id: uid('q'),
      options: item.options?.map((o) => ({ ...o, id: o.id || uid('o') })),
    })),
    settings: defaultSettings(),
  }
}

export function emptySurvey(ownerId: string, kind: SurveyKind = 'survey'): Omit<Survey, 'id' | 'createdAt' | 'updatedAt'> {
  const first = blankQuestion('radio')
  first.id = uid('q')
  first.title = '请选择最符合您情况的一项'
  first.options = first.options?.map((o, i) => ({ id: uid('o'), label: `选项${i + 1}` }))
  return {
    ownerId,
    title: '未命名问卷',
    description: '感谢您抽出几分钟时间填写本问卷。',
    kind,
    status: 'draft',
    questions: [first],
    settings: defaultSettings(),
  }
}
