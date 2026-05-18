import { useDraggable } from '@dnd-kit/core'
import { Sparkles, Link2, FileText, Globe, Pin, ImageIcon, LayoutGrid } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'
import { placeholderUrl } from '../../store/useIPStore'

// ── 灵感发散：图片瀑布流（kgVisual / reference 节点） ─────
const ASSOCIATED_SEEDS = [
  ['arch2','brutalist1','concrete1','metal2'],
  ['neon1','cyber1','glass1','abstract1'],
  ['sculpture1','bridge1','forest1','texture1'],
]

function DraggableImage({ seed, label, index }) {
  const url = placeholderUrl(seed, 240, 180)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drawer-img-${seed}-${index}`,
    data: { type: 'drawerImage', imageUrl: url, label, seed },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group',
        'border border-line hover:border-neutral-600 transition-all',
        isDragging && 'opacity-40 scale-95 ring-1 ring-accent'
      )}
    >
      <div className="aspect-[4/3] bg-canvas-800 overflow-hidden">
        <img
          src={url} alt={label} draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[15px] text-white truncate">{label}</p>
        <p className="text-[14px] text-neutral-400">拖入画布</p>
      </div>
    </div>
  )
}

function VisualInspirationPanel({ node }) {
  const seeds = ASSOCIATED_SEEDS[Math.floor(Math.random() * ASSOCIATED_SEEDS.length)]
  const labels = ['关联参考', '材质变体', '形态衍生', '氛围延伸']

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-3 pt-3 pb-2 border-b border-line shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={12} className="text-violet-400" />
          <p className="text-[14px] font-semibold text-neutral-100">✨ 灵感发散</p>
        </div>
        <p className="text-[14px] text-neutral-600">Associated Visions</p>
      </div>

      {/* 当前节点预览 */}
      <div className="mx-3 mt-2.5 rounded-lg overflow-hidden border border-line/50 shrink-0">
        <img src={node.data.imageUrl} alt={node.data.label}
          className="w-full aspect-video object-cover" />
        <div className="px-2 py-1.5 bg-canvas-800/80">
          <p className="text-[14px] font-medium text-neutral-300">{node.data.label}</p>
          <p className="text-[15px] text-neutral-600">当前选中 · 视觉节点</p>
        </div>
      </div>

      {/* 说明 */}
      <div className="mx-3 mt-2 mb-1.5 shrink-0">
        <p className="text-[15px] text-neutral-600">AI 联想的相关视觉，拖拽到画布生成新节点</p>
      </div>

      {/* 2列瀑布流 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {seeds.map((seed, i) => (
            <DraggableImage key={seed} seed={seed} label={labels[i % labels.length]} index={i} />
          ))}
          {/* 补充更多图 */}
          {['factory1', 'steel1', 'rust1', 'indust1'].map((seed, i) => (
            <DraggableImage key={`ext-${seed}`} seed={seed} label={['工业肌理','金属质感','锈蚀美学','构架细节'][i]} index={i + 4} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 信息溯源：文字洞察节点（kgText） ─────────────────────
const SOURCE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-400',    bg: 'bg-red-900/15',    label: 'PDF'  },
  doc: { icon: FileText, color: 'text-blue-400',   bg: 'bg-blue-900/15',   label: 'DOC'  },
  ppt: { icon: FileText, color: 'text-orange-400', bg: 'bg-orange-900/15', label: 'PPT'  },
  web: { icon: Globe,    color: 'text-green-400',  bg: 'bg-green-900/15',  label: 'WEB'  },
}

function TextSourcePanel({ node }) {
  const d = node.data
  const src = SOURCE_ICONS[d.source] ?? SOURCE_ICONS.pdf
  const SrcIcon = src.icon

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-3 pt-3 pb-2 border-b border-line shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={12} className="text-cyan-400" />
          <p className="text-[14px] font-semibold text-neutral-100">🔗 信息溯源</p>
        </div>
        <p className="text-[14px] text-neutral-600">Source & Context</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {/* 洞察标题 */}
        <div className="rounded-lg border border-line/50 bg-neutral-900/60 backdrop-blur-sm p-3">
          <p className="text-[14px] font-semibold text-neutral-100 leading-snug">{d.label}</p>
        </div>

        {/* 来源信息 */}
        <div className={cn('rounded-lg border p-3 space-y-2', src.bg, 'border-line/40')}>
          <div className="flex items-center gap-2">
            <SrcIcon size={12} className={src.color} />
            <span className={cn('text-[14px] font-mono font-bold', src.color)}>{src.label}</span>
            {d.fileName && (
              <span className="text-[14px] text-neutral-400 truncate flex-1">{d.fileName}</span>
            )}
          </div>
          {d.page > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] text-neutral-600">第</span>
              <span className="text-[15px] font-mono font-bold text-neutral-300">{d.page}</span>
              <span className="text-[15px] text-neutral-600">页</span>
            </div>
          )}
          {d.url && (
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[14px] text-green-400 hover:text-green-300 transition-colors"
            >
              <Globe size={10} />
              <span className="truncate">{d.url}</span>
            </a>
          )}
        </div>

        {/* 原文摘录 */}
        {d.detail && (
          <div className="rounded-lg border border-line/50 bg-neutral-900/40 backdrop-blur-sm p-3">
            <p className="text-[15px] font-mono text-neutral-600 uppercase tracking-wider mb-1.5">原文摘录</p>
            <p className="text-[15px] text-neutral-400 leading-relaxed">{d.detail}</p>
          </div>
        )}

        {/* 快捷操作 */}
        <div className="flex gap-1.5">
          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[14px] text-neutral-400 hover:text-neutral-200 transition-colors border border-line/50">
            <Pin size={10} />
            锁定此洞察
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[14px] text-neutral-400 hover:text-neutral-200 transition-colors border border-line/50">
            <Sparkles size={10} />
            深度发散
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Root 节点信息面板 ──────────────────────────────────────
function RootInfoPanel({ node }) {
  const d = node.data
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 border-b border-line shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid size={12} className="text-accent" />
          <p className="text-[14px] font-semibold text-neutral-100">知识树根节点</p>
        </div>
        <p className="text-[14px] text-neutral-600">Knowledge Root</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-[15px] font-bold text-neutral-100">{d.label}</p>
          {d.query && <p className="text-[14px] text-neutral-500 mt-0.5">关键词：{d.query}</p>}
          {d.fileCount > 0 && <p className="text-[14px] text-neutral-500">{d.fileCount} 个文件解析</p>}
        </div>
        <p className="text-[14px] text-neutral-600 leading-relaxed">
          这是知识图谱的根节点。点击图谱中的文字洞察节点查看信息溯源，点击视觉节点获取灵感发散联想。
        </p>
      </div>
    </div>
  )
}

// ── 空状态 ────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 gap-4">
      <div className="w-10 h-10 rounded-xl bg-neutral-700/40 border border-neutral-500 flex items-center justify-center">
        <ImageIcon size={16} className="text-neutral-400" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[14px] font-medium text-neutral-300">Inspector</p>
        <p className="text-[14px] text-neutral-500 leading-relaxed">
          点击画布中的节点<br />查看详情与关联内容
        </p>
      </div>
      <div className="w-full rounded-lg border border-dashed border-neutral-500 p-3 space-y-1.5">
        <p className="text-[15px] font-mono text-neutral-500 uppercase tracking-wider">选中节点后可查看</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span className="text-[15px] text-neutral-700">视觉节点 → 灵感发散</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
          <span className="text-[15px] text-neutral-700">文字节点 → 信息溯源</span>
        </div>
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────
export default function RightContextDrawer() {
  const { selectedNode } = useIPStore()

  return (
    <div className="h-full flex flex-col bg-canvas-900 border-l border-line overflow-hidden">
      {!selectedNode && <EmptyState />}
      {selectedNode?.type === 'kgVisual'   && <VisualInspirationPanel node={selectedNode} />}
      {selectedNode?.type === 'reference'  && <VisualInspirationPanel node={selectedNode} />}
      {selectedNode?.type === 'kgText'     && <TextSourcePanel node={selectedNode} />}
      {selectedNode?.type === 'kgRoot'     && <RootInfoPanel node={selectedNode} />}
    </div>
  )
}
