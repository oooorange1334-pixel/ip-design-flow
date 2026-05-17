import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Sparkles, FileText } from 'lucide-react'

export default memo(function KGRootNode({ data, selected }) {
  return (
    <div
      className={`
        rounded-2xl border-2 bg-canvas-800/80 backdrop-blur-sm shadow-2xl
        transition-all duration-150 overflow-hidden
        ${selected
          ? 'border-accent shadow-accent/20'
          : 'border-neutral-600 hover:border-neutral-500'
        }
      `}
      style={{ width: 200 }}
    >
      <div className="px-4 py-3 flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
          <Sparkles size={16} className="text-accent" />
        </div>
        <p className="text-[13px] font-bold text-neutral-100 text-center leading-tight">
          {data.label}
        </p>
        {data.query && (
          <p className="text-[10px] text-neutral-500 text-center">{data.query}</p>
        )}
        {data.fileCount > 0 && (
          <div className="flex items-center gap-1 text-[9px] text-neutral-600">
            <FileText size={9} />
            <span>{data.fileCount} 个文件</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500" />
    </div>
  )
})
