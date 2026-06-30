import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap, useReactFlow,
} from 'reactflow'
import { useDroppable } from '@dnd-kit/core'
import 'reactflow/dist/style.css'

import useIPStore from '../../store/useIPStore'
import { applyForestLayout } from '../../lib/dagreLayout'

import ReferenceNode  from './nodes/ReferenceNode'
import ParameterNode  from './nodes/ParameterNode'
import ResultNode     from './nodes/ResultNode'
import GenerationNode from './nodes/GenerationNode'
import TripleViewNode from './nodes/TripleViewNode'
import KGRootNode     from './nodes/kg/KGRootNode'
import KGTextNode     from './nodes/kg/KGTextNode'
import KGVisualNode   from './nodes/kg/KGVisualNode'
import MindTextNode   from './nodes/mind/MindTextNode'
import MindImageNode  from './nodes/mind/MindImageNode'
import AssetImageNode from './nodes/AssetImageNode'
import SelectionToolbar from './SelectionToolbar'

const nodeTypes = {
  reference:  ReferenceNode,
  parameter:  ParameterNode,
  result:     ResultNode,
  generation: GenerationNode,
  tripleview: TripleViewNode,
  kgRoot:     KGRootNode,
  kgText:     KGTextNode,
  kgVisual:   KGVisualNode,
  mindText:   MindTextNode,
  mindImage:  MindImageNode,
  assetImage: AssetImageNode,
}

export default function IPFlowCanvas() {
  const {
    currentProject,
    onRFNodesChange, onRFEdgesChange, onRFConnect,
    setRFNodes, setRFEdges,
    setSelectedNode,
    addMindTextNode,
    autoLinkNearbyNodes,
    seedStepCanvas,
  } = useIPStore()

  const proj = currentProject()
  const rfNodes = proj?.rfNodes ?? []
  const rfEdges = proj?.rfEdges ?? []
  const activeStep = proj?.activeStep ?? 0

  const { fitView, screenToFlowPosition } = useReactFlow()
  const prevKGCount = useRef(0)

  // 进入 04/05/06 步骤 → 首次铺设占位 demo 节点
  useEffect(() => {
    if (activeStep === 3 || activeStep === 4 || activeStep === 5) {
      seedStepCanvas(activeStep)
      setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 80)
    }
  }, [activeStep, seedStepCanvas, fitView])

  // KG 节点数量变化 → forest layout → fitView
  useEffect(() => {
    const kgNodes = rfNodes.filter(n => n.type?.startsWith('kg'))
    const kgEdges = rfEdges.filter(e => e.id.startsWith('e-root'))

    if (kgNodes.length > 0 && kgNodes.length !== prevKGCount.current) {
      prevKGCount.current = kgNodes.length
      const nonKG = rfNodes.filter(n => !n.type?.startsWith('kg'))
      const laid  = applyForestLayout(kgNodes, kgEdges, 'LR', 1100)
      setRFNodes([...nonKG, ...laid])
      setTimeout(() => fitView({ padding: 0.2, duration: 700 }), 60)
    }
  }, [rfNodes, rfEdges, setRFNodes, fitView])

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'canvas-drop' })

  // 节点点击 → 更新 selectedNode（驱动右侧 Context Drawer）
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [setSelectedNode])

  // 点击画布空白 → 清除选中
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  // 双击画布空白 → 新增思维导图文本节点
  const onPaneDoubleClick = useCallback((event) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addMindTextNode({ x: position.x - 60, y: position.y - 20 })
  }, [screenToFlowPosition, addMindTextNode])

  // 拖动节点结束 → 自动连接彼此靠近的思维导图节点
  const onNodeDragStop = useCallback(() => {
    autoLinkNearbyNodes()
  }, [autoLinkNearbyNodes])

  const selectedIds = rfNodes.filter(n => n.selected).map(n => n.id)

  return (
    <div ref={setDropRef} className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onRFNodesChange}
        onEdgesChange={onRFEdgesChange}
        onConnect={onRFConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDoubleClick={onPaneDoubleClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        deleteKeyCode={['Delete', 'Backspace']}
        minZoom={0.08}
        maxZoom={2.5}
        selectionOnDrag
        panOnDrag={[1, 2]}
        defaultEdgeOptions={{ animated: false, style: { stroke: '#7C4DFF', strokeWidth: 1.5 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#222228" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => {
            if (n.type === 'kgRoot')    return '#7c5af0'
            if (n.type === 'kgText')    return '#4a4a6a'
            if (n.type === 'kgVisual')  return '#22d3ee'
            if (n.type === 'mindText')  return '#7C4DFF'
            if (n.type === 'mindImage') return '#22d3ee'
            if (n.type === 'assetImage') return '#7C4DFF'
            if (n.type === 'reference') return '#7c5af0'
            if (n.type === 'parameter') return '#22d3ee'
            if (n.type === 'result')    return '#f59e0b'
            return '#3f3f4a'
          }}
          maskColor="rgba(10,10,11,0.8)"
          style={{ background: '#161618', border: '1px solid #3a3a42', borderRadius: '6px' }}
        />
        {selectedIds.length > 0 && <SelectionToolbar selectedIds={selectedIds} />}
        {rfNodes.length === 0 && <EmptyHint />}
      </ReactFlow>

      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-accent/50 bg-accent/5 pointer-events-none z-50" />
      )}
    </div>
  )
}

function EmptyHint() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div className="text-center space-y-2">
        <p className="text-[15px] font-mono text-neutral-700 tracking-widest">双击空白处新建主题节点，开始绘制思维导图</p>
        <p className="text-[14px] text-neutral-700">从右侧搜索素材拖入画布 · 拖动节点圆点连线 · 选中后按 Delete 删除</p>
      </div>
    </div>
  )
}
