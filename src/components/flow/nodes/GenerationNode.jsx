import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Pin, PinOff, RefreshCw, Bookmark, Loader2, Columns3 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useProject from '../../../store/useProject'
import { generateTripleViewSet } from '../../../lib/api/mockGenerate'

const STEP_COLORS = {
  0: 'text-violet-400 border-violet-800/50',
  1: 'text-blue-400 border-blue-800/50',
  2: 'text-cyan-400 border-cyan-800/50',
  3: 'text-emerald-400 border-emerald-800/50',
  4: 'text-orange-400 border-orange-800/50',
  5: 'text-pink-400 border-pink-800/50',
}

const STEP_LABELS = ['灵感', '元素', '三视图', '动作', '场景', '文创']

export default memo(function GenerationNode({ id, data, selected }) {
  const { lockElement, unlockElement, lockedElements, updateRFNodeData, addRFNode, rfNodes, ipContext } = useProject()
  const [hovered, setHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [generatingTriple, setGeneratingTriple] = useState(false)

  async function handleGenerateTripleView() {
    if (!data.imageUrl || generatingTriple) return
    setGeneratingTriple(true)

    const tvNodeId = `tv-${Date.now()}`
    const col = rfNodes.length % 2
    const baseNode = rfNodes.find((n) => n.id === id)
    const posX = baseNode ? baseNode.position.x + 260 : 60 + col * 700
    const posY = baseNode ? baseNode.position.y : 60

    addRFNode({
      id: tvNodeId,
      type: 'tripleview',
      position: { x: posX, y: posY },
      data: {
        isGenerating: true,
        referenceLabel: data.label ?? '灵感草图',
        images: {},
        seed: null,
      },
    })

    try {
      const result = await generateTripleViewSet(data.imageUrl, ipContext, lockedElements)
      updateRFNodeData(tvNodeId, {
        isGenerating: false,
        images: { front: result.front, side: result.side, back: result.back },
        seed: result.seed,
      })
    } catch {
      updateRFNodeData(tvNodeId, { isGenerating: false })
    } finally {
      setGeneratingTriple(false)
    }
  }

  const stepColor = STEP_COLORS[data.step ?? 0] ?? STEP_COLORS[0]
  const stepLabel = STEP_LABELS[data.step ?? 0]

  const isPinned = lockedElements.some((e) => e.id === `node-feature-${id}`)

  function handlePin() {
    if (isPinned) {
      unlockElement(`node-feature-${id}`)
    } else {
      lockElement({
        id: `node-feature-${id}`,
        label: `${stepLabel} #${id.slice(-4)}`,
        prompt: data.featurePrompt ?? data.label ?? '',
      })
    }
  }

  return (
    <div
      className={cn(
        'w-[220px] rounded-lg border bg-canvas-800 shadow-xl transition-all duration-150 overflow-hidden',
        selected
          ? 'border-accent ring-1 ring-accent/40 shadow-accent/20'
          : 'border-line/60 hover:border-neutral-600',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 输入手柄（顶部） */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-accent transition-colors"
      />

      {/* 顶部标签栏 */}
      <div className={cn('flex items-center justify-between px-2.5 py-1.5 border-b border-line/60')}>
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[14px] font-mono font-medium', stepColor.split(' ')[0])}>
            {String((data.step ?? 0) + 1).padStart(2, '0')}
          </span>
          <span className="text-[14px] text-neutral-400">{data.label ?? stepLabel}</span>
        </div>
        {/* Pin 按钮 — 悬浮时出现 */}
        <button
          onClick={handlePin}
          className={cn(
            'w-5 h-5 rounded flex items-center justify-center transition-all',
            isPinned
              ? 'text-locked bg-locked/10 opacity-100'
              : hovered
                ? 'text-neutral-400 hover:text-locked hover:bg-locked/10 opacity-100'
                : 'opacity-0',
          )}
          title={isPinned ? '解除锁定' : '锁定此特征'}
        >
          {isPinned ? <Pin size={10} /> : <PinOff size={10} />}
        </button>
      </div>

      {/* 图片区 */}
      <div className="relative w-full aspect-square bg-canvas-900">
        {data.isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {/* 骨架动画 */}
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-canvas-800 to-canvas-900 animate-pulse" />
            <Loader2 size={18} className="text-accent animate-spin relative z-10" />
            <span className="text-[14px] text-neutral-600 relative z-10 font-mono">生成中...</span>
          </div>
        ) : data.imageUrl ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-canvas-900 animate-pulse" />
            )}
            <img
              src={data.imageUrl}
              alt={data.label}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-neutral-700">无图像</span>
          </div>
        )}

        {/* 种子号浮层 */}
        {data.seed && !data.isGenerating && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded px-1.5 py-0.5">
            <span className="text-[15px] font-mono text-neutral-500">#{data.seed}</span>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-line/60">
        <button
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[14px] text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
          title="重新生成"
          disabled={data.isGenerating}
        >
          <RefreshCw size={10} className={data.isGenerating ? 'animate-spin' : ''} />
          <span>重生成</span>
        </button>
        <div className="w-px h-3.5 bg-neutral-700" />
        {/* 三视图按钮 — 有图像时才显示 */}
        {data.imageUrl && !data.isGenerating && (
          <>
            <button
              onClick={handleGenerateTripleView}
              disabled={generatingTriple}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1 rounded text-[14px] transition-colors',
                generatingTriple
                  ? 'text-generate/50 cursor-not-allowed'
                  : 'text-neutral-500 hover:text-generate hover:bg-generate/10'
              )}
              title="生成三视图"
            >
              <Columns3 size={10} className={generatingTriple ? 'animate-pulse' : ''} />
              <span>三视图</span>
            </button>
            <div className="w-px h-3.5 bg-neutral-700" />
          </>
        )}
        <button
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[14px] text-neutral-500 hover:text-accent hover:bg-accent/10 transition-colors"
          title="设为基准图"
          disabled={data.isGenerating}
        >
          <Bookmark size={10} />
          <span>基准</span>
        </button>
      </div>

      {/* 输出手柄（底部） */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-accent transition-colors"
      />
    </div>
  )
})
