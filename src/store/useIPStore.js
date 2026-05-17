import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'

const useIPStore = create(
  devtools(
    (set, get) => ({
      // ── IP 上下文 ────────────────────────────────────────
      ipContext: {
        personality: '',
        material: '',
        accent: '',
        colorPalette: [],
        roughness: 0.3,
        metalness: 0.8,
        reflectance: 0.5,
        alpha: 1.0,
        surfaceTreatment: [],
      },

      // ── 已锁定特征 ────────────────────────────────────────
      lockedElements: [],

      // ── 生成历史（纯数据层） ──────────────────────────────
      historyNodes: [],

      // ── React Flow 视图层 ────────────────────────────────
      rfNodes: [],
      rfEdges: [],

      // ── UI 状态 ──────────────────────────────────────────
      activeStep: 0,
      isGenerating: false,

      // ── Actions: IP Context ─────────────────────────────
      updateIPContext: (patch) =>
        set((s) => ({ ipContext: { ...s.ipContext, ...patch } }), false, 'updateIPContext'),

      // ── Actions: Lock ────────────────────────────────────
      lockElement: (element) => {
        const { lockedElements } = get()
        if (lockedElements.find((e) => e.id === element.id)) return
        set(
          { lockedElements: [...lockedElements, { ...element, lockedAt: Date.now() }] },
          false, 'lockElement'
        )
      },
      unlockElement: (id) =>
        set((s) => ({ lockedElements: s.lockedElements.filter((e) => e.id !== id) }), false, 'unlockElement'),

      // ── Actions: History ─────────────────────────────────
      addHistoryNode: (node) =>
        set((s) => ({
          historyNodes: [...s.historyNodes, {
            ...node,
            id: node.id ?? `hist-${Date.now()}`,
            timestamp: Date.now(),
          }],
        }), false, 'addHistoryNode'),

      removeHistoryNode: (id) =>
        set((s) => ({ historyNodes: s.historyNodes.filter((n) => n.id !== id) }), false, 'removeHistoryNode'),

      // ── Actions: React Flow ──────────────────────────────
      onRFNodesChange: (changes) =>
        set((s) => ({ rfNodes: applyNodeChanges(changes, s.rfNodes) }), false, 'onRFNodesChange'),

      onRFEdgesChange: (changes) =>
        set((s) => ({ rfEdges: applyEdgeChanges(changes, s.rfEdges) }), false, 'onRFEdgesChange'),

      addRFNode: (node) =>
        set((s) => ({ rfNodes: [...s.rfNodes, node] }), false, 'addRFNode'),

      addRFEdge: (edge) =>
        set((s) => ({ rfEdges: [...s.rfEdges, edge] }), false, 'addRFEdge'),

      setRFNodes: (nodes) => set({ rfNodes: nodes }, false, 'setRFNodes'),
      setRFEdges: (edges) => set({ rfEdges: edges }, false, 'setRFEdges'),

      // 更新单个节点的 data 字段（如生成完成后替换骨架）
      updateRFNodeData: (id, patch) =>
        set((s) => ({
          rfNodes: s.rfNodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          ),
        }), false, 'updateRFNodeData'),

      // ── Actions: UI ──────────────────────────────────────
      setActiveStep: (step) => set({ activeStep: step }, false, 'setActiveStep'),
      setGenerating: (bool) => set({ isGenerating: bool }, false, 'setGenerating'),

      reset: () => set({
        ipContext: { personality: '', material: '', accent: '', colorPalette: [], roughness: 0.3, metalness: 0.8, reflectance: 0.5, alpha: 1.0, surfaceTreatment: [] },
        lockedElements: [],
        historyNodes: [],
        rfNodes: [],
        rfEdges: [],
        activeStep: 0,
        isGenerating: false,
      }, false, 'reset'),
    }),
    { name: 'IPDesignStore' }
  )
)

export default useIPStore
