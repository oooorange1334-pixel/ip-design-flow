import { useCallback, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import AppShell from '../components/layout/AppShell'
import IPFlowCanvas from '../components/flow/IPFlowCanvas'
import StepAccordion from '../components/sidebar/StepAccordion'
import useIPStore from '../store/useIPStore'

function StudioInner() {
  const { addRFNode, rfNodes, setWorkflowPhase, workflowPhase } = useIPStore()
  const { screenToFlowPosition } = useReactFlow()
  const [dragItem, setDragItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragStart = useCallback((event) => {
    const data = event.active?.data?.current
    if (data?.type === 'asset') setDragItem(data.item)
  }, [])

  const handleDragEnd = useCallback((event) => {
    setDragItem(null)
    const { active, over } = event
    if (!over || over.id !== 'canvas-drop') return
    const assetData = active.data?.current
    if (assetData?.type !== 'asset') return

    const item = assetData.item
    const clientX = (event.activatorEvent?.clientX ?? 0) + event.delta.x
    const clientY = (event.activatorEvent?.clientY ?? 0) + event.delta.y
    const position = screenToFlowPosition({ x: clientX, y: clientY })

    if (rfNodes.some(n => n.type === 'parameter' && n.data?.id === item.id)) return

    addRFNode({
      id: `param-${item.id}-${Date.now()}`,
      type: 'parameter',
      position: { x: position.x - 70, y: position.y - 60 },
      data: { ...item },
    })

    if (workflowPhase === 'library') setWorkflowPhase('composing')
  }, [addRFNode, rfNodes, screenToFlowPosition, workflowPhase, setWorkflowPhase])

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AppShell
        controlPanel={<StepAccordion />}
        canvas={<IPFlowCanvas />}
      />

      <DragOverlay dropAnimation={null}>
        {dragItem && (
          <div className="w-24 rounded-lg border border-accent/50 overflow-hidden shadow-2xl shadow-accent/20 opacity-90 rotate-2 scale-95 pointer-events-none">
            <img src={dragItem.imageUrl} alt={dragItem.label}
              className="w-full aspect-square object-cover" draggable={false} />
            <div className="bg-canvas-900/90 px-1.5 py-1">
              <p className="text-[9px] text-neutral-300 truncate">{dragItem.label}</p>
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
