import { Sparkles } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'
import HybridInputZone from '../../input/HybridInputZone'

export default function Step01Inspiration() {
  const { rfNodes, extractAssets, workflowPhase } = useIPStore()

  // 画布上已选中的知识图谱节点（任意类型均可提炼）
  const selectedKGIds = rfNodes
    .filter(n => n.selected && (n.type?.startsWith('kg') || n.type === 'reference'))
    .map(n => n.id)

  const totalKGNodes = rfNodes.filter(n => n.type?.startsWith('kg') || n.type === 'reference').length
  const canExtract = selectedKGIds.length >= 1 && workflowPhase === 'moodboard'

  return (
    <div className="space-y-3 py-1">
      {/* 多模态混合输入区 */}
      <HybridInputZone />

      {/* 框选提炼按钮 */}
      {totalKGNodes > 0 && (
        <div className="border-t border-neutral-800 pt-3">
          <button
            onClick={() => extractAssets(selectedKGIds)}
            disabled={!canExtract}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-md text-[11px] font-medium transition-all',
              canExtract
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 active:scale-[0.98]'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            )}
          >
            <Sparkles size={12} />
            {canExtract
              ? `✨ 提炼核心资产（${selectedKGIds.length} 个节点）`
              : `在画布框选节点后提炼（共 ${totalKGNodes} 个）`
            }
          </button>
        </div>
      )}
    </div>
  )
}
