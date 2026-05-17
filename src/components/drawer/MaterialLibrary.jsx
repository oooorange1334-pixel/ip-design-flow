import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Pin, Layers, Palette, Star } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'

const CATEGORY_CONFIG = {
  form:  { label: 'Form · 形体',   icon: Layers,  color: 'text-blue-400',    border: 'border-blue-800/40',    bg: 'bg-blue-900/10'  },
  cmf:   { label: 'CMF · 材质色彩', icon: Palette, color: 'text-cyan-400',    border: 'border-cyan-800/40',    bg: 'bg-cyan-900/10'  },
  motif: { label: 'Motif · 符号',  icon: Star,    color: 'text-amber-400',   border: 'border-amber-800/40',   bg: 'bg-amber-900/10' },
}

// ── 单张素材卡片（支持拖拽） ──────────────────────────────
function AssetCard({ item }) {
  const { lockElement, unlockElement, lockedElements } = useIPStore()
  const isLocked = lockedElements.some(e => e.id === item.id)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'asset', item },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'relative rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all group',
        isDragging
          ? 'opacity-50 scale-95 ring-2 ring-accent shadow-lg shadow-accent/30'
          : 'border-neutral-800 hover:border-neutral-600 hover:shadow-md',
      )}
    >
      {/* 图片 */}
      <div className="aspect-square bg-canvas-800 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
      </div>

      {/* 信息条 */}
      <div className="px-2 py-1.5 bg-canvas-900/90">
        <p className="text-[10px] font-medium text-neutral-300 truncate">{item.label}</p>
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {item.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[8px] text-neutral-600 bg-neutral-800 px-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Pin 按钮（悬浮显示） */}
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={() => isLocked ? unlockElement(item.id) : lockElement({ id: item.id, label: item.label, prompt: item.prompt })}
        className={cn(
          'absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center transition-all',
          isLocked
            ? 'bg-locked/20 text-locked opacity-100'
            : 'bg-black/60 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-locked'
        )}
        title={isLocked ? '解除锁定' : '锁定此素材'}
      >
        <Pin size={9} />
      </button>

      {/* 拖拽提示 */}
      {!isDragging && (
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1 pointer-events-none">
          <span className="text-[8px] text-accent/80">拖拽到画布</span>
        </div>
      )}
    </div>
  )
}

// ── 分类板块 ──────────────────────────────────────────────
function CategorySection({ categoryKey, items }) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = CATEGORY_CONFIG[categoryKey]
  const Icon = cfg.icon

  if (!items?.length) return null

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-neutral-800/40 transition-colors group mb-1.5"
      >
        <Icon size={11} className={cfg.color} />
        <span className={cn('text-[10px] font-semibold', cfg.color)}>{cfg.label}</span>
        <span className="text-[9px] text-neutral-700 ml-auto">{items.length}</span>
        <span className={cn('text-[9px] text-neutral-700 transition-transform', collapsed ? '' : 'rotate-90')}>›</span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-1.5">
          {items.map(item => <AssetCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

// ── 素材库主组件 ──────────────────────────────────────────
export default function MaterialLibrary() {
  const { materialLibrary, workflowPhase, lockedElements } = useIPStore()

  const isExtracting = workflowPhase === 'extracting'

  return (
    <div className="flex flex-col h-full">
      {/* 标题栏 */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={13} className="text-cyan-400" />
          <p className="text-[12px] font-semibold text-neutral-100">素材库</p>
          {lockedElements.length > 0 && (
            <span className="ml-auto text-[9px] text-locked font-mono">{lockedElements.length} 已锁定</span>
          )}
        </div>
        <p className="text-[10px] text-neutral-600">将卡片拖入画布，组装参数后生成</p>
      </div>

      {/* 提炼中 loading */}
      {isExtracting && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-t-accent border-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[16px]">✨</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-medium text-neutral-200">AI 正在解析...</p>
            <p className="text-[10px] text-neutral-600 mt-1">提炼 Form · CMF · Motif</p>
          </div>
          <div className="flex gap-1">
            {['形体', '材质', '符号'].map((label, i) => (
              <span
                key={label}
                className="text-[9px] px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-600"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 素材列表 */}
      {!isExtracting && (
        <div className="flex-1 overflow-y-auto px-3 pt-3">
          <CategorySection categoryKey="form"  items={materialLibrary.form}  />
          <CategorySection categoryKey="cmf"   items={materialLibrary.cmf}   />
          <CategorySection categoryKey="motif" items={materialLibrary.motif} />

          {/* 使用提示 */}
          <div className="mt-2 mb-4 rounded-lg border border-neutral-800 bg-canvas-800/30 p-3">
            <p className="text-[10px] text-neutral-600 leading-relaxed">
              拖拽卡片到画布 → 框选参数节点 → 点击「🚀 生成草图」
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
