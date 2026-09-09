import type { AnswerValue, Question } from '../types'

interface Props {
  question: Question
  index: number
  value: AnswerValue | undefined
  onChange: (v: AnswerValue) => void
  showNumber?: boolean
  disabled?: boolean
}

export function QuestionView({ question, index, value, onChange, showNumber = true, disabled }: Props) {
  const title = (
    <div className="mb-3">
      <div className="text-[15px] font-medium leading-7 text-ink-900">
        {showNumber ? <span className="mr-1 text-brand-500">{index + 1}.</span> : null}
        {question.title}
        {question.required ? <span className="ml-1 text-rose-500">*</span> : <span className="ml-1 text-xs text-slate-400">选填</span>}
      </div>
      {question.description ? <p className="mt-1 text-sm text-slate-500">{question.description}</p> : null}
    </div>
  )

  if (question.type === 'radio' || question.type === 'select') {
    if (question.type === 'select') {
      return (
        <div>
          {title}
          <select
            className="wj-input max-w-md"
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">请选择</option>
            {question.options?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )
    }
    return (
      <div>
        {title}
        <div className="space-y-2">
          {question.options?.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                value === o.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                disabled={disabled}
                checked={value === o.id}
                onChange={() => onChange(o.id)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (question.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div>
        {title}
        {question.maxSelect ? <p className="mb-2 text-xs text-slate-400">最多选择 {question.maxSelect} 项</p> : null}
        <div className="space-y-2">
          {question.options?.map((o) => {
            const on = selected.includes(o.id)
            return (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                  on ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={on}
                  onChange={() => {
                    let next = on ? selected.filter((id) => id !== o.id) : [...selected, o.id]
                    if (question.maxSelect && next.length > question.maxSelect) next = next.slice(-question.maxSelect)
                    onChange(next)
                  }}
                />
                {o.label}
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (question.type === 'text' || question.type === 'date') {
    return (
      <div>
        {title}
        <input
          className="wj-input max-w-lg"
          type={question.type === 'date' ? 'date' : 'text'}
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入"
        />
      </div>
    )
  }

  if (question.type === 'textarea') {
    return (
      <div>
        {title}
        <textarea
          className="wj-input min-h-28"
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入"
        />
      </div>
    )
  }

  if (question.type === 'rating' || question.type === 'scale' || question.type === 'nps') {
    const min = question.min ?? (question.type === 'nps' ? 0 : 1)
    const max = question.max ?? (question.type === 'nps' ? 10 : 5)
    const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    const current = typeof value === 'number' ? value : null
    return (
      <div>
        {title}
        <div className="flex flex-wrap items-end gap-2">
          <span className="mb-1 text-xs text-slate-400">{question.lowLabel}</span>
          {nums.map((n) => (
            <button
              type="button"
              disabled={disabled}
              key={n}
              onClick={() => onChange(n)}
              className={`h-10 min-w-10 rounded-md border text-sm ${
                current === n ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white hover:border-brand-300'
              }`}
            >
              {question.type === 'rating' ? (n <= (current ?? 0) ? '★' : '☆') : n}
            </button>
          ))}
          <span className="mb-1 text-xs text-slate-400">{question.highLabel}</span>
        </div>
      </div>
    )
  }

  if (question.type === 'rank') {
    const order = Array.isArray(value) && value.length ? value : question.options?.map((o) => o.id) ?? []
    return (
      <div>
        {title}
        <p className="mb-2 text-xs text-slate-400">点击上下箭头调整优先级，越靠前越重要</p>
        <div className="space-y-2">
          {order.map((id, i) => {
            const opt = question.options?.find((o) => o.id === id)
            return (
              <div key={id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span>
                  <span className="mr-2 text-slate-400">{i + 1}</span>
                  {opt?.label ?? id}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    className="wj-btn-ghost px-2 py-1"
                    disabled={disabled || i === 0}
                    onClick={() => {
                      const next = [...order]
                      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                      onChange(next)
                    }}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="wj-btn-ghost px-2 py-1"
                    disabled={disabled || i === order.length - 1}
                    onClick={() => {
                      const next = [...order]
                      ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
                      onChange(next)
                    }}
                  >
                    下移
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return title
}
