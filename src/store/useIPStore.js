import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'

// ── 占位图库（20张，用种子区分） ─────────────────────────
const SEEDS = ['arch1','arch2','city1','city2','steel1','indust1','forest1',
  'texture1','minimal1','cyber1','brutalist1','concrete1','metal2','rust1',
  'glass1','neon1','factory1','bridge1','sculpture1','abstract1']

function placeholderUrl(seed, w = 400, h = 400) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// ── Prompt 合成工具函数 ───────────────────────────────────
export function generatePromptFromNodes(nodes) {
  const parts = []
  const paramNodes = nodes.filter(n => n.type === 'parameter')
  const refNodes   = nodes.filter(n => n.type === 'reference')

  refNodes.forEach(n => {
    if (n.data?.label) parts.push(`reference: ${n.data.label}`)
  })
  paramNodes.forEach(n => {
    const d = n.data
    if (d?.category === 'form')  parts.push(`form: ${d.label}`)
    if (d?.category === 'cmf')   parts.push(`material: ${d.label}`)
    if (d?.category === 'motif') parts.push(`motif: ${d.label}`)
    if (d?.prompt) parts.push(d.prompt)
  })
  parts.push('IP character design, professional concept art, studio lighting, 4K')
  return parts.join(', ')
}

// ── 模拟 VLM 素材提炼 ────────────────────────────────────
function mockExtractAssets(selectedImages) {
  const forms = [
    { id: 'form-1', label: '圆柱体结构', category: 'form', prompt: 'cylindrical body structure', imageUrl: placeholderUrl('form1',200,200), tags: ['几何','圆润'] },
    { id: 'form-2', label: '棱角切面',   category: 'form', prompt: 'angular chamfered surface', imageUrl: placeholderUrl('form2',200,200), tags: ['锐利','工业'] },
    { id: 'form-3', label: '弧形背板',   category: 'form', prompt: 'curved back panel',          imageUrl: placeholderUrl('form3',200,200), tags: ['曲线','流线'] },
  ]
  const cmfs = [
    { id: 'cmf-1', label: '耐候钢·锈红', category: 'cmf', prompt: 'corten steel weathered rust texture', imageUrl: placeholderUrl('cmf1',200,200), tags: ['金属','锈迹'] },
    { id: 'cmf-2', label: '哑光铝合金',  category: 'cmf', prompt: 'matte anodized aluminum',             imageUrl: placeholderUrl('cmf2',200,200), tags: ['铝','哑光'] },
    { id: 'cmf-3', label: '钢化玻璃·透', category: 'cmf', prompt: 'tempered glass translucent surface',  imageUrl: placeholderUrl('cmf3',200,200), tags: ['透明','玻璃'] },
  ]
  const motifs = [
    { id: 'motif-1', label: '工业铆钉', category: 'motif', prompt: 'industrial rivet pattern detail', imageUrl: placeholderUrl('motif1',200,200), tags: ['工业','细节'] },
    { id: 'motif-2', label: '网格镂空', category: 'motif', prompt: 'mesh perforated lattice motif',    imageUrl: placeholderUrl('motif2',200,200), tags: ['镂空','网格'] },
  ]
  return { form: forms, cmf: cmfs, motif: motifs }
}

const useIPStore = create(
  devtools(
    (set, get) => ({

      // ── IP 上下文 ──────────────────────────────────────
      ipContext: {
        personality: '', material: '', accent: '',
        colorPalette: [], roughness: 0.3, metalness: 0.8,
        reflectance: 0.5, alpha: 1.0, surfaceTreatment: [],
      },

      // ── 工作流阶段状态机 ───────────────────────────────
      // 'moodboard' → 'extracting' → 'library' → 'composing'
      workflowPhase: 'moodboard',

      // ── Phase 2：情绪板 ────────────────────────────────
      moodboard: {
        searchQuery: '',
        isSearching: false,
      },

      // ── Phase 3：素材库 ────────────────────────────────
      materialLibrary: {
        form: [],
        cmf: [],
        motif: [],
      },

      // ── 右侧抽屉宽度（支持拖拽调整） ──────────────────
      drawerWidth: 288,

      // ── 已锁定特征 ─────────────────────────────────────
      lockedElements: [],

      // ── 生成历史 ───────────────────────────────────────
      historyNodes: [],

      // ── React Flow 视图层 ──────────────────────────────
      rfNodes: [],
      rfEdges: [],

      // ── UI ────────────────────────────────────────────
      activeStep: 0,
      isGenerating: false,

      // ── 布局比例（react-resizable-panels 持久化） ──────
      // 横向：[左导航, 右主区]
      hLayoutSizes: [15, 85],
      // 纵向：[上画布, 下控制舱]
      vLayoutSizes: [65, 35],

      // ════════════════════════════════════════════════
      // Actions
      // ════════════════════════════════════════════════

      updateIPContext: (patch) =>
        set(s => ({ ipContext: { ...s.ipContext, ...patch } }), false, 'updateIPContext'),

      setDrawerWidth: (w) =>
        set({ drawerWidth: Math.max(220, Math.min(520, w)) }, false, 'setDrawerWidth'),

      // ── 知识图谱提取状态 ───────────────────────────────
      knowledgeGraph: {
        isExtracting: false,   // 提取中动画
        sourceLabel: '',       // 当前主题/文件名
        uploadedFiles: [],     // 已上传文件列表 [{name, type, size}]
      },

      updateKnowledgeGraph: (patch) =>
        set(s => ({ knowledgeGraph: { ...s.knowledgeGraph, ...patch } }), false, 'updateKG'),

      // ── 知识图谱：模拟多模态解析 ──────────────────────
      simulateKnowledgeExtraction: async (query, files = []) => {
        const label = files[0]?.name?.replace(/\.[^.]+$/, '') || query || '灵感主题'
        set(s => ({
          knowledgeGraph: { ...s.knowledgeGraph, isExtracting: true, sourceLabel: label, uploadedFiles: files },
          moodboard: { ...s.moodboard, searchQuery: query, isSearching: true },
        }), false, 'kgStart')

        await new Promise(r => setTimeout(r, 2000))

        // 根节点
        const rootId = `kg-root-${Date.now()}`
        // 文本洞察节点
        const textInsights = [
          { id: `kg-text-${Date.now()}-1`, label: '工业遗存与赛博朋克美学的融合', source: 'pdf', detail: '首钢园区保留了大量高炉、料仓等工业构筑物，形成独特的钢铁废墟美学，与赛博朋克的"废土未来感"高度契合。' },
          { id: `kg-text-${Date.now()}-2`, label: '「锈蚀」作为材质语言的核心符号', source: 'pdf', detail: '耐候钢的橙红色锈迹不是腐蚀，而是设计语言——代表时间沉淀与工业记忆，可转化为 IP 主色调与表面处理工艺。' },
          { id: `kg-text-${Date.now()}-3`, label: '巨构尺度与人体尺度的张力', source: 'doc', detail: '高炉高达百米，与人体形成强烈的尺度冲突，IP 设计可借此构建"宏大感"与"精密感"并存的视觉语言。' },
        ]
        // 视觉节点
        const visualSeeds = ['steel1', 'rust1', 'indust1', 'factory1', 'brutalist1']
        const visualNodes = visualSeeds.map((seed, i) => ({
          id: `kg-visual-${Date.now()}-${i}`,
          seed,
          imageUrl: placeholderUrl(seed, 280, 210),
          label: ['高炉主体', '耐候钢锈面', '工业构架', '厂房空间', '粗野主义'][i],
        }))

        // 用 dagre 布局逻辑（在 Flow 组件里处理），Store 只存原始数据
        const newNodes = [
          {
            id: rootId,
            type: 'kgRoot',
            position: { x: 0, y: 0 },
            data: { label, query, fileCount: files.length },
          },
          ...textInsights.map(t => ({
            id: t.id,
            type: 'kgText',
            position: { x: 0, y: 0 },
            data: { label: t.label, source: t.source, detail: t.detail },
          })),
          ...visualNodes.map(v => ({
            id: v.id,
            type: 'kgVisual',
            position: { x: 0, y: 0 },
            data: { imageUrl: v.imageUrl, label: v.label, seed: v.seed },
          })),
        ]

        const newEdges = [
          ...textInsights.map(t => ({
            id: `e-root-${t.id}`,
            source: rootId,
            target: t.id,
            type: 'smoothstep',
            style: { stroke: '#3f3f4a', strokeWidth: 1.2 },
          })),
          ...visualNodes.map(v => ({
            id: `e-root-${v.id}`,
            source: rootId,
            target: v.id,
            type: 'smoothstep',
            style: { stroke: '#3f3f4a', strokeWidth: 1.2 },
          })),
        ]

        set(s => ({
          knowledgeGraph: { ...s.knowledgeGraph, isExtracting: false },
          moodboard: { ...s.moodboard, isSearching: false },
          // 清除旧的知识图谱节点，保留其他类型节点
          rfNodes: [
            ...s.rfNodes.filter(n => !n.type?.startsWith('kg') && n.type !== 'reference'),
            ...newNodes,
          ],
          rfEdges: [
            ...s.rfEdges.filter(e => !e.id.startsWith('e-root')),
            ...newEdges,
          ],
        }), false, 'kgDone')
      },

      // ── Phase 2：搜索散图 ──────────────────────────────
      searchMoodboard: async (query) => {
        set(s => ({ moodboard: { ...s.moodboard, searchQuery: query, isSearching: true } }), false, 'searchStart')

        await new Promise(r => setTimeout(r, 800 + Math.random() * 600))

        // 生成 8-12 张随机散落的参考图节点
        const count = 8 + Math.floor(Math.random() * 5)
        const seeds = [...SEEDS].sort(() => Math.random() - 0.5).slice(0, count)

        const newNodes = seeds.map((seed, i) => {
          const cols = 4
          const col  = i % cols
          const row  = Math.floor(i / cols)
          // 加入随机偏移让散落感更自然
          const jitterX = (Math.random() - 0.5) * 60
          const jitterY = (Math.random() - 0.5) * 60
          return {
            id: `ref-${seed}-${Date.now()}-${i}`,
            type: 'reference',
            position: { x: 80 + col * 220 + jitterX, y: 80 + row * 200 + jitterY },
            data: {
              imageUrl: placeholderUrl(seed, 320, 240),
              label: `${query} · ${seed}`,
              seed,
              selected: false,
            },
          }
        })

        set(s => ({
          moodboard: { ...s.moodboard, isSearching: false },
          rfNodes: [...s.rfNodes.filter(n => n.type !== 'reference'), ...newNodes],
        }), false, 'searchDone')
      },

      // ── Phase 2：框选提炼 ──────────────────────────────
      extractAssets: async (selectedNodeIds) => {
        set({ workflowPhase: 'extracting' }, false, 'extractStart')
        await new Promise(r => setTimeout(r, 1200))

        const selected = get().rfNodes.filter(n => selectedNodeIds.includes(n.id))
        const assets = mockExtractAssets(selected)

        set({
          workflowPhase: 'library',
          materialLibrary: assets,
          activeStep: 1,
        }, false, 'extractDone')
      },

      // ── Phase 3：从画布节点生成草图 ────────────────────
      generateFromSelection: async (selectedNodeIds) => {
        const { rfNodes, rfEdges, addRFNode, updateRFNodeData } = get()
        const selectedNodes = rfNodes.filter(n => selectedNodeIds.includes(n.id))
        const prompt = generatePromptFromNodes(selectedNodes)

        // 计算结果节点位置（选中节点的右下方）
        const maxX = Math.max(...selectedNodes.map(n => n.position.x))
        const maxY = Math.max(...selectedNodes.map(n => n.position.y))

        const resultId = `result-${Date.now()}`
        set(s => ({
          isGenerating: true,
          rfNodes: [...s.rfNodes, {
            id: resultId,
            type: 'result',
            position: { x: maxX + 280, y: maxY - 80 },
            data: { isGenerating: true, images: [], prompt, sourceNodeIds: selectedNodeIds },
          }],
          rfEdges: [
            ...s.rfEdges,
            ...selectedNodeIds.map(srcId => ({
              id: `e-${srcId}-${resultId}`,
              source: srcId,
              target: resultId,
              animated: true,
              style: { stroke: '#7c5af0', strokeWidth: 1.5 },
            })),
          ],
        }), false, 'generateStart')

        // 模拟生成4张图（并行）
        await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200))
        const images = Array.from({ length: 4 }, (_, i) =>
          placeholderUrl(`result${i + 1}`, 256, 256)
        )

        set(s => ({
          isGenerating: false,
          rfNodes: s.rfNodes.map(n =>
            n.id === resultId
              ? { ...n, data: { ...n.data, isGenerating: false, images } }
              : n
          ),
        }), false, 'generateDone')

        get().addHistoryNode({ id: resultId, imageUrl: images[0], step: 2, params: { prompt } })
      },

      // ── Lock ───────────────────────────────────────────
      lockElement: (element) => {
        const { lockedElements } = get()
        if (lockedElements.find(e => e.id === element.id)) return
        set({ lockedElements: [...lockedElements, { ...element, lockedAt: Date.now() }] }, false, 'lock')
      },
      unlockElement: (id) =>
        set(s => ({ lockedElements: s.lockedElements.filter(e => e.id !== id) }), false, 'unlock'),

      // ── History ────────────────────────────────────────
      addHistoryNode: (node) =>
        set(s => ({
          historyNodes: [...s.historyNodes, { ...node, id: node.id ?? `hist-${Date.now()}`, timestamp: Date.now() }],
        }), false, 'addHistory'),

      // ── React Flow ─────────────────────────────────────
      onRFNodesChange: (changes) =>
        set(s => ({ rfNodes: applyNodeChanges(changes, s.rfNodes) }), false, 'rfNodes'),
      onRFEdgesChange: (changes) =>
        set(s => ({ rfEdges: applyEdgeChanges(changes, s.rfEdges) }), false, 'rfEdges'),
      addRFNode: (node) =>
        set(s => ({ rfNodes: [...s.rfNodes, node] }), false, 'addRFNode'),
      addRFEdge: (edge) =>
        set(s => ({ rfEdges: [...s.rfEdges, edge] }), false, 'addRFEdge'),
      setRFEdges: (edges) => set({ rfEdges: edges }, false, 'setRFEdges'),
      setRFNodes: (nodes) => set({ rfNodes: nodes }, false, 'setRFNodes'),
      updateRFNodeData: (id, patch) =>
        set(s => ({
          rfNodes: s.rfNodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n),
        }), false, 'updateRFNodeData'),

      setActiveStep: (step) => set({ activeStep: step }, false, 'setStep'),
      setHLayoutSizes: (sizes) => set({ hLayoutSizes: sizes }, false, 'setHLayout'),
      setVLayoutSizes: (sizes) => set({ vLayoutSizes: sizes }, false, 'setVLayout'),
      setGenerating: (bool) => set({ isGenerating: bool }, false, 'setGenerating'),
      setWorkflowPhase: (phase) => set({ workflowPhase: phase }, false, 'setPhase'),

      reset: () => set({
        ipContext: { personality: '', material: '', accent: '', colorPalette: [], roughness: 0.3, metalness: 0.8, reflectance: 0.5, alpha: 1.0, surfaceTreatment: [] },
        workflowPhase: 'moodboard', moodboard: { searchQuery: '', isSearching: false },
        materialLibrary: { form: [], cmf: [], motif: [] },
        lockedElements: [], historyNodes: [], rfNodes: [], rfEdges: [],
        activeStep: 0, isGenerating: false, drawerWidth: 288,
        hLayoutSizes: [15, 85], vLayoutSizes: [65, 35],
      }, false, 'reset'),
    }),
    { name: 'IPDesignStore' }
  )
)

export default useIPStore
