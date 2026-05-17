import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap, addEdge, useReactFlow,
} from 'reactflow'
import { useDroppable } from '@dnd-kit/core'
import 'reactflow/dist/style.css'

import useIPStore from '../../store/useIPStore'
import { applyDagreLayout } from '../../lib/dagreLayout'

// 原有节点
import ReferenceNode  from './nodes/ReferenceNode'
import ParameterNode  from './nodes/ParameterNode'
import ResultNode     from './nodes/ResultNode'
import GenerationNode from './nodes/GenerationNode'
import TripleViewNode from './nodes/TripleViewNode'
// 知识图谱节点
import KGRootNode   from './nodes/kg/KGRootNode'
import KGTextNode   from './nodes/kg/KGTextNode'
import KGVisualNode from './nodes/kg/KGVisualNode'

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
}

export default function IPFlowCanvas() {
  const { rfNodes, rfEdges, onRFNodesChange, onRFEdgesChange, setRFEdges, setRFNodes } = useIPStore()
  const { fitView } = useReactFlow()
  const prevKGCount = useRef(0)

  // 当知识图谱节点数量变化时，触发 dagre 自动布局并 fitView
  useEffect(() => {
    const kgNodes = rfNodes.filter(n => n.type?.startsWith('kg'))
    const kgEdges = rfEdges.filter(e => e.id.startsWith('e-root'))

    if (kgNodes.length > 0 && kgNodes.length !== prevKGCount.current) {
      prevKGCount.current = kgNodes.length

      const laid = applyDagreLayout(kgNodes, kgEdges, 'LR')
      const nonKG = rfNodes.filter(n => !n.type?.startsWith('kg'))
      setRFNodes([...nonKG, ...laid])

      // 延迟一帧再 fitView，确保节点已渲染
      setTimeout(() => fitView({ padding: 0.3, duration: 600 }), 50)
    }
  }, [rfNodes, rfEdges, setRFNodes, fitView])

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'canvas-drop' })

  const onConnect = useCallback(
    (params) => setRFEdges(addEdge({
      ...params, animated: true,
      style: { stroke: '#7c5af0', strokeWidth: 1.5 },
    }, rfEdges)),
    [rfEdges, setRFEdges]
  )

  const selectedIds = rfNodes.filter(n => n.selected).map(n => n.id)

  return (
    <div ref={setDropRef} className="w-full h-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onRFNodesChange}
        onEdgesChange={onRFEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        minZoom={0.1}
        maxZoom={2.5}
        selectionOnDrag
        panOnDrag={[1, 2]}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#7c5af0', strokeWidth: 1.5 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#222228" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => {
            if (n.type === 'kgRoot')    return '#7c5af0'
            if (n.type === 'kgText')    return '#4a4a6a'
            if (n.type === 'kgVisual')  return '#22d3ee'
            if (n.type === 'reference') return '#7c5af0'
            if (n.type === 'parameter') return '#22d3ee'
            if (n.type === 'result')    return '#f59e0b'
            return '#3f3f4a'
          }}
          maskColor="rgba(10,10,11,0.8)"
          style={{ background: '#111113', border: '1px solid #2a2a30', borderRadius: '6px' }}
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
      <div className="text-center space-y-1.5">
        <p className="text-[11px] font-mono text-neutral-800 tracking-widest">输入关键词或上传文件，AI 将解析知识图谱</p>
        <p className="text-[10px] text-neutral-800">支持 PDF · PPT · Word · 图片</p>
      </div>
    </div>
  )
}
