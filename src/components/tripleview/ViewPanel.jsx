import { useRef, useEffect, useCallback } from 'react'
import { Loader2, Maximize2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function ViewPanel({ label, imageUrl, isGenerating, syncState, onSyncChange }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const { zoom, panX, panY } = syncState

  // 应用 transform 到图片
  useEffect(() => {
    if (!imgRef.current) return
    imgRef.current.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`
  }, [zoom, panX, panY])

  // 滚轮缩放 — 广播给父组件同步
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const nextZoom = Math.min(4, Math.max(0.3, zoom + delta))
    onSyncChange({ zoom: nextZoom, panX, panY })
  }, [zoom, panX, panY, onSyncChange])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // 鼠标拖拽平移
  function onMouseDown(e) {
    if (e.button !== 0) return
    isDragging.current = true
    dragStart.current = { x: e.clientX - panX * zoom, y: e.clientY - panY * zoom }
    e.preventDefault()
  }

  function onMouseMove(e) {
    if (!isDragging.current) return
    const nextPanX = (e.clientX - dragStart.current.x) / zoom
    const nextPanY = (e.clientY - dragStart.current.y) / zoom
    onSyncChange({ zoom, panX: nextPanX, panY: nextPanY })
  }

  function onMouseUp() {
    isDragging.current = false
  }

  // 双击重置
  function onDoubleClick() {
    onSyncChange({ zoom: 1, panX: 0, panY: 0 })
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 border border-neutral-800 rounded-lg overflow-hidden bg-canvas-950">
      {/* 视图标题栏 */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-canvas-900 border-b border-neutral-800 shrink-0">
        <span className="text-[10px] font-mono text-neutral-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-neutral-700">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => onSyncChange({ zoom: 1, panX: 0, panY: 0 })}
            className="text-neutral-700 hover:text-neutral-400 transition-colors"
            title="重置视图"
          >
            <Maximize2 size={10} />
          </button>
        </div>
      </div>

      {/* 图片区 */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 flex items-center justify-center overflow-hidden select-none',
          isDragging.current ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ minHeight: 0 }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
      >
        {isGenerating ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-canvas-800/50 to-canvas-900/50 animate-pulse" />
            <Loader2 size={16} className="text-generate animate-spin relative z-10" />
            <span className="text-[9px] font-mono text-neutral-700 relative z-10">渲染中...</span>
          </div>
        ) : imageUrl ? (
          <img
            ref={imgRef}
            src={imageUrl}
            alt={label}
            draggable={false}
            className="max-w-full max-h-full object-contain pointer-events-none transition-none"
            style={{ transformOrigin: 'center center', willChange: 'transform' }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border border-dashed border-neutral-800 flex items-center justify-center">
              <span className="text-[8px] text-neutral-700">{label.charAt(0)}</span>
            </div>
            <span className="text-[9px] text-neutral-700">{label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
