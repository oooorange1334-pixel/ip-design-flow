import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Loader2, ChevronDown, ChevronUp, Sparkles, Copy } from 'lucide-react'
import { cn } from '../../../lib/utils'

export default memo(function ResultNode({ data, selected }) {
  const [promptOpen, setPromptOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyPrompt() {
    navigator.clipboard.writeText(data.prompt ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-canvas-800 shadow-2xl overflow-hidden transition-all duration-100',
        selected
          ? 'border-accent ring-1 ring-accent/40 shadow-accent/20'
          : 'border-line/60 hover:border-neutral-600'
      )}
      style={{ width: 280 }}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-accent" />

      {/* 标题 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line/60 bg-canvas-900">
        <Sparkles size={11} className="text-accent" />
        <span className="text-[15px] font-semibold text-neutral-100">生成结果</span>
        {data.isGenerating && (
          <div className="ml-auto flex items-center gap-1 text-[14px] text-generate">
            <Loader2 size={10} className="animate-spin" />
            <span>渲染中</span>
          </div>
        )}
      </div>

      {/* 2×2 四宫格 */}
      <div className="grid grid-cols-2 gap-0.5 p-0.5 bg-neutral-800/40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative aspect-square bg-canvas-900 overflow-hidden">
            {data.isGenerating ? (
              <div className="absolute inset-0 bg-gradient-to-br from-canvas-800 to-canvas-900 animate-pulse flex items-center justify-center">
                <Loader2 size={14} className="text-neutral-700 animate-spin" style={{ animationDelay: `${i * 150}ms` }} />
              </div>
            ) : data.images?.[i] ? (
              <img
                src={data.images[i]}
                alt={`result-${i}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[15px] text-neutral-700">—</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prompt 折叠面板 */}
      <div className="border-t border-line/60">
        <button
          onClick={() => setPromptOpen(!promptOpen)}
          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-800/40 transition-colors"
        >
          <span className="text-[14px] text-neutral-500 font-mono">Prompt</span>
          {promptOpen ? <ChevronUp size={10} className="text-neutral-600" /> : <ChevronDown size={10} className="text-neutral-600" />}
        </button>

        {promptOpen && (
          <div className="px-3 pb-3">
            <div className="relative bg-canvas-950 rounded p-2 border border-line">
              <p className="text-[15px] font-mono text-neutral-500 leading-relaxed break-all pr-5">
                {data.prompt ?? '—'}
              </p>
              <button
                onClick={copyPrompt}
                className="absolute top-1.5 right-1.5 text-neutral-700 hover:text-neutral-400 transition-colors"
                title="复制"
              >
                <Copy size={9} />
              </button>
              {copied && (
                <span className="absolute top-1 right-6 text-[15px] text-generate">已复制</span>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-accent" />
    </div>
  )
})
