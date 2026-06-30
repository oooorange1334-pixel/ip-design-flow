import { useDraggable } from '@dnd-kit/core'
import { Sparkles, Link2, FileText, Globe, Pin, ImageIcon, LayoutGrid } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'
import useProject from '../../store/useProject'
import { placeholderUrl } from '../../store/useIPStore'
import SearchPanel from '../drawer/SearchPanel'
import GenerateChatPanel from './GenerateChatPanel'
import SceneApplyPanel from './SceneApplyPanel'

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
        'relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing group',
        'glass-card glass-card-hover transition-all',
        isDragging && 'opacity-40 scale-95 neon-ring'
      )}
    >
      <div className="aspect-[4/3] bg-black/30 overflow-hidden">
        <img
          src={url} alt={label} draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[15px] text-white truncate">{label}</p>
        <p className="text-[14px] text-neon-cyan">拖入画布</p>
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
      <div className="px-3 pt-3 pb-2.5 border-b border-glass-edge shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-soft shadow-neon-purple-sm">
            <Sparkles size={11} className="text-accent" />
          </span>
          <p className="text-[14px] font-semibold text-neutral-100">灵感发散</p>
        </div>
        <p className="text-[14px] text-neutral-500 pl-7">Associated Visions</p>
      </div>

      {/* 当前节点预览 */}
      <div className="mx-3 mt-3 rounded-xl overflow-hidden glass-card shrink-0">
        <img src={node.data.imageUrl} alt={node.data.label}
          className="w-full aspect-video object-cover" />
        <div className="px-2.5 py-2 bg-black/30">
          <p className="text-[14px] font-medium text-neutral-200">{node.data.label}</p>
          <p className="text-[14px] text-accent">当前选中 · 视觉节点</p>
        </div>
      </div>

      {/* 说明 */}
      <div className="mx-3 mt-2.5 mb-1.5 shrink-0">
        <p className="text-[14px] text-neutral-500">AI 联想的相关视觉，拖拽到画布生成新节点</p>
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
      <div className="px-3 pt-3 pb-2.5 border-b border-glass-edge shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-neon-cyan/10 shadow-neon-cyan-sm">
            <Link2 size={11} className="text-neon-cyan" />
          </span>
          <p className="text-[14px] font-semibold text-neutral-100">信息溯源</p>
        </div>
        <p className="text-[14px] text-neutral-500 pl-7">Source & Context</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {/* 洞察标题 */}
        <div className="rounded-xl glass-card p-3">
          <p className="text-[14px] font-semibold text-neutral-100 leading-snug">{d.label}</p>
        </div>

        {/* 来源信息 */}
        <div className={cn('rounded-xl glass-card p-3 space-y-2')}>
          <div className="flex items-center gap-2">
            <SrcIcon size={12} className={src.color} />
            <span className={cn('text-[14px] font-mono font-bold', src.color)}>{src.label}</span>
            {d.fileName && (
              <span className="text-[14px] text-neutral-400 truncate flex-1">{d.fileName}</span>
            )}
          </div>
          {d.page > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] text-neutral-500">第</span>
              <span className="text-[15px] font-mono font-bold text-neutral-200">{d.page}</span>
              <span className="text-[15px] text-neutral-500">页</span>
            </div>
          )}
          {d.url && (
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[14px] text-neon-cyan hover:text-cyan-300 transition-colors"
            >
              <Globe size={10} />
              <span className="truncate">{d.url}</span>
            </a>
          )}
        </div>

        {/* 原文摘录 */}
        {d.detail && (
          <div className="rounded-xl glass-card p-3">
            <p className="text-[14px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5">原文摘录</p>
            <p className="text-[15px] text-neutral-300 leading-relaxed">{d.detail}</p>
          </div>
        )}

        {/* 快捷操作 */}
        <div className="flex gap-1.5">
          <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg glass-card glass-card-hover text-[14px] text-neutral-300 hover:text-accent transition-colors">
            <Pin size={10} />
            锁定此洞察
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg glass-card glass-card-hover text-[14px] text-neutral-300 hover:text-accent transition-colors">
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
      <div className="px-3 pt-3 pb-2.5 border-b border-glass-edge shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-soft shadow-neon-purple-sm">
            <LayoutGrid size={11} className="text-accent" />
          </span>
          <p className="text-[14px] font-semibold text-neutral-100">知识树根节点</p>
        </div>
        <p className="text-[14px] text-neutral-500 pl-7">Knowledge Root</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        <div className="rounded-xl glass-card p-3 neon-ring">
          <p className="text-[15px] font-bold text-neutral-100">{d.label}</p>
          {d.query && <p className="text-[14px] text-neutral-400 mt-0.5">关键词：{d.query}</p>}
          {d.fileCount > 0 && <p className="text-[14px] text-neutral-400">{d.fileCount} 个文件解析</p>}
        </div>
        <p className="text-[14px] text-neutral-500 leading-relaxed">
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
      <div className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center shadow-neon-purple-sm">
        <ImageIcon size={16} className="text-accent" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[14px] font-medium text-neutral-200">Inspector</p>
        <p className="text-[14px] text-neutral-500 leading-relaxed">
          点击画布中的节点<br />查看详情与关联内容
        </p>
      </div>
      <div className="w-full rounded-xl glass-card p-3 space-y-1.5">
        <p className="text-[14px] font-mono text-neutral-500 uppercase tracking-wider">选中节点后可查看</p>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-cyan-sm" />
          <span className="text-[14px] text-neutral-400">视觉节点 → 灵感发散</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-neon-purple-sm" />
          <span className="text-[14px] text-neutral-400">文字节点 → 信息溯源</span>
        </div>
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────
export default function RightContextDrawer() {
  const { selectedNode } = useIPStore()
  const { activeStep } = useProject()

  // 灵感调研（activeStep === 0）：右侧恢复为搜索素材面板，搜索后拖入画布。
  if (activeStep === 0) {
    return (
      <div className="h-full flex flex-col glass-panel border-0 divider-l overflow-hidden">
        <SearchPanel />
      </div>
    )
  }

  // 元素提取（activeStep === 1）：右侧为 AI 生成对话面板。
  // 选中画布节点加入对话参考，对话生成图片并落回画布。
  if (activeStep === 1) {
    return (
      <div className="h-full flex flex-col glass-panel border-0 divider-l overflow-hidden">
        <GenerateChatPanel />
      </div>
    )
  }

  // 场景融合（activeStep === 5）：右侧为场景应用面板，选中形象后套用场景模板生成。
  if (activeStep === 5) {
    return (
      <div className="h-full flex flex-col glass-panel border-0 divider-l overflow-hidden">
        <SceneApplyPanel />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col glass-panel border-0 divider-l overflow-hidden">
      {!selectedNode && <EmptyState />}
      {selectedNode?.type === 'kgVisual'   && <VisualInspirationPanel node={selectedNode} />}
      {selectedNode?.type === 'reference'  && <VisualInspirationPanel node={selectedNode} />}
      {selectedNode?.type === 'kgText'     && <TextSourcePanel node={selectedNode} />}
      {selectedNode?.type === 'kgRoot'     && <RootInfoPanel node={selectedNode} />}
    </div>
  )
}
