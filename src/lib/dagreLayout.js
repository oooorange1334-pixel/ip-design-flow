import dagre from '@dagrejs/dagre'

const NODE_SIZES = {
  kgRoot:    { w: 200, h: 72  },
  kgText:    { w: 240, h: 110 },
  kgVisual:  { w: 180, h: 160 },
  parameter: { w: 140, h: 120 },
  default:   { w: 220, h: 100 },
}

// 单棵树的 dagre 布局（指定 xOffset 整体偏移）
function layoutOneTree(nodes, edges, direction = 'LR', xOffset = 0) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40, marginx: 40, marginy: 40 })

  nodes.forEach(node => {
    const size = NODE_SIZES[node.type] ?? NODE_SIZES.default
    g.setNode(node.id, { width: size.w, height: size.h })
  })
  edges.forEach(edge => g.setEdge(edge.source, edge.target))
  dagre.layout(g)

  return nodes.map(node => {
    const pos = g.node(node.id)
    const size = NODE_SIZES[node.type] ?? NODE_SIZES.default
    return {
      ...node,
      position: {
        x: xOffset + pos.x - size.w / 2,
        y: pos.y - size.h / 2,
      },
    }
  })
}

// 单树布局（原有接口，兼容旧调用）
export function applyDagreLayout(nodes, edges, direction = 'LR') {
  return layoutOneTree(nodes, edges, direction, 0)
}

// 森林布局：多棵树按 X 轴排开，每棵树之间留 GAP
export function applyForestLayout(allNodes, allEdges, direction = 'LR', treeGap = 1100) {
  if (allNodes.length === 0) return allNodes

  // 找出所有根节点（kgRoot 类型，或入度为 0 的节点）
  const targetIds = new Set(allEdges.map(e => e.target))
  const roots = allNodes.filter(n => n.type === 'kgRoot' || !targetIds.has(n.id))

  if (roots.length === 0) return applyDagreLayout(allNodes, allEdges, direction)

  // 按 treeIndex 或发现顺序排列
  const sortedRoots = [...roots].sort((a, b) =>
    (a.data?.treeIndex ?? 0) - (b.data?.treeIndex ?? 0)
  )

  const result = []

  sortedRoots.forEach((root, idx) => {
    // 收集属于这棵树的节点（BFS from root）
    const treeNodeIds = new Set([root.id])
    const queue = [root.id]
    while (queue.length) {
      const cur = queue.shift()
      allEdges.forEach(e => {
        if (e.source === cur && !treeNodeIds.has(e.target)) {
          treeNodeIds.add(e.target)
          queue.push(e.target)
        }
      })
    }
    const treeNodes = allNodes.filter(n => treeNodeIds.has(n.id))
    const treeEdges = allEdges.filter(e => treeNodeIds.has(e.source) && treeNodeIds.has(e.target))

    const xOffset = idx * treeGap
    const laid = layoutOneTree(treeNodes, treeEdges, direction, xOffset)
    result.push(...laid)
  })

  // 未被任何树覆盖的孤立节点原样返回
  const coveredIds = new Set(result.map(n => n.id))
  allNodes.filter(n => !coveredIds.has(n.id)).forEach(n => result.push(n))

  return result
}
