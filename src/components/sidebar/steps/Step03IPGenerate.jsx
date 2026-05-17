import { Sparkles, Wand2, Loader2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'

export default function Step03IPGenerate() {
  const { rfNodes, generateFromSelection, isGenerating } = useIPStore()

  const selectedParamIds = rfNodes
    .filter(n => n.type === 'parameter' && n.selected)
    .map(n => n.id)
  const canGenerate = selectedParamIds.length >= 1

  return (
    <div className="space-y-4 py-1">
      <p className="text-[10px] text-neutral-600">
        在画布上框选素材参数节点，点击「生成草图」，结果将以节点形式出现在画布上。
      </p>

      <button
        onClick={() => generateFromSelection(selectedParamIds)}
        disabled={!canGenerate || isGenerating}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[11px] font-medium transition-all',
          canGenerate && !isGenerating
            ? 'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 active:scale-[0.98]'
            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
        )}
      >
        {isGenerating
          ? <><Loader2 size={12} className="animate-spin" />生成中...</>
          : <><Wand2 size={12} />
            {canGenerate
              ? `🚀 生成草图（${selectedParamIds.length} 个节点）`
              : '先在画布框选素材节点'}
          </>
        }
      </button>

      <div className="rounded-lg border border-neutral-800 bg-canvas-800/30 p-2.5 space-y-1.5">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-1">操作说明</p>
        {[
          ['01', '从 Step 02 素材库拖拽卡片到画布'],
          ['02', '框选若干参数节点'],
          ['03', '点击「生成草图」'],
          ['04', '画布右侧延伸出结果节点（2×2）'],
        ].map(([num, desc]) => (
          <div key={num} className="flex items-start gap-2">
            <span className="text-[9px] font-mono text-neutral-700 shrink-0 mt-0.5">{num}</span>
            <span className="text-[10px] text-neutral-600">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
