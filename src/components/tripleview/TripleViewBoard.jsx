import { useState, useCallback } from 'react'
import { Link2, Link2Off } from 'lucide-react'
import { cn } from '../../lib/utils'
import ViewPanel from './ViewPanel'

const VIEWS = [
  { key: 'front', label: 'FRONT  正视图' },
  { key: 'side',  label: 'SIDE  侧视图' },
  { key: 'back',  label: 'BACK  背视图' },
]

export default function TripleViewBoard({ images = {}, isGenerating = false, className }) {
  // 共享视图变换状态
  const [syncState, setSyncState] = useState({ zoom: 1, panX: 0, panY: 0 })
  const [syncEnabled, setSyncEnabled] = useState(true)

  // 各面板独立状态（sync关闭时使用）
  const [panelStates, setPanelStates] = useState({
    front: { zoom: 1, panX: 0, panY: 0 },
    side:  { zoom: 1, panX: 0, panY: 0 },
    back:  { zoom: 1, panX: 0, panY: 0 },
  })

  const handleSyncChange = useCallback((patch) => {
    if (syncEnabled) {
      setSyncState(patch)
    }
  }, [syncEnabled])

  function handlePanelChange(key, patch) {
    if (syncEnabled) {
      setSyncState(patch)
    } else {
      setPanelStates((s) => ({ ...s, [key]: patch }))
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <span className="text-[14px] font-mono text-neutral-600 uppercase tracking-widest">
          Triple View
        </span>
        <button
          onClick={() => setSyncEnabled(!syncEnabled)}
          className={cn(
            'flex items-center gap-1 text-[14px] px-2 py-0.5 rounded border transition-colors',
            syncEnabled
              ? 'border-generate/40 text-generate bg-generate/5'
              : 'border-line text-neutral-600 hover:border-neutral-600'
          )}
          title={syncEnabled ? '关闭同步缩放' : '开启同步缩放'}
        >
          {syncEnabled ? <Link2 size={10} /> : <Link2Off size={10} />}
          <span>{syncEnabled ? '同步' : '独立'}</span>
        </button>
      </div>

      {/* 三视图并排 */}
      <div className="flex gap-1.5 flex-1 min-h-0">
        {VIEWS.map(({ key, label }) => (
          <ViewPanel
            key={key}
            label={label}
            imageUrl={images[key]}
            isGenerating={isGenerating}
            syncState={syncEnabled ? syncState : panelStates[key]}
            onSyncChange={(patch) => handlePanelChange(key, patch)}
          />
        ))}
      </div>

      {/* 操作提示 */}
      <p className="text-[15px] text-neutral-700 text-center shrink-0">
        滚轮缩放 · 拖拽平移 · 双击重置{syncEnabled ? ' · 同步模式' : ' · 独立模式'}
      </p>
    </div>
  )
}
