import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { FileText, FileType, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../../../lib/utils'

const SOURCE_ICONS = {
  pdf: { Icon: FileText,  color: 'text-red-400',    label: 'PDF'  },
  doc: { Icon: FileType,  color: 'text-blue-400',   label: 'DOC'  },
  ppt: { Icon: FileText,  color: 'text-orange-400', label: 'PPT'  },
  web: { Icon: FileText,  color: 'text-green-400',  label: 'WEB'  },
}

export default memo(function KGTextNode({ data, selected }) {
  const [expanded, setExpanded] = useState(false)
  const src = SOURCE_ICONS[data.source] ?? SOURCE_ICONS.pdf
  const Icon = src.Icon

  return (
    <div
      className={cn(
        'rounded-xl border bg-neutral-900/60 backdrop-blur-md shadow-lg transition-all duration-150',
        selected
          ? 'border-violet-500/60 shadow-violet-900/20'
          : 'border-neutral-700/50 hover:border-neutral-600/60'
      )}
      style={{ width: 240 }}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500" />

      <div className="p-3">
        {/* 来源标签 */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className={cn('flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-800', src.color)}>
            <Icon size={9} />
            <span>{src.label}</span>
          </div>
          <span className="text-[9px] text-neutral-600">文本洞察</span>
        </div>

        {/* 主标题 */}
        <p className="text-[11px] font-semibold text-neutral-100 leading-snug mb-1.5">
          {data.label}
        </p>

        {/* 展开详情 */}
        {data.detail && (
          <>
            {expanded && (
              <p className="text-[10px] text-neutral-500 leading-relaxed mb-1.5">
                {data.detail}
              </p>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-0.5 text-[9px] text-neutral-700 hover:text-neutral-500 transition-colors"
            >
              {expanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              {expanded ? '收起' : '展开详情'}
            </button>
          </>
        )}
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2 !h-2 !bg-neutral-600 !border-neutral-500" />
    </div>
  )
})
