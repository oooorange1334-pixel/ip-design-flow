import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '../../../../lib/utils'

export default memo(function KGVisualNode({ data, selected }) {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden shadow-lg transition-all duration-150 group',
        selected
          ? 'border-cyan-500/60 shadow-cyan-900/20'
          : 'border-line/50 hover:border-neutral-600/60'
      )}
      style={{ width: 180 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500" />

      {/* 图片区 — 悬浮放大 */}
      <div className="relative overflow-hidden bg-canvas-900" style={{ height: 120 }}>
        {!loaded && (
          <div className="absolute inset-0 bg-canvas-800 animate-pulse" />
        )}
        <img
          src={data.imageUrl}
          alt={data.label}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300',
            hovered ? 'scale-110' : 'scale-100',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
        {/* 悬浮遮罩 */}
        <div className={cn(
          'absolute inset-0 bg-cyan-900/20 transition-opacity duration-200',
          hovered ? 'opacity-100' : 'opacity-0'
        )} />
      </div>

      {/* 标签 */}
      <div className="px-2.5 py-2 bg-canvas-900/80 backdrop-blur-sm">
        <p className="text-[14px] font-medium text-neutral-300 truncate">{data.label}</p>
        <p className="text-[15px] text-neutral-700 mt-0.5">视觉参考</p>
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500" />
    </div>
  )
})
