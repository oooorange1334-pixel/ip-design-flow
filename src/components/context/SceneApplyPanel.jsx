import { Layers, Wand2, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'

// 场景应用模板（占位）
const SCENE_TEMPLATES = [
  { id: 'cafe',    label: '咖啡馆场景',   tag: 'cafe,interior,cozy',        thumb: 'cafe,interior' },
  { id: 'street',  label: '城市街景',     tag: 'city,street,night',         thumb: 'city,street' },
  { id: 'studio',  label: '产品摄影棚',   tag: 'studio,product,minimal',    thumb: 'studio,product' },
  { id: 'nature',  label: '自然户外',     tag: 'forest,nature,sunlight',    thumb: 'forest,nature' },
  { id: 'tech',    label: '科技展厅',     tag: 'futuristic,showroom,neon',  thumb: 'futuristic,showroom' },
  { id: 'festival',label: '节日氛围',     tag: 'festival,celebration,light',thumb: 'festival,light' },
]

export default function SceneApplyPanel() {
  const { selectedNode, isGenerating, generateSceneApplication } = useProject()

  // 仅当选中场景形象占位图时可应用
  const valid = selectedNode?.type === 'assetImage' && selectedNode?.data?.demoStep === 5 && !selectedNode?.data?.sceneApplied

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-4 pt-4 pb-3 divider-x shrink-0 flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-soft shadow-neon-purple-sm">
          <Layers size={11} className="text-accent" />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-neutral-100">场景融合</p>
          <p className="text-[12px] text-neutral-500">选中形象 → 选场景 → 一键生成</p>
        </div>
      </div>

      {!valid ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4">
          <span className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center shadow-neon-purple-sm">
            <ImageIcon size={16} className="text-accent" />
          </span>
          <p className="text-[13px] text-neutral-400 leading-relaxed">
            点击中间画布的<br />任意 IP 形象占位图<br />再选择要套用的场景模板
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {/* 当前选中形象预览 */}
          <div className="rounded-xl glass-card overflow-hidden">
            <img src={selectedNode.data.imageUrl} alt={selectedNode.data.label}
              className="w-full object-cover" style={{ maxHeight: 150 }} />
            <div className="px-2.5 py-2">
              <p className="text-[12px] text-neutral-300">当前形象</p>
              <p className="text-[13px] font-medium text-neutral-100 truncate">{selectedNode.data.label}</p>
            </div>
          </div>

          {/* 场景模板网格 */}
          <div>
            <p className="text-[12px] text-neutral-500 mb-2">选择场景应用模板</p>
            <div className="grid grid-cols-2 gap-2">
              {SCENE_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  disabled={isGenerating}
                  onClick={() => generateSceneApplication(selectedNode, tpl)}
                  className={cn(
                    'group relative rounded-lg overflow-hidden glass-card glass-card-hover text-left transition-all',
                    isGenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="aspect-[4/3] bg-black/30 overflow-hidden">
                    <img src={`https://loremflickr.com/200/150/${tpl.thumb}?lock=${tpl.id.length * 7}`}
                      alt={tpl.label} draggable={false}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                    <span className="text-[12px] text-neutral-200 truncate">{tpl.label}</span>
                    <Wand2 size={11} className="text-accent shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-neutral-400">
              <Loader2 size={14} className="animate-spin text-accent" />
              正在融合场景，请稍候...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
