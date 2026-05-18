import { useCallback, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import AppShell from '../components/layout/AppShell'
import IPFlowCanvas from '../components/flow/IPFlowCanvas'
import StepAccordion from '../components/sidebar/StepAccordion'
import RightContextDrawer from '../components/context/RightContextDrawer'
import useIPStore from '../store/useIPStore'

function StudioInner() {
  const { currentProject, addRFNode, setWorkflowPhase } = useIPStore()
  const { screenToFlowPosition } = useReactFlow()
  const [dragItem, setDragItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragStart = useCallback((event) => {
    const data = event.active?.data?.current
    if (data?.type === 'asset' || data?.type === 'drawerImage') {
      setDragItem(data)
    }
  }, [])

  const handleDragEnd = useCallback((event) => {
    setDragItem(null)
    const { active, over } = event
    if (!over || over.id !== 'canvas-drop') return

    const dndData = active.data?.current
    if (!dndData) return

    const clientX = (event.activatorEvent?.clientX ?? 0) + event.delta.x
    const clientY = (event.activatorEvent?.clientY ?? 0) + event.delta.y
    const position = screenToFlowPosition({ x: clientX, y: clientY })

    // 素材库卡片拖入 → parameter 节点
    if (dndData.type === 'asset') {
      const item = dndData.item
      const proj = currentProject()
      if (proj.rfNodes.some(n => n.type === 'parameter' && n.data?.id === item.id)) return
      addRFNode({
        id: `param-${item.id}-${Date.now()}`,
        type: 'parameter',
        position: { x: position.x - 70, y: position.y - 60 },
        data: { ...item },
      })
      if (proj.workflowPhase === 'library') setWorkflowPhase('composing')
      return
    }

    // 右侧 Drawer 图片拖入 → kgVisual 节点
    if (dndData.type === 'drawerImage') {
      addRFNode({
        id: `kg-visual-drawer-${Date.now()}`,
        type: 'kgVisual',
        position: { x: position.x - 90, y: position.y - 80 },
        data: {
          imageUrl: dndData.imageUrl,
          label: dndData.label ?? '联想图片',
          seed: dndData.seed,
          fileName: '灵感发散',
        },
      })
    }
  }, [addRFNode, currentProject, screenToFlowPosition, setWorkflowPhase])

  const dragPreview = dragItem
  const previewImg  = dragItem?.type === 'asset' ? dragItem.item?.imageUrl : dragItem?.imageUrl
  const previewLabel = dragItem?.type === 'asset' ? dragItem.item?.label : dragItem?.label

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AppShell
        canvas={<IPFlowCanvas />}
        controlPanel={<StepAccordion />}
        contextDrawer={<RightContextDrawer />}
      />

      <DragOverlay dropAnimation={null}>
        {dragPreview && previewImg && (
          <div className="w-24 rounded-lg border border-accent/50 overflow-hidden shadow-2xl shadow-accent/20 opacity-90 rotate-2 scale-95 pointer-events-none">
            <img src={previewImg} alt={previewLabel}
              className="w-full aspect-square object-cover" draggable={false} />
            <div className="bg-canvas-900/90 px-1.5 py-1">
              <p className="text-[15px] text-neutral-300 truncate">{previewLabel}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default function Studio() {
  return (
    <ReactFlowProvider>
      <StudioInner />
    </ReactFlowProvider>
  )
}
