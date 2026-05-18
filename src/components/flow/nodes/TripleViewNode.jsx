import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Columns3, Pin } from 'lucide-react'
import { cn } from '../../../lib/utils'
import TripleViewBoard from '../../tripleview/TripleViewBoard'
import useProject from '../../../store/useProject'

export default memo(function TripleViewNode({ id, data, selected }) {
  const { lockElement, unlockElement, lockedElements } = useProject()

  const isPinned = lockedElements.some((e) => e.id === `tripleview-${id}`)

  function handlePin() {
    if (isPinned) {
      unlockElement(`tripleview-${id}`)
    } else {
      lockElement({
        id: `tripleview-${id}`,
        label: '三视图规范',
        prompt: 'three-view orthographic reference, front side back views',
      })
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-canvas-800 shadow-2xl overflow-hidden',
        selected
          ? 'border-cyan-500/60 ring-1 ring-cyan-500/20'
          : 'border-line/60 hover:border-neutral-600',
      )}
      style={{ width: 640 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-cyan-500 transition-colors"
      />

      {/* 节点标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-line/60 bg-canvas-900">
        <div className="flex items-center gap-2">
          <Columns3 size={12} className="text-cyan-400" />
          <span className="text-[15px] font-medium text-neutral-200">三视图规范</span>
          {data.referenceLabel && (
            <span className="text-[14px] text-neutral-600">← {data.referenceLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data.seed && (
            <span className="text-[15px] font-mono text-neutral-600">#{data.seed}</span>
          )}
          <button
            onClick={handlePin}
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-all',
              isPinned ? 'text-locked bg-locked/10' : 'text-neutral-600 hover:text-locked hover:bg-locked/10',
            )}
            title={isPinned ? '解除锁定' : '锁定三视图规范'}
          >
            <Pin size={10} />
          </button>
        </div>
      </div>

      {/* 三视图画板 */}
      <div className="p-2" style={{ height: 260 }}>
        <TripleViewBoard
          images={{
            front: data.images?.front,
            side:  data.images?.side,
            back:  data.images?.back,
          }}
          isGenerating={data.isGenerating}
          className="h-full"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-neutral-600 !border-neutral-500 hover:!bg-cyan-500 transition-colors"
      />
    </div>
  )
})
