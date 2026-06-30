import { useRef, useState } from 'react'
import { Columns3, Sparkles, ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useProject from '../../../store/useProject'
import CMFSelector from '../../cmf/CMFSelector'
import { generateTripleViewSet } from '../../../lib/api/mockGenerate'

export default function Step03TripleView() {
  const {
    historyNodes, rfNodes, ipContext, lockedElements,
    isGenerating, setGenerating, addRFNode, updateRFNodeData,
  } = useProject()

  const [selectedRef, setSelectedRef] = useState('')
  const [generatingTriple, setGeneratingTriple] = useState(false)
  const abortRef = useRef()

  // 可作为基准的灵感图（step 0/1 生成节点）
  const refOptions = historyNodes.filter((n) => n.imageUrl && (n.step === 0 || n.step === 1))

  async function handleGenerate() {
    if (generatingTriple) return
    const refNode = refOptions.find((n) => n.id === selectedRef) ?? refOptions[0]
    const referenceUrl = refNode?.imageUrl ?? null

    setGeneratingTriple(true)
    abortRef.current = new AbortController()

    const tvNodeId = `tv-step3-${Date.now()}`
    const existing = rfNodes.filter((n) => n.type === 'tripleview').length
    addRFNode({
      id: tvNodeId,
      type: 'tripleview',
      position: { x: 60 + existing * 700, y: 400 },
      data: {
        isGenerating: true,
        referenceLabel: refNode?.params?.personality ?? '基准图',
        images: {},
        seed: null,
      },
    })

    try {
      const result = await generateTripleViewSet(referenceUrl, ipContext, lockedElements, abortRef.current.signal)
      updateRFNodeData(tvNodeId, {
        isGenerating: false,
        images: { front: result.front, side: result.side, back: result.back },
        seed: result.seed,
      })
    } catch (e) {
      if (e.name !== 'AbortError') updateRFNodeData(tvNodeId, { isGenerating: false })
    } finally {
      setGeneratingTriple(false)
    }
  }

  return (
    <div className="space-y-4 py-1">
      {/* 基准图选择 */}
      <div>
        <p className="text-[14px] text-neutral-500 mb-1.5">基准图来源</p>
        {refOptions.length === 0 ? (
          <p className="text-[14px] text-neutral-700 italic">
            请先在「灵感调研」步骤生成图像
          </p>
        ) : (
          <div className="relative">
            <select
              value={selectedRef}
              onChange={(e) => setSelectedRef(e.target.value)}
              className="w-full appearance-none bg-canvas-800 border border-line rounded px-2 py-1.5 text-[15px] text-neutral-200 focus:outline-none focus:border-accent transition-colors pr-6"
            >
              <option value="">自动选最新</option>
              {refOptions.map((n) => (
                <option key={n.id} value={n.id}>
                  灵感 #{n.id.slice(-5)} · {n.params?.personality?.slice(0, 12) ?? '无描述'}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
          </div>
        )}
      </div>

      {/* CMF 材质选择器 */}
      <div className="divider-t pt-4">
        <p className="text-[14px] text-neutral-400 mb-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-cyan-500 inline-block" />
          CMF 规范
        </p>
        <CMFSelector />
      </div>

      {/* 生成按钮 — 全局重心 CTA */}
      <button
        onClick={handleGenerate}
        disabled={generatingTriple || refOptions.length === 0}
        className={cn(
          'cta-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold',
          (generatingTriple || refOptions.length === 0) && 'opacity-65'
        )}
      >
        <Columns3 size={14} className={generatingTriple ? 'animate-pulse' : ''} />
        {generatingTriple ? '生成三视图中...' : '生成正·侧·背三视图'}
      </button>

      {generatingTriple && (
        <p className="text-[14px] text-neutral-500 text-center">
          三个视角并行渲染中，请稍候...
        </p>
      )}
    </div>
  )
}
