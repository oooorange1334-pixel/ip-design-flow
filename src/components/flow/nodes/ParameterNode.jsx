import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Pin, PinOff, Layers, Palette, Star } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'

const CATEGORY_STYLE = {
  form:  { icon: Layers,  color: 'text-blue-400',  bg: 'bg-blue-900/15',  border: 'border-blue-700/40'  },
  cmf:   { icon: Palette, color: 'text-cyan-400',  bg: 'bg-cyan-900/15',  border: 'border-cyan-700/40'  },
  motif: { icon: Star,    color: 'text-amber-400', bg: 'bg-amber-900/15', border: 'border-amber-700/40' },
}

export default memo(function ParameterNode({ id, data, selected }) {
  const { lockElement, unlockElement, lockedElements } = useIPStore()
  const isLocked = lockedElements.some(e => e.id === id)
  const style = CATEGORY_STYLE[data.category] ?? CATEGORY_STYLE.form
  const Icon = style.icon

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-100 overflow-hidden',
        style.bg, style.border,
        selected ? 'ring-2 ring-accent/50 shadow-lg shadow-accent/10' : 'hover:border-opacity-80'
      )}
      style={{ width: 140 }}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500 hover:!bg-accent" />

      {/* 标题行 */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
        <Icon size={11} className={style.color} />
        <span className={cn('text-[9px] font-mono uppercase tracking-wider', style.color)}>
          {data.category}
        </span>
        <button
          onClick={() => isLocked
            ? unlockElement(id)
            : lockElement({ id, label: data.label, prompt: data.prompt })}
          className={cn(
            'ml-auto w-4 h-4 rounded flex items-center justify-center transition-colors',
            isLocked ? 'text-locked' : 'text-neutral-600 hover:text-locked'
          )}
        >
          {isLocked ? <Pin size={9} /> : <PinOff size={9} />}
        </button>
      </div>

      {/* 缩略图 */}
      {data.imageUrl && (
        <div className="mx-2 rounded overflow-hidden" style={{ height: 64 }}>
          <img src={data.imageUrl} alt={data.label}
            className="w-full h-full object-cover" draggable={false} />
        </div>
      )}

      {/* 标签 */}
      <div className="px-2.5 pb-2 pt-1.5">
        <p className="text-[11px] font-semibold text-neutral-200 leading-tight">{data.label}</p>
        {data.tags?.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1">
            {data.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[8px] text-neutral-600 bg-neutral-800/60 px-1 rounded">{t}</span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500 hover:!bg-accent" />
    </div>
  )
})
