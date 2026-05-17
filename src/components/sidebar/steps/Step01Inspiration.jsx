import { useRef, useState } from 'react'
import { Upload, Sparkles, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import useIPStore from '../../../store/useIPStore'
import { generateConcept } from '../../../lib/api/mockGenerate'

const STYLE_TAGS = [
  '赛博朋克', '有机形态', '极简几何', '蒸汽朋克',
  '生物机械', '国潮风格', '未来主义', '扁平插画',
]

export default function Step01Inspiration() {
  const { ipContext, lockedElements, isGenerating, setGenerating, addHistoryNode, addRFNode, rfNodes } = useIPStore()
  const [selectedStyles, setSelectedStyles] = useState([])
  const [refImage, setRefImage] = useState(null)
  const [refImageUrl, setRefImageUrl] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const abortRef = useRef()

  function toggleStyle(tag) {
    setSelectedStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleFileChange(file) {
    if (!file || !file.type.startsWith('image/')) return
    setRefImage(file)
    setRefImageUrl(URL.createObjectURL(file))
  }

  function clearRefImage() {
    setRefImage(null)
    if (refImageUrl) URL.revokeObjectURL(refImageUrl)
    setRefImageUrl(null)
  }

  async function handleGenerate() {
    if (isGenerating) return
    abortRef.current = new AbortController()
    setGenerating(true)

    // 先插入骨架节点到画布
    const nodeId = `gen-${Date.now()}`
    const col = rfNodes.length % 3
    const row = Math.floor(rfNodes.length / 3)

    addRFNode({
      id: nodeId,
      type: 'generation',
      position: { x: 60 + col * 260, y: 60 + row * 300 },
      data: {
        isGenerating: true,
        step: 0,
        label: '灵感草图',
        imageUrl: null,
        seed: null,
        featurePrompt: `${ipContext.personality} ${selectedStyles.join(' ')}`.trim(),
      },
    })

    try {
      const contextWithStyles = {
        ...ipContext,
        personality: [ipContext.personality, ...selectedStyles].filter(Boolean).join(', '),
      }
      const result = await generateConcept(contextWithStyles, lockedElements, abortRef.current.signal)

      // 更新节点数据（替换骨架）
      useIPStore.getState().updateRFNodeData(nodeId, {
        isGenerating: false,
        imageUrl: result.imageUrl,
        seed: result.seed,
      })

      addHistoryNode({
        id: nodeId,
        imageUrl: result.imageUrl,
        seed: result.seed,
        step: 0,
        params: contextWithStyles,
      })
    } catch (e) {
      if (e.name !== 'AbortError') {
        useIPStore.getState().updateRFNodeData(nodeId, { isGenerating: false, imageUrl: null })
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4 py-1">
      {/* 参考图上传 */}
      <div>
        <p className="text-[10px] text-neutral-500 mb-1.5">参考图 / Moodboard</p>
        {refImageUrl ? (
          <div className="relative rounded-md overflow-hidden border border-neutral-700">
            <img src={refImageUrl} alt="参考图" className="w-full h-28 object-cover" />
            <button
              onClick={clearRefImage}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-neutral-300 hover:text-white"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFileChange(e.dataTransfer.files[0])
            }}
            className={cn(
              'border border-dashed rounded-md h-20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors',
              dragOver
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-neutral-700 hover:border-neutral-600 text-neutral-600 hover:text-neutral-500'
            )}
          >
            <Upload size={14} />
            <span className="text-[10px]">拖拽或点击上传</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])} />
      </div>

      {/* 风格标签 */}
      <div>
        <p className="text-[10px] text-neutral-500 mb-1.5">风格标签</p>
        <div className="flex flex-wrap gap-1">
          {STYLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleStyle(tag)}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                selectedStyles.includes(tag)
                  ? 'bg-accent/15 border-accent/50 text-accent'
                  : 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-400'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all',
          isGenerating
            ? 'bg-accent/20 text-accent/50 cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 active:scale-[0.98]'
        )}
      >
        <Sparkles size={12} className={isGenerating ? 'animate-pulse' : ''} />
        {isGenerating ? '生成中...' : '生成灵感草图'}
      </button>
    </div>
  )
}
