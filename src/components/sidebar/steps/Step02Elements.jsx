import { useDraggable } from '@dnd-kit/core'
import { Pin, PinOff, Layers, Palette, Star, Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'

const CATEGORY_CONFIG = {
  form:  { label: 'Form · 形体',    Icon: Layers,  color: 'text-blue-400',  border: 'border-blue-800/40'  },
  cmf:   { label: 'CMF · 材质色彩', Icon: Palette, color: 'text-cyan-400',  border: 'border-cyan-800/40'  },
  motif: { label: 'Motif · 符号',   Icon: Star,    color: 'text-amber-400', border: 'border-amber-800/40' },
}

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
          ? 'opacity-40 scale-95 ring-1 ring-accent'
          : 'border-neutral-800 hover:border-neutral-600'
      )}
    >
      <div className="aspect-square bg-canvas-800 overflow-hidden">
        <img
          src={item.imageUrl} alt={item.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          draggable={false}
        />
      </div>
      <div className="px-1.5 py-1 bg-canvas-900/90">
        <p className="text-[9px] text-neutral-400 truncate">{item.label}</p>
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {item.tags?.slice(0, 2).map(t => (
            <span key={t} className="text-[8px] text-neutral-700 bg-neutral-800 px-1 rounded">{t}</span>
          ))}
        </div>
      </div>

      {/* Pin 按钮 */}
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={() => isLocked ? unlockElement(item.id) : lockElement({ id: item.id, label: item.label, prompt: item.prompt })}
        className={cn(
          'absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center transition-all',
          isLocked
            ? 'bg-locked/20 text-locked opacity-100'
            : 'bg-black/60 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-locked'
        )}
      >
        {isLocked ? <Pin size={9} /> : <PinOff size={9} />}
      </button>

      {/* 拖拽提示 */}
      <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end justify-center pb-0.5">
        <span className="text-[8px] text-accent/70">拖入画布</span>
      </div>
    </div>
  )
}

function CategorySection({ categoryKey, items }) {
  const cfg = CATEGORY_CONFIG[categoryKey]
  if (!items?.length) return null
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <cfg.Icon size={11} className={cfg.color} />
        <span className={cn('text-[10px] font-semibold', cfg.color)}>{cfg.label}</span>
        <span className="text-[9px] text-neutral-700 ml-auto">{items.length} 项</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map(item => <AssetCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

export default function Step02Elements() {
  const { materialLibrary, workflowPhase, rfNodes, generateFromSelection, isGenerating } = useIPStore()

  const isExtracting = workflowPhase === 'extracting'
  const hasLibrary = materialLibrary.form.length > 0 || materialLibrary.cmf.length > 0 || materialLibrary.motif.length > 0

  // 画布上选中的参数节点
  const selectedParamIds = rfNodes
    .filter(n => n.type === 'parameter' && n.selected)
    .map(n => n.id)
  const canGenerate = selectedParamIds.length >= 1

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
          <div className="absolute inset-1 rounded-full border-2 border-t-accent border-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-sm">✨</div>
        </div>
        <div className="text-center">
          <p className="text-[12px] font-medium text-neutral-200">AI 正在解析...</p>
          <p className="text-[10px] text-neutral-600 mt-0.5">提炼 Form · CMF · Motif</p>
        </div>
      </div>
    )
  }

  if (!hasLibrary) {
    return (
      <div className="py-2">
        <p className="text-[10px] text-neutral-700 italic">
          请先在「灵感调研」步骤框选参考图并点击「提炼核心资产」
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-1">
      {/* 素材库卡片 */}
      <CategorySection categoryKey="form"  items={materialLibrary.form}  />
      <CategorySection categoryKey="cmf"   items={materialLibrary.cmf}   />
      <CategorySection categoryKey="motif" items={materialLibrary.motif} />

      {/* 生成按钮 */}
      <div className="border-t border-neutral-800 pt-3">
        <button
          onClick={() => generateFromSelection(selectedParamIds)}
          disabled={!canGenerate || isGenerating}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2 rounded-md text-[11px] font-medium transition-all',
            canGenerate && !isGenerating
              ? 'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 active:scale-[0.98]'
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
          )}
        >
          {isGenerating
            ? <><Loader2 size={12} className="animate-spin" />生成中...</>
            : <>🚀 生成草图{canGenerate ? `（${selectedParamIds.length} 个节点）` : '（先拖拽卡片到画布并框选）'}</>
          }
        </button>
      </div>
    </div>
  )
}
