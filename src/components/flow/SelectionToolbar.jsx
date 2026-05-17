import { Panel } from 'reactflow'
import { Sparkles, Wand2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'

export default function SelectionToolbar({ selectedIds }) {
  const { rfNodes, workflowPhase, extractAssets, generateFromSelection, isGenerating } = useIPStore()

  const selectedNodes = rfNodes.filter(n => selectedIds.includes(n.id))
  const hasRef   = selectedNodes.some(n => n.type === 'reference')
  const hasParam = selectedNodes.some(n => n.type === 'parameter')

  // Phase 2：可提炼（选中了参考图）
  const canExtract = hasRef && workflowPhase === 'moodboard'
  // Phase 3：可生成（选中了参数节点）
  const canGenerate = hasParam && (workflowPhase === 'library' || workflowPhase === 'composing')

  if (!canExtract && !canGenerate) return null

  return (
    <Panel position="bottom-center" className="mb-6">
      <div className="flex items-center gap-2 bg-canvas-900/95 backdrop-blur border border-neutral-700 rounded-xl px-3 py-2 shadow-2xl shadow-black/40">
        <span className="text-[10px] text-neutral-500 mr-1">
          {selectedIds.length} 已选中
        </span>

        {canExtract && (
          <button
            onClick={() => extractAssets(selectedIds)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium transition-all active:scale-95 shadow-md shadow-violet-900/40"
          >
            <Sparkles size={12} />
            ✨ 提炼核心资产
          </button>
        )}

        {canGenerate && (
          <button
            onClick={() => generateFromSelection(selectedIds)}
            disabled={isGenerating}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 shadow-md',
              isGenerating
                ? 'bg-accent/30 text-accent/50 cursor-not-allowed'
                : 'bg-accent hover:bg-accent-hover text-white shadow-accent/30'
            )}
          >
            <Wand2 size={12} className={isGenerating ? 'animate-pulse' : ''} />
            🚀 生成草图
          </button>
        )}
      </div>
    </Panel>
  )
}
