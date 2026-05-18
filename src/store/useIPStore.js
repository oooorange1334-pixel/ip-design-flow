import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'

// ── 占位图 ────────────────────────────────────────────────
const SEEDS = ['arch1','arch2','city1','city2','steel1','indust1','forest1',
  'texture1','minimal1','cyber1','brutalist1','concrete1','metal2','rust1',
  'glass1','neon1','factory1','bridge1','sculpture1','abstract1']

export function placeholderUrl(seed, w = 400, h = 400) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// ── Prompt 合成 ───────────────────────────────────────────
export function generatePromptFromNodes(nodes) {
  const parts = []
  nodes.filter(n => n.type === 'reference').forEach(n => {
    if (n.data?.label) parts.push(`reference: ${n.data.label}`)
  })
  nodes.filter(n => n.type === 'parameter').forEach(n => {
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
function mockExtractAssets() {
  return {
    form: [
      { id: 'form-1', label: '圆柱体结构', category: 'form', prompt: 'cylindrical body structure', imageUrl: placeholderUrl('form1',200,200), tags: ['几何','圆润'] },
      { id: 'form-2', label: '棱角切面',   category: 'form', prompt: 'angular chamfered surface',  imageUrl: placeholderUrl('form2',200,200), tags: ['锐利','工业'] },
      { id: 'form-3', label: '弧形背板',   category: 'form', prompt: 'curved back panel',           imageUrl: placeholderUrl('form3',200,200), tags: ['曲线','流线'] },
    ],
    cmf: [
      { id: 'cmf-1', label: '耐候钢·锈红', category: 'cmf', prompt: 'corten steel weathered rust', imageUrl: placeholderUrl('cmf1',200,200), tags: ['金属','锈迹'] },
      { id: 'cmf-2', label: '哑光铝合金',  category: 'cmf', prompt: 'matte anodized aluminum',     imageUrl: placeholderUrl('cmf2',200,200), tags: ['铝','哑光'] },
      { id: 'cmf-3', label: '钢化玻璃',    category: 'cmf', prompt: 'tempered glass translucent',  imageUrl: placeholderUrl('cmf3',200,200), tags: ['透明','玻璃'] },
    ],
    motif: [
      { id: 'motif-1', label: '工业铆钉', category: 'motif', prompt: 'industrial rivet pattern', imageUrl: placeholderUrl('motif1',200,200), tags: ['工业','细节'] },
      { id: 'motif-2', label: '网格镂空', category: 'motif', prompt: 'mesh perforated lattice',  imageUrl: placeholderUrl('motif2',200,200), tags: ['镂空','网格'] },
    ],
  }
}

// ── 单个项目的初始数据工厂 ────────────────────────────────
function createProject(name = '新项目', id = `proj-${Date.now()}`) {
  return {
    id,
    name,
    createdAt: Date.now(),
    // IP 参数（每项目独立）
    ipContext: {
      personality: '', material: '', accent: '',
      colorPalette: [], roughness: 0.3, metalness: 0.8,
      reflectance: 0.5, alpha: 1.0, surfaceTreatment: [],
    },
    // 工作流状态
    workflowPhase: 'moodboard',
    activeStep: 0,
    moodboard: { searchQuery: '', isSearching: false },
    materialLibrary: { form: [], cmf: [], motif: [] },
    knowledgeGraph: { isExtracting: false, sourceLabel: '', uploadedFiles: [] },
    lockedElements: [],
    historyNodes: [],
    // 画布数据
    rfNodes: [],
    rfEdges: [],
  }
}

const DEFAULT_PROJECT = createProject('默认项目', 'proj-default')

// ── Store ─────────────────────────────────────────────────
const useIPStore = create(
  devtools(
    (set, get) => ({

      // ── 项目管理 ───────────────────────────────────────
      projects: [DEFAULT_PROJECT],
      currentProjectId: DEFAULT_PROJECT.id,

      // ── 全局 UI（跨项目共享） ──────────────────────────
      isGenerating: false,
      selectedNode: null,           // 当前选中节点，驱动右侧 Context Drawer
      hLayoutSizes: [13, 62, 25],   // [左导航, 中画布, 右抽屉]
      vLayoutSizes: [65, 35],       // [上画布, 下控制舱]

      // ════════════════════════════════════════════════════
      // 当前项目 getter（派生计算，直接访问当前项目字段）
      // 使用方式：useIPStore(s => s.currentProject())
      // ════════════════════════════════════════════════════
      currentProject: () => {
        const { projects, currentProjectId } = get()
        return projects.find(p => p.id === currentProjectId) ?? projects[0]
      },

      // ── 更新当前项目的某个字段（内部通用方法） ─────────
      _patchProject: (id, patch) =>
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p)
        }), false, '_patchProject'),

      // ════════════════════════════════════════════════════
      // 项目管理 Actions
      // ════════════════════════════════════════════════════
      createProject: (name = '新项目') => {
        const proj = createProject(name)
        set(s => ({
          projects: [...s.projects, proj],
          currentProjectId: proj.id,
          selectedNode: null,
        }), false, 'createProject')
      },

      switchProject: (id) => {
        set({ currentProjectId: id, selectedNode: null }, false, 'switchProject')
      },

      renameProject: (id, name) => {
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, name } : p)
        }), false, 'renameProject')
      },

      deleteProject: (id) => {
        const { projects, currentProjectId } = get()
        if (projects.length <= 1) return
        const next = projects.filter(p => p.id !== id)
        const nextId = currentProjectId === id ? next[0].id : currentProjectId
        set({ projects: next, currentProjectId: nextId, selectedNode: null }, false, 'deleteProject')
      },

      // ════════════════════════════════════════════════════
      // 项目内数据 Actions（操作当前项目）
      // ════════════════════════════════════════════════════

      updateIPContext: (patch) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          ipContext: { ...currentProject().ipContext, ...patch }
        })
      },

      setActiveStep: (step) => {
        const { currentProjectId, _patchProject } = get()
        _patchProject(currentProjectId, { activeStep: step })
      },

      setWorkflowPhase: (phase) => {
        const { currentProjectId, _patchProject } = get()
        _patchProject(currentProjectId, { workflowPhase: phase })
      },

      lockElement: (element) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const locked = currentProject().lockedElements
        if (locked.find(e => e.id === element.id)) return
        _patchProject(currentProjectId, {
          lockedElements: [...locked, { ...element, lockedAt: Date.now() }]
        })
      },

      unlockElement: (id) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          lockedElements: currentProject().lockedElements.filter(e => e.id !== id)
        })
      },

      addHistoryNode: (node) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          historyNodes: [...currentProject().historyNodes, {
            ...node, id: node.id ?? `hist-${Date.now()}`, timestamp: Date.now()
          }]
        })
      },

      // ── React Flow ─────────────────────────────────────
      onRFNodesChange: (changes) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfNodes: applyNodeChanges(changes, currentProject().rfNodes)
        })
      },

      onRFEdgesChange: (changes) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfEdges: applyEdgeChanges(changes, currentProject().rfEdges)
        })
      },

      addRFNode: (node) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfNodes: [...currentProject().rfNodes, node]
        })
      },

      addRFEdge: (edge) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfEdges: [...currentProject().rfEdges, edge]
        })
      },

      setRFEdges: (edges) => {
        const { currentProjectId, _patchProject } = get()
        _patchProject(currentProjectId, { rfEdges: edges })
      },

      setRFNodes: (nodes) => {
        const { currentProjectId, _patchProject } = get()
        _patchProject(currentProjectId, { rfNodes: nodes })
      },

      onRFConnect: (params) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfEdges: addEdge({
            ...params, animated: true,
            style: { stroke: '#7c5af0', strokeWidth: 1.5 }
          }, currentProject().rfEdges)
        })
      },

      updateRFNodeData: (id, patch) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          rfNodes: currentProject().rfNodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          )
        })
      },

      // ── 选中节点（驱动 Context Drawer） ────────────────
      setSelectedNode: (node) => set({ selectedNode: node }, false, 'setSelectedNode'),

      // ── 知识图谱提取 ───────────────────────────────────
      simulateKnowledgeExtraction: async (query, files = []) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const label = files[0]?.name?.replace(/\.[^.]+$/, '') || query || '灵感主题'

        _patchProject(currentProjectId, {
          knowledgeGraph: { isExtracting: true, sourceLabel: label, uploadedFiles: files },
          moodboard: { ...proj.moodboard, searchQuery: query, isSearching: true },
        })

        await new Promise(r => setTimeout(r, 2000))

        // 构建多树（多文件时生成多个根节点）
        const effectiveFiles = files.length > 0 ? files : [{ name: query || '灵感主题' }]
        const treeCount = Math.min(effectiveFiles.length, 4)

        // 每棵树的主题 & Mock 数据库
        const TREE_DATA = [
          {
            insights: [
              { label: '工业遗存与赛博朋克美学的融合', source: 'pdf', page: 12, detail: '首钢园区保留了大量高炉、料仓等工业构筑物，形成独特的钢铁废墟美学，与赛博朋克的"废土未来感"高度契合。', url: '' },
              { label: '「锈蚀」作为材质语言的核心符号', source: 'pdf', page: 28, detail: '耐候钢的橙红色锈迹代表时间沉淀与工业记忆，可转化为 IP 主色调与表面处理工艺。', url: '' },
              { label: '巨构尺度与人体尺度的张力', source: 'doc', page: 5, detail: '高炉高达百米，与人体形成强烈的尺度冲突，IP 设计可借此构建宏大感与精密感并存的视觉语言。', url: '' },
            ],
            visualSeeds: ['steel1', 'rust1', 'indust1', 'factory1', 'brutalist1'],
            visualLabels: ['高炉主体', '耐候钢锈面', '工业构架', '厂房空间', '粗野主义'],
          },
          {
            insights: [
              { label: '仿生形态与机械结构的共生', source: 'pdf', page: 7, detail: '自然界的甲壳类生物外骨骼结构，与精密机械零件有高度形态共鸣，是生物机械风格的核心叙事。', url: '' },
              { label: '流体金属的表面张力美学', source: 'web', page: 0, detail: '液态金属在凝固临界状态呈现的表面纹理，兼具柔软与坚硬的矛盾感，适合作为高科技材质语言。', url: 'https://example.com' },
            ],
            visualSeeds: ['cyber1', 'abstract1', 'glass1', 'neon1'],
            visualLabels: ['甲壳外骨骼', '液态金属', '透明层叠', '霓虹肌理'],
          },
          {
            insights: [
              { label: '极简几何与负空间的哲学', source: 'pdf', page: 3, detail: '日本极简主义以"减法"作为设计语言，留白即表达——负空间与实体的比例关系是设计克制感的关键。', url: '' },
              { label: '「间」的空间哲学', source: 'doc', page: 14, detail: '日语中的"间"（Ma）概念——事物之间的空隙、间隔具有独立的审美价值，可运用于 IP 整体比例设定。', url: '' },
            ],
            visualSeeds: ['minimal1', 'concrete1', 'bridge1', 'sculpture1'],
            visualLabels: ['极简几何', '清水混凝土', '桥梁弧线', '雕塑体量'],
          },
          {
            insights: [
              { label: '深海发光生物的色彩系统', source: 'web', page: 0, detail: '深海生物通过生物发光（Bioluminescence）实现视觉信号传递，其蓝绿色光谱是高饱和度科技感色彩的自然来源。', url: 'https://example.com' },
              { label: '压力适应与形态进化', source: 'pdf', page: 19, detail: '深海生物在极端压力下形成的流线型身体结构，兼顾功能性与美学，是 IP 外形设计的绝佳参照。', url: '' },
            ],
            visualSeeds: ['arch1', 'arch2', 'forest1', 'texture1'],
            visualLabels: ['深海光谱', '流线造型', '生物纹理', '压力美学'],
          },
        ]

        const allNewNodes = []
        const allNewEdges = []
        const TREE_X_GAP = 1100 // 每棵树的 X 间距

        for (let t = 0; t < treeCount; t++) {
          const ts = Date.now() + t
          const fileLabel = effectiveFiles[t]?.name?.replace(/\.[^.]+$/, '') || `主题 ${t + 1}`
          const treeData = TREE_DATA[t % TREE_DATA.length]
          const xOffset = t * TREE_X_GAP

          const rootId = `kg-root-${ts}-${t}`
          allNewNodes.push({
            id: rootId,
            type: 'kgRoot',
            position: { x: xOffset, y: 0 },
            data: { label: fileLabel, query, fileCount: 1, treeIndex: t },
          })

          treeData.insights.forEach((ins, i) => {
            const nodeId = `kg-text-${ts}-${t}-${i}`
            allNewNodes.push({
              id: nodeId,
              type: 'kgText',
              position: { x: xOffset, y: 0 },
              data: {
                label: ins.label, source: ins.source,
                detail: ins.detail, page: ins.page, url: ins.url,
                fileName: fileLabel,
              },
            })
            allNewEdges.push({
              id: `e-root-${nodeId}`,
              source: rootId, target: nodeId,
              type: 'smoothstep',
              style: { stroke: '#3f3f4a', strokeWidth: 1.2 },
            })
          })

          treeData.visualSeeds.forEach((seed, i) => {
            const nodeId = `kg-visual-${ts}-${t}-${i}`
            allNewNodes.push({
              id: nodeId,
              type: 'kgVisual',
              position: { x: xOffset, y: 0 },
              data: {
                imageUrl: placeholderUrl(seed, 280, 210),
                label: treeData.visualLabels[i], seed,
                fileName: fileLabel,
              },
            })
            allNewEdges.push({
              id: `e-root-${nodeId}`,
              source: rootId, target: nodeId,
              type: 'smoothstep',
              style: { stroke: '#3f3f4a', strokeWidth: 1.2 },
            })
          })
        }

        const proj2 = get().currentProject()
        get()._patchProject(get().currentProjectId, {
          knowledgeGraph: { isExtracting: false, sourceLabel: label, uploadedFiles: files },
          moodboard: { ...proj2.moodboard, isSearching: false },
          rfNodes: [
            ...proj2.rfNodes.filter(n => !n.type?.startsWith('kg') && n.type !== 'reference'),
            ...allNewNodes,
          ],
          rfEdges: [
            ...proj2.rfEdges.filter(e => !e.id.startsWith('e-root')),
            ...allNewEdges,
          ],
        })
      },

      // ── 搜索散图 ───────────────────────────────────────
      searchMoodboard: async (query) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          moodboard: { ...currentProject().moodboard, searchQuery: query, isSearching: true }
        })
        await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
        const count = 8 + Math.floor(Math.random() * 5)
        const seeds = [...SEEDS].sort(() => Math.random() - 0.5).slice(0, count)
        const newNodes = seeds.map((seed, i) => {
          const col = i % 4, row = Math.floor(i / 4)
          return {
            id: `ref-${seed}-${Date.now()}-${i}`,
            type: 'reference',
            position: {
              x: 80 + col * 220 + (Math.random() - 0.5) * 60,
              y: 80 + row * 200 + (Math.random() - 0.5) * 60,
            },
            data: { imageUrl: placeholderUrl(seed, 320, 240), label: `${query} · ${seed}`, seed },
          }
        })
        const proj = get().currentProject()
        get()._patchProject(get().currentProjectId, {
          moodboard: { ...proj.moodboard, isSearching: false },
          rfNodes: [...proj.rfNodes.filter(n => n.type !== 'reference'), ...newNodes],
        })
      },

      // ── 框选提炼 ───────────────────────────────────────
      extractAssets: async (selectedNodeIds) => {
        const { currentProjectId, _patchProject } = get()
        _patchProject(currentProjectId, { workflowPhase: 'extracting' })
        await new Promise(r => setTimeout(r, 1200))
        _patchProject(currentProjectId, {
          workflowPhase: 'library',
          materialLibrary: mockExtractAssets(),
          activeStep: 1,
        })
      },

      // ── 从选中节点生成草图 ─────────────────────────────
      generateFromSelection: async (selectedNodeIds) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const selectedNodes = proj.rfNodes.filter(n => selectedNodeIds.includes(n.id))
        const prompt = generatePromptFromNodes(selectedNodes)
        const maxX = Math.max(...selectedNodes.map(n => n.position.x))
        const maxY = Math.max(...selectedNodes.map(n => n.position.y))
        const resultId = `result-${Date.now()}`

        set({ isGenerating: true }, false, 'genStart')
        _patchProject(currentProjectId, {
          rfNodes: [...proj.rfNodes, {
            id: resultId, type: 'result',
            position: { x: maxX + 280, y: maxY - 80 },
            data: { isGenerating: true, images: [], prompt, sourceNodeIds: selectedNodeIds },
          }],
          rfEdges: [...proj.rfEdges, ...selectedNodeIds.map(srcId => ({
            id: `e-${srcId}-${resultId}`, source: srcId, target: resultId,
            animated: true, style: { stroke: '#7c5af0', strokeWidth: 1.5 },
          }))],
        })

        await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200))
        const images = Array.from({ length: 4 }, (_, i) => placeholderUrl(`result${i + 1}`, 256, 256))

        set({ isGenerating: false }, false, 'genDone')
        get()._patchProject(get().currentProjectId, {
          rfNodes: get().currentProject().rfNodes.map(n =>
            n.id === resultId ? { ...n, data: { ...n.data, isGenerating: false, images } } : n
          ),
        })
        get().addHistoryNode({ id: resultId, imageUrl: images[0], step: 2, params: { prompt } })
      },

      // ── 布局 ───────────────────────────────────────────
      setHLayoutSizes: (sizes) => set({ hLayoutSizes: sizes }, false, 'setHLayout'),
      setVLayoutSizes: (sizes) => set({ vLayoutSizes: sizes }, false, 'setVLayout'),
      setGenerating: (bool) => set({ isGenerating: bool }, false, 'setGenerating'),
    }),
    { name: 'IPDesignStore' }
  )
)

export default useIPStore
