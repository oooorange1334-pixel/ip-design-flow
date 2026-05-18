import { useState } from 'react'
import { Search, Loader2, Lightbulb } from 'lucide-react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'

const QUICK_TAGS = ['首钢园', '赛博朋克', '生物机械', '极简建筑', '工业锈蚀', '深海生物', '古典铠甲', '太空站']

export default function SearchPanel() {
  const { moodboard, searchMoodboard } = useProject()
  const [input, setInput] = useState('')

  function handleSearch(q) {
    const query = q ?? input.trim()
    if (!query || moodboard.isSearching) return
    searchMoodboard(query)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="px-4 pt-4 pb-3 border-b border-line shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={13} className="text-violet-400" />
          <p className="text-[14px] font-semibold text-neutral-100">灵感调研</p>
        </div>
        <p className="text-[14px] text-neutral-600">搜索关键词，图片将散落在画布上</p>
      </div>

      {/* 搜索框 */}
      <div className="px-3 py-3 shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="输入灵感关键词..."
              className="w-full bg-canvas-800 border border-line rounded-md pl-7 pr-2 py-2 text-[15px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={moodboard.isSearching || !input.trim()}
            className={cn(
              'px-3 py-2 rounded-md text-[15px] font-medium transition-all shrink-0',
              moodboard.isSearching || !input.trim()
                ? 'bg-accent/20 text-accent/40 cursor-not-allowed'
                : 'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 active:scale-95'
            )}
          >
            {moodboard.isSearching
              ? <Loader2 size={12} className="animate-spin" />
              : '搜索'
            }
          </button>
        </div>

        {/* 搜索状态提示 */}
        {moodboard.isSearching && (
          <p className="text-[14px] text-neutral-600 mt-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-generate animate-pulse" />
            正在获取参考图，稍候...
          </p>
        )}
        {moodboard.searchQuery && !moodboard.isSearching && (
          <p className="text-[14px] text-neutral-600 mt-1.5">
            「{moodboard.searchQuery}」· 图片已散落在画布上
          </p>
        )}
      </div>

      {/* 快捷标签 */}
      <div className="px-3 pb-3 shrink-0">
        <p className="text-[14px] text-neutral-600 mb-2">快捷搜索</p>
        <div className="flex flex-wrap gap-1">
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => { setInput(tag); handleSearch(tag) }}
              disabled={moodboard.isSearching}
              className="text-[14px] px-2 py-0.5 rounded-full border border-line text-neutral-500 hover:border-violet-600/60 hover:text-violet-400 hover:bg-violet-900/10 transition-colors disabled:opacity-40"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="flex-1 flex flex-col justify-end px-3 pb-4">
        <div className="rounded-lg border border-line bg-canvas-800/50 p-3 space-y-2">
          <p className="text-[14px] font-mono text-neutral-600 uppercase tracking-wider">操作说明</p>
          <div className="space-y-1.5">
            {[
              ['01', '搜索关键词，图片散落画布'],
              ['02', '在画布框选有感觉的图片'],
              ['03', '点击「✨ 提炼核心资产」'],
              ['04', '右侧切换为素材库模式'],
            ].map(([num, desc]) => (
              <div key={num} className="flex items-start gap-2">
                <span className="text-[15px] font-mono text-neutral-700 w-4 shrink-0 mt-0.5">{num}</span>
                <span className="text-[14px] text-neutral-600">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
