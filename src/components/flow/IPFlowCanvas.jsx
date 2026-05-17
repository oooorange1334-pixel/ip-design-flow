import { useCallback } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'

import useIPStore from '../../store/useIPStore'
import GenerationNode from './nodes/GenerationNode'
import TripleViewNode from './nodes/TripleViewNode'

const nodeTypes = {
  generation: GenerationNode,
  tripleview: TripleViewNode,
}

export default function IPFlowCanvas() {
  const {
    rfNodes,
    rfEdges,
    onRFNodesChange,
    onRFEdgesChange,
    setRFEdges,
  } = useIPStore()

  const onConnect = useCallback(
    (params) => setRFEdges(addEdge({ ...params, animated: true, style: { stroke: '#7c5af0', strokeWidth: 1.5 } }, rfEdges)),
    [rfEdges, setRFEdges]
  )

  return (
    <div className="w-full h-full">
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
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#7c5af0', strokeWidth: 1.5 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#2a2a30"
        />

        <Controls
          showInteractive={false}
          className="rf-controls-dark"
        />

        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'generation') return '#7c5af0'
            if (n.type === 'tripleview') return '#22d3ee'
            return '#3f3f4a'
          }}
          maskColor="rgba(10,10,11,0.75)"
          style={{
            background: '#111113',
            border: '1px solid #2a2a30',
            borderRadius: '6px',
          }}
        />

        {/* 空状态提示 */}
        {rfNodes.length === 0 && <EmptyCanvasHint />}
      </ReactFlow>
    </div>
  )
}

function EmptyCanvasHint() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
      <div className="text-center space-y-2">
        <div
          className="text-neutral-800 text-[11px] font-mono"
          style={{ letterSpacing: '0.15em' }}
        >
          ← 从左侧面板开始生成
        </div>
        <div className="text-neutral-800 text-[10px]">
          生成的图像将以节点形式出现在画布上
        </div>
      </div>
    </div>
  )
}
