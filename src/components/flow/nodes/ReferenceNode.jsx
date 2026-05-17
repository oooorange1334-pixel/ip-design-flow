import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Image } from 'lucide-react'
import { cn } from '../../../lib/utils'

export default memo(function ReferenceNode({ data, selected }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden bg-canvas-800 shadow-lg transition-all duration-100',
        selected
          ? 'border-violet-500/70 ring-1 ring-violet-500/30 shadow-violet-900/30'
          : 'border-neutral-700/50 hover:border-neutral-600'
      )}
      style={{ width: 180 }}
    >
      {/* 图片 */}
      <div className="relative bg-canvas-900" style={{ height: 130 }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas-900 animate-pulse">
            <Image size={16} className="text-neutral-700" />
          </div>
        )}
        <img
          src={data.imageUrl}
          alt={data.label}
          className={cn('w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
        {selected && (
          <div className="absolute inset-0 bg-violet-500/10 border-2 border-violet-500/50 pointer-events-none" />
        )}
      </div>

      {/* 底部标签 */}
      <div className="px-2 py-1 bg-canvas-900/80">
        <p className="text-[9px] text-neutral-500 truncate">{data.label}</p>
      </div>

      <Handle type="source" position={Position.Bottom}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500 opacity-0 group-hover:opacity-100" />
    </div>
  )
})
