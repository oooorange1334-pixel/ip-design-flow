import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '../../../lib/utils'

// 通用占位图节点（三视图 / 动作矩阵 / 场景形象）：可选中，可作为生成来源
export default memo(function AssetImageNode({ data, selected }) {
  const [loaded, setLoaded] = useState(false)
  const w = data.w ?? 220
  const h = data.h ?? 220

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden transition-all duration-150 backdrop-blur-md',
        selected ? 'neon-ring' : ''
      )}
      style={{
        width: w,
        border: selected ? undefined : '1px solid rgba(255,255,255,0.10)',
        boxShadow: selected ? undefined : '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-accent !border-0 !opacity-60" />

      <div className="relative bg-black/40" style={{ height: h }}>
        {!loaded && <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(28,33,46,0.6)' }} />}
        <img
          src={data.imageUrl}
          alt={data.label}
          onLoad={() => setLoaded(true)}
          draggable={false}
          className={cn('w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
        />
        {data.sceneApplied && (
          <span className="absolute top-1.5 left-1.5 text-[11px] px-1.5 py-0.5 rounded-md text-white"
            style={{ background: 'linear-gradient(90deg,#7C4DFF,#5E35B1)' }}>
            场景生成
          </span>
        )}
      </div>
      <div className="px-2.5 py-1.5" style={{ background: 'rgba(20,24,34,0.92)' }}>
        <p className="text-[13px] font-medium text-neutral-200 truncate">{data.label}</p>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-accent !border-0 !opacity-60" />
    </div>
  )
})
