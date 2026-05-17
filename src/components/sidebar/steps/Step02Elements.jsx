import { useState } from 'react'
import { Pin, PinOff, Plus } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'

// 模拟从生成图中提取的核心元素（Phase 3 接入真实视觉分析 API）
const MOCK_EXTRACTED = [
  { id: 'elem-eyes', label: '眼部光感', prompt: 'glowing eye sensors, LED ring light' },
  { id: 'elem-joints', label: '关节结构', prompt: 'articulated ball joints, mechanical linkage' },
  { id: 'elem-surface', label: '主体曲面', prompt: 'smooth curved armor plate, industrial form' },
  { id: 'elem-horn', label: '头部装饰', prompt: 'antenna horn ornament, signal receptor' },
  { id: 'elem-logo', label: '胸口标识', prompt: 'chest emblem, glowing insignia' },
]

export default function Step02Elements() {
  const { lockedElements, lockElement, unlockElement, historyNodes } = useIPStore()
  const [customElement, setCustomElement] = useState('')

  const hasHistory = historyNodes.length > 0

  function handleAdd() {
    const trimmed = customElement.trim()
    if (!trimmed) return
    lockElement({
      id: `custom-${Date.now()}`,
      label: trimmed,
      prompt: trimmed,
    })
    setCustomElement('')
  }

  return (
    <div className="space-y-3 py-1">
      {!hasHistory && (
        <p className="text-[10px] text-neutral-600 italic">
          请先在「灵感调研」步骤生成图像
        </p>
      )}

      {/* 提取的元素列表 */}
      <div>
        <p className="text-[10px] text-neutral-500 mb-1.5">提取的核心元素</p>
        <div className="space-y-1">
          {MOCK_EXTRACTED.map((el) => {
            const locked = lockedElements.some((e) => e.id === el.id)
            return (
              <div
                key={el.id}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded border transition-colors',
                  locked
                    ? 'bg-locked/5 border-locked/30'
                    : 'bg-canvas-800 border-neutral-700/50 hover:border-neutral-600'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[11px] font-medium', locked ? 'text-locked' : 'text-neutral-300')}>
                    {el.label}
                  </p>
                  <p className="text-[9px] text-neutral-600 truncate">{el.prompt}</p>
                </div>
                <button
                  onClick={() => locked ? unlockElement(el.id) : lockElement(el)}
                  className={cn(
                    'ml-2 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors',
                    locked
                      ? 'text-locked hover:text-neutral-400'
                      : 'text-neutral-600 hover:text-locked'
                  )}
                  title={locked ? '解除锁定' : '锁定此元素'}
                >
                  {locked ? <Pin size={11} /> : <PinOff size={11} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 自定义元素输入 */}
      <div>
        <p className="text-[10px] text-neutral-500 mb-1.5">手动添加元素</p>
        <div className="flex gap-1.5">
          <input
            value={customElement}
            onChange={(e) => setCustomElement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="描述要强化的特征..."
            className="flex-1 bg-canvas-800 border border-neutral-700 rounded px-2 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!customElement.trim()}
            className="w-7 h-7 rounded bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* 已锁定元素汇总 */}
      {lockedElements.length > 0 && (
        <div>
          <p className="text-[10px] text-neutral-500 mb-1.5">
            已锁定 · {lockedElements.length} 个
          </p>
          <div className="flex flex-wrap gap-1">
            {lockedElements.map((el) => (
              <span
                key={el.id}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-locked/10 text-locked border border-locked/20"
              >
                <Pin size={8} />
                {el.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
