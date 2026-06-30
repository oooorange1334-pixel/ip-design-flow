import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { Plus, X, MessageSquarePlus } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import useIPStore from '../../../../store/useIPStore'

// 思维导图文本主题节点：双击编辑文字、加子节点、删除、加入对话
export default memo(function MindTextNode({ id, data, selected }) {
  const { updateRFNodeData, addChildNode, deleteRFNode, addChatRef } = useIPStore()
  const [editing, setEditing] = useState(!!data.editing)
  const [text, setText] = useState(data.label ?? '新主题')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function commit() {
    const val = text.trim() || '未命名'
    setText(val)
    setEditing(false)
    updateRFNodeData(id, { label: val, editing: false })
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl px-3.5 py-2 min-w-[120px] max-w-[220px] transition-all duration-150',
        'backdrop-blur-md',
        selected ? 'neon-ring' : ''
      )}
      style={{
        background: selected ? 'rgba(124,77,255,0.18)' : 'rgba(28,33,46,0.85)',
        border: selected ? undefined : '1px solid rgba(255,255,255,0.10)',
        boxShadow: selected ? undefined : '0 4px 16px rgba(0,0,0,0.35)',
      }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
    >
      <Handle type="target" position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-accent !border-0" />

      {editing ? (
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') { setText(data.label ?? '新主题'); setEditing(false) }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-[14px] text-neutral-100 text-center focus:outline-none"
          style={{ minWidth: 90 }}
        />
      ) : (
        <p className="text-[14px] font-medium text-neutral-100 text-center leading-snug break-words">
          {text}
        </p>
      )}

      {/* 悬浮操作：加入对话 / 加子节点 / 删除 */}
      <div className={cn(
        'absolute -top-2.5 -right-2.5 flex gap-1 transition-opacity',
        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        <button
          title="加入 AI 对话参考"
          onClick={(e) => { e.stopPropagation(); addChatRef({ id, type: 'mindText', data: { label: text } }) }}
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
          className="w-5 h-5 rounded-full flex items-center justify-center text-neutral-300 bg-neutral-800 hover:bg-red-600 hover:text-white shadow-md transition-colors"
        >
          <X size={11} />
        </button>
      </div>

      <Handle type="source" position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-accent !border-0" />
    </div>
  )
})
