import dagre from '@dagrejs/dagre'

const NODE_WIDTH  = 220
const NODE_HEIGHT = 100

const NODE_SIZES = {
  kgRoot:   { w: 200, h: 72  },
  kgText:   { w: 240, h: 110 },
  kgVisual: { w: 180, h: 160 },
  default:  { w: NODE_WIDTH, h: NODE_HEIGHT },
}

export function applyDagreLayout(nodes, edges, direction = 'LR') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,   // LR = 左→右放射，TB = 上→下树状
    ranksep: 80,
    nodesep: 40,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach(node => {
    const size = NODE_SIZES[node.type] ?? NODE_SIZES.default
    g.setNode(node.id, { width: size.w, height: size.h })
  })

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map(node => {
    const pos = g.node(node.id)
    const size = NODE_SIZES[node.type] ?? NODE_SIZES.default
    return {
      ...node,
      position: {
        x: pos.x - size.w / 2,
        y: pos.y - size.h / 2,
      },
    }
  })
}
