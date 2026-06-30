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

// ── 中文关键词 → 英文 Flickr 标签 ────────────────────────
// LoremFlickr 按 Flickr 标签取图，英文命中率远高于中文。
// 覆盖快捷标签 + 常见设计/IP 灵感词；逗号分隔的多标签提高主题相关性。
const ZH_TAG_MAP = {
  '赛博朋克': 'cyberpunk,neon,night,city',
  '首钢园':   'industrial,factory,steel,architecture',
  '生物机械': 'biomechanical,cyborg,mecha,robot',
  '极简建筑': 'minimal,architecture,concrete,modern',
  '工业锈蚀': 'rust,industrial,metal,decay',
  '深海生物': 'deepsea,bioluminescence,jellyfish,ocean',
  '古典铠甲': 'armor,knight,medieval,metal',
  '太空站':   'spacestation,space,scifi,futuristic',
  '机器人':   'robot,mecha,android',
  '未来':     'futuristic,scifi,future',
  '科技':     'technology,tech,futuristic',
  '机甲':     'mecha,robot,mechanical',
  '霓虹':     'neon,light,glow',
  '金属':     'metal,steel,chrome',
  '玻璃':     'glass,transparent,crystal',
  '自然':     'nature,landscape,organic',
  '动物':     'animal,wildlife',
  '建筑':     'architecture,building',
  '城市':     'city,urban,cityscape',
  '抽象':     'abstract,texture,pattern',
  '蒸汽朋克': 'steampunk,gear,brass,victorian',
  '极简':     'minimal,minimalist,clean',
  '复古':     'vintage,retro',
  '可爱':     'cute,kawaii,toy',
}

// 简单 ASCII 检测：纯英文/数字直接用作标签；否则查映射，查不到回退通用词
function zhToTag(query) {
  const q = (query || '').trim()
  if (!q) return 'design,abstract'
  if (ZH_TAG_MAP[q]) return ZH_TAG_MAP[q]
  // 包含中文字符 → 尝试部分匹配映射键，否则回退
  if (/[\u4e00-\u9fa5]/.test(q)) {
    for (const key of Object.keys(ZH_TAG_MAP)) {
      if (q.includes(key)) return ZH_TAG_MAP[key]
    }
    return 'design,concept,art'
  }
  // 纯英文：空格转逗号当多标签
  return q.replace(/\s+/g, ',')
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
    // results: 搜索到的图片素材（展示在右侧 Inspector 供拖入画布），不直接进画布
    moodboard: { searchQuery: '', isSearching: false, results: [] },
    materialLibrary: { form: [], cmf: [], motif: [] },
    knowledgeGraph: { isExtracting: false, sourceLabel: '', uploadedFiles: [] },
    lockedElements: [],
    historyNodes: [],
    // 灵感调研 AI 生成对话（每项目独立）
    chat: {
      refs: [],          // 加入对话的参考节点 [{id,kind,label,imageUrl}]
      messages: [],      // 对话消息流 [{id,role,text,imageUrl,status}]
      model: 'GLM-5.2',
      ratio: '1:1',
      clarity: '标清',
    },
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

      // ── 搜索素材（LoremFlickr 按关键词联网取真图，存入 Inspector） ──
      searchMoodboard: async (query) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        _patchProject(currentProjectId, {
          moodboard: { ...currentProject().moodboard, searchQuery: query, isSearching: true }
        })
        await new Promise(r => setTimeout(r, 300))

        // 中文关键词 → 英文标签（LoremFlickr 走 Flickr 标签，英文命中率更高）
        const tag = zhToTag(query)
        const count = 10
        const results = Array.from({ length: count }, (_, i) => ({
          id: `mat-${Date.now()}-${i}`,
          // lock=随机数 保证每张不同；多标签用逗号，提高主题相关性
          imageUrl: `https://loremflickr.com/320/240/${tag}?lock=${Math.floor(Math.random() * 100000) + i}`,
          label: `${query} · ${i + 1}`,
          tag,
        }))
        const proj = get().currentProject()
        get()._patchProject(get().currentProjectId, {
          moodboard: { ...proj.moodboard, isSearching: false, results },
        })
      },

      // ── 思维导图：增删节点 ──────────────────────────────
      // 新增文本主题节点（双击空白画布时调用）
      addMindTextNode: (position, label = '新主题') => {
        const id = `mind-text-${Date.now()}`
        get().addRFNode({
          id, type: 'mindText',
          position,
          data: { label, editing: true },
        })
        return id
      },

      // 新增图片素材节点（从 Inspector 拖入时调用）
      addMindImageNode: (position, item) => {
        const id = `mind-img-${item.seed ?? Date.now()}-${Date.now()}`
        get().addRFNode({
          id, type: 'mindImage',
          position,
          data: { imageUrl: item.imageUrl, label: item.label ?? '素材', seed: item.seed },
        })
        return id
      },

      // 为指定节点新增一个子节点并连线
      addChildNode: (parentId) => {
        const { currentProject } = get()
        const proj = currentProject()
        const parent = proj.rfNodes.find(n => n.id === parentId)
        if (!parent) return
        const childId = `mind-text-${Date.now()}`
        const childCount = proj.rfEdges.filter(e => e.source === parentId).length
        get().addRFNode({
          id: childId, type: 'mindText',
          position: { x: parent.position.x + 240, y: parent.position.y + childCount * 90 },
          data: { label: '新分支', editing: true },
        })
        get().addRFEdge({
          id: `e-${parentId}-${childId}`,
          source: parentId, target: childId,
          type: 'smoothstep', animated: false,
          style: { stroke: '#7C4DFF', strokeWidth: 1.5 },
        })
      },

      // 删除节点（同时删除相连的边；若是选中节点则清空选中）
      deleteRFNode: (id) => {
        const { currentProjectId, _patchProject, currentProject, selectedNode } = get()
        const proj = currentProject()
        _patchProject(currentProjectId, {
          rfNodes: proj.rfNodes.filter(n => n.id !== id),
          rfEdges: proj.rfEdges.filter(e => e.source !== id && e.target !== id),
        })
        if (selectedNode?.id === id) set({ selectedNode: null }, false, 'clearSelectedAfterDelete')
      },

      // 拖动结束后，自动连接彼此靠近（中心距 < threshold）但尚未连线的思维导图节点
      autoLinkNearbyNodes: (threshold = 220) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const mindNodes = proj.rfNodes.filter(
          n => n.type === 'mindText' || n.type === 'mindImage'
        )
        if (mindNodes.length < 2) return

        // 节点近似尺寸，用于估算中心点
        const sizeOf = (n) => n.type === 'mindImage'
          ? { w: 168, h: 150 }
          : { w: 150, h: 44 }
        const centerOf = (n) => {
          const s = sizeOf(n)
          return { x: n.position.x + s.w / 2, y: n.position.y + s.h / 2 }
        }

        const hasEdge = (a, b) =>
          proj.rfEdges.some(e =>
            (e.source === a && e.target === b) || (e.source === b && e.target === a)
          )

        const newEdges = []
        for (let i = 0; i < mindNodes.length; i++) {
          for (let j = i + 1; j < mindNodes.length; j++) {
            const a = mindNodes[i], b = mindNodes[j]
            if (hasEdge(a.id, b.id)) continue
            const ca = centerOf(a), cb = centerOf(b)
            const dist = Math.hypot(ca.x - cb.x, ca.y - cb.y)
            if (dist < threshold) {
              // 左侧节点作为 source，保持连线方向自然
              const [src, tgt] = ca.x <= cb.x ? [a, b] : [b, a]
              newEdges.push({
                id: `e-auto-${src.id}-${tgt.id}`,
                source: src.id, target: tgt.id,
                type: 'smoothstep', animated: false,
                data: { auto: true },
                style: { stroke: '#22D3EE', strokeWidth: 1.5 },
              })
            }
          }
        }
        if (newEdges.length > 0) {
          _patchProject(currentProjectId, {
            rfEdges: [...proj.rfEdges, ...newEdges],
          })
        }
      },

      // ── 灵感调研 AI 生成对话 ────────────────────────────
      // 把节点加入对话参考区（去重）
      addChatRef: (node) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const refs = proj.chat?.refs ?? []
        if (refs.some(r => r.id === node.id)) return
        const ref = {
          id: node.id,
          kind: node.type === 'mindImage' ? 'image' : 'text',
          label: node.data?.label ?? '节点',
          imageUrl: node.data?.imageUrl ?? null,
        }
        _patchProject(currentProjectId, {
          chat: { ...proj.chat, refs: [...refs, ref] },
        })
      },

      removeChatRef: (id) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        _patchProject(currentProjectId, {
          chat: { ...proj.chat, refs: (proj.chat?.refs ?? []).filter(r => r.id !== id) },
        })
      },

      setChatConfig: (patch) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        _patchProject(currentProjectId, { chat: { ...proj.chat, ...patch } })
      },

      // 发送 prompt → 生成图片（占位图 demo）→ 落到画布
      sendChatPrompt: async (prompt) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const chat = proj.chat
        const text = (prompt ?? '').trim()
        if (!text) return

        const userMsgId = `msg-u-${Date.now()}`
        const aiMsgId = `msg-a-${Date.now()}`
        const refSummary = chat.refs.map(r => r.label).join('、')

        // 1) 追加用户消息 + AI 占位消息（loading）
        _patchProject(currentProjectId, {
          chat: {
            ...chat,
            messages: [
              ...chat.messages,
              { id: userMsgId, role: 'user', text, refs: chat.refs },
              { id: aiMsgId, role: 'ai', status: 'loading', text: '正在生成...' },
            ],
          },
        })

        // 2) 模拟生成（占位图）
        await new Promise(r => setTimeout(r, 1600 + Math.random() * 800))

        // 比例 → 宽高
        const RATIO_WH = { '1:1': [768, 768], '4:3': [800, 600], '3:4': [600, 800], '16:9': [896, 504], '9:16': [504, 896] }
        const [w, h] = RATIO_WH[chat.ratio] ?? [768, 768]
        const promptTag = zhToTag(text)
        const seed = Math.floor(Math.random() * 100000)
        const imageUrl = `https://loremflickr.com/${w}/${h}/${promptTag}?lock=${seed}`

        // 3) 更新 AI 消息为完成态
        const proj2 = get().currentProject()
        const result = {
          id: `gen-${Date.now()}`, imageUrl, prompt: text,
          model: chat.model, ratio: chat.ratio, clarity: chat.clarity,
        }
        get()._patchProject(currentProjectId, {
          chat: {
            ...proj2.chat,
            messages: proj2.chat.messages.map(m =>
              m.id === aiMsgId
                ? { ...m, status: 'done', text: `已生成「${text}」`, imageUrl, result }
                : m
            ),
          },
        })

        // 4) 落到画布（思维导图图片节点，带生成参数）
        const existingGen = proj2.rfNodes.filter(n => n.type === 'mindImage' && n.data?.fromChat).length
        get().addRFNode({
          id: result.id,
          type: 'mindImage',
          position: { x: 360 + existingGen * 60, y: 120 + existingGen * 60 },
          data: {
            imageUrl, label: text.slice(0, 14) || 'AI 生成', seed,
            fromChat: true, model: chat.model, ratio: chat.ratio, clarity: chat.clarity,
            refIds: chat.refs.map(r => r.id),
          },
        })
        return result
      },

      clearChat: () => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        _patchProject(currentProjectId, {
          chat: { ...proj.chat, messages: [], refs: [] },
        })
      },

      // ── 各步骤画布占位 Demo（首次进入时铺设，避免重复） ──
      seedStepCanvas: (step) => {
        const { currentProjectId, _patchProject, currentProject } = get()
        const proj = currentProject()
        const prefix = `demo-s${step}-`
        if (proj.rfNodes.some(n => n.id.startsWith(prefix))) return // 已铺设

        let nodes = []
        if (step === 3) {
          // 三视图：正 / 侧 / 背
          const views = [
            { label: '正视图 Front', tag: 'robot,character,toy,front' },
            { label: '侧视图 Side',  tag: 'robot,character,toy,side' },
            { label: '背视图 Back',  tag: 'robot,character,toy,back' },
          ]
          nodes = views.map((v, i) => ({
            id: `${prefix}${i}`, type: 'assetImage',
            position: { x: 120 + i * 300, y: 180 },
            data: {
              imageUrl: `https://loremflickr.com/300/380/${v.tag}?lock=${3100 + i}`,
              label: v.label, demoStep: 3, w: 260, h: 320,
            },
          }))
        } else if (step === 4) {
          // 动作矩阵：9 张不同肢体动作
          const poses = ['站立', '行走', '奔跑', '跳跃', '挥手', '坐姿', '思考', '欢呼', '指向']
          nodes = poses.map((label, i) => ({
            id: `${prefix}${i}`, type: 'assetImage',
            position: { x: 80 + (i % 3) * 250, y: 60 + Math.floor(i / 3) * 270 },
            data: {
              imageUrl: `https://loremflickr.com/240/240/robot,character,pose?lock=${4100 + i}`,
              label: `动作 · ${label}`, demoStep: 4, w: 210, h: 210,
            },
          }))
        } else if (step === 5) {
          // 场景融合：中间多张 IP 形象占位，供选中后应用场景
          const bases = ['形象 A', '形象 B', '形象 C', '形象 D', '形象 E', '形象 F']
          nodes = bases.map((label, i) => ({
            id: `${prefix}${i}`, type: 'assetImage',
            position: { x: 90 + (i % 3) * 250, y: 80 + Math.floor(i / 3) * 270 },
            data: {
              imageUrl: `https://loremflickr.com/240/240/character,mascot,3d?lock=${5100 + i}`,
              label, demoStep: 5, w: 210, h: 210, sceneBase: true,
            },
          }))
        }
        if (nodes.length > 0) {
          _patchProject(currentProjectId, { rfNodes: [...proj.rfNodes, ...nodes] })
        }
      },

      // 场景融合：把选中形象套用某场景模板，生成新图落到画布
      generateSceneApplication: async (sourceNode, template) => {
        const { currentProjectId, currentProject } = get()
        if (!sourceNode) return
        set({ isGenerating: true }, false, 'sceneGenStart')
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 800))
        const proj = get().currentProject()
        const existing = proj.rfNodes.filter(n => n.data?.demoStep === 5 && n.data?.sceneApplied).length
        const seed = Math.floor(Math.random() * 100000)
        get().addRFNode({
          id: `demo-s5-scene-${Date.now()}`,
          type: 'assetImage',
          position: { x: 860, y: 80 + existing * 240 },
          data: {
            imageUrl: `https://loremflickr.com/300/300/${template.tag}?lock=${seed}`,
            label: `${sourceNode.data?.label ?? '形象'} × ${template.label}`,
            demoStep: 5, w: 250, h: 250, sceneApplied: true,
          },
        })
        set({ isGenerating: false }, false, 'sceneGenDone')
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
