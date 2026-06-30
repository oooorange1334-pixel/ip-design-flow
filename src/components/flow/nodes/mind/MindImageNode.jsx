import { memo, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Plus, X, MessageSquarePlus } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import useIPStore from '../../../../store/useIPStore'

// 思维导图图片素材节点：从右侧拖入或 AI 生成，可加子节点、删除、加入对话
export default memo(function MindImageNode({ id, data, selected }) {
  const { addChildNode, deleteRFNode, addChatRef } = useIPStore()
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden transition-all duration-150 backdrop-blur-md',
        selected ? 'neon-ring' : ''
      )}
      style={{
        width: 168,
        border: selected ? undefined : '1px solid rgba(255,255,255,0.10)',
        boxShadow: selected ? undefined : '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-neon-cyan !border-0" />

      <div className="relative bg-black/40" style={{ height: 112 }}>
        {!loaded && <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(28,33,46,0.6)' }} />}
        <img
          src={data.imageUrl}
          alt={data.label}
          onLoad={() => setLoaded(true)}
          draggable={false}
          className={cn('w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
        />
      </div>
      <div className="px-2.5 py-1.5" style={{ background: 'rgba(20,24,34,0.92)' }}>
        <p className="text-[13px] font-medium text-neutral-200 truncate">{data.label}</p>
      </div>

      {/* 悬浮操作 */}
      <div className={cn(
        'absolute top-1.5 right-1.5 flex gap-1 transition-opacity',
        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        <button
          title="加入 AI 对话参考"
          onClick={(e) => { e.stopPropagation(); addChatRef({ id, type: 'mindImage', data: { label: data.label, imageUrl: data.imageUrl } }) }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
          style={{ background: '#22D3EE' }}
        >
          <MessageSquarePlus size={11} />
        </button>
        <button
          title="新增子节点"
          onClick={(e) => { e.stopPropagation(); addChildNode(id) }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
          style={{ background: 'linear-gradient(90deg,#7C4DFF,#5E35B1)' }}
        >
          <Plus size={11} />
        </button>
        <button
          title="删除节点"
          onClick={(e) => { e.stopPropagation(); deleteRFNode(id) }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-neutral-200 bg-black/60 hover:bg-red-600 hover:text-white shadow-md transition-colors"
        >
          <X size={11} />
        </button>
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-neon-cyan !border-0" />
    </div>
  )
})
