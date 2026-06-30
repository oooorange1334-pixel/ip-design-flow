import { useState } from 'react'
import { Search, Loader2, Lightbulb, GripVertical } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'

const QUICK_TAGS = ['首钢园', '赛博朋克', '生物机械', '极简建筑', '工业锈蚀', '深海生物', '古典铠甲', '太空站']

// 可拖拽的素材卡片 → 拖到画布生成 mindImage 节点
function DraggableMaterial({ item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `material-${item.id}`,
    data: { type: 'mindMaterial', item },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group glass-card glass-card-hover transition-all',
        isDragging && 'opacity-40 scale-95 neon-ring'
      )}
    >
      <div className="aspect-[4/3] bg-black/30 overflow-hidden">
        <img src={item.imageUrl} alt={item.label} draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[13px] text-white truncate flex items-center gap-1">
          <GripVertical size={10} className="shrink-0" /> 拖入画布
        </p>
      </div>
    </div>
  )
}

export default function SearchPanel() {
  const { moodboard, searchMoodboard } = useProject()
  const [input, setInput] = useState('')
  const results = moodboard.results ?? []

  function handleSearch(q) {
    const query = q ?? input.trim()
    if (!query || moodboard.isSearching) return
    searchMoodboard(query)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="px-4 pt-4 pb-3 divider-x shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-soft shadow-neon-purple-sm">
            <Lightbulb size={11} className="text-accent" />
          </span>
          <p className="text-[14px] font-semibold text-neutral-100">灵感调研</p>
        </div>
        <p className="text-[13px] text-neutral-500 pl-7">搜索素材，拖入画布加入思维导图</p>
      </div>

      {/* 搜索框 */}
      <div className="px-3 py-3 shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="输入灵感关键词..."
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-[14px] text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.55)'; e.target.style.boxShadow = '0 0 0 1px rgba(124,77,255,0.35), 0 0 14px rgba(124,77,255,0.22)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={moodboard.isSearching || !input.trim()}
            className={cn(
              'px-3.5 rounded-xl text-[14px] font-semibold transition-all shrink-0 flex items-center',
              moodboard.isSearching || !input.trim() ? 'glass-card text-neutral-600 cursor-not-allowed' : 'cta-primary'
            )}
          >
            {moodboard.isSearching ? <Loader2 size={14} className="animate-spin" /> : '搜索'}
          </button>
        </div>

        {/* 快捷标签（弱化处理） */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => { setInput(tag); handleSearch(tag) }}
              disabled={moodboard.isSearching}
              className="muted-tag text-[13px] px-2.5 py-1 rounded-full disabled:opacity-40"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索结果素材网格 */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {moodboard.isSearching ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-neutral-500">
            <Loader2 size={18} className="animate-spin text-accent" />
            <p className="text-[13px]">正在获取参考素材...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-[13px] text-neutral-500 mb-2">
              「{moodboard.searchQuery}」· {results.length} 个素材，拖入画布
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {results.map(item => (
                <DraggableMaterial key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl glass-card p-3 space-y-2 mt-1">
            <p className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider">操作说明</p>
            <div className="space-y-1.5">
              {[
                ['01', '搜索关键词，下方出现素材'],
                ['02', '拖动素材到中间画布'],
                ['03', '双击画布空白新建主题'],
                ['04', '拖圆点连线，Delete 删除'],
              ].map(([num, desc]) => (
                <div key={num} className="flex items-start gap-2">
                  <span className="text-[13px] font-mono text-accent w-4 shrink-0 mt-0.5">{num}</span>
                  <span className="text-[13px] text-neutral-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
