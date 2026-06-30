import { useState, useRef } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { History, Settings, Zap, Lock, Plus, ChevronDown, Trash2, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'

const STEPS = [
  { id: 0, num: '01', label: '灵感调研',    color: 'text-violet-400'  },
  { id: 1, num: '02', label: '元素提取',    color: 'text-blue-400'    },
  { id: 2, num: '03', label: 'IP 生成',     color: 'text-accent'      },
  { id: 3, num: '04', label: '三视图/CMF', color: 'text-cyan-400'    },
  { id: 4, num: '05', label: '动作矩阵',    color: 'text-emerald-400' },
  { id: 5, num: '06', label: '场景融合',    color: 'text-orange-400'  },
  { id: 6, num: '07', label: '衍生文创',    color: 'text-pink-400'    },
]

// ── 项目切换下拉 ──────────────────────────────────────────
function ProjectDropdown() {
  const { projects, currentProjectId, createProject, switchProject, deleteProject, renameProject } = useIPStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const current = projects.find(p => p.id === currentProjectId) ?? projects[0]

  function startEdit(proj, e) {
    e.stopPropagation()
    setEditing(proj.id)
    setEditVal(proj.name)
  }
  function commitEdit(id) {
    if (editVal.trim()) renameProject(id, editVal.trim())
    setEditing(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800/60 hover:bg-neutral-800 border border-line/50 transition-colors max-w-[180px]"
      >
        <span className="text-[15px] font-medium text-neutral-200 truncate">{current?.name}</span>
        <ChevronDown size={10} className={cn('text-neutral-500 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-canvas-800 border border-line rounded-lg shadow-2xl shadow-black/40 z-50 overflow-hidden">
            <div className="p-1">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => { switchProject(proj.id); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group',
                    proj.id === currentProjectId
                      ? 'bg-accent/10'
                      : 'hover:bg-neutral-700/50'
                  )}
                >
                  {proj.id === currentProjectId
                    ? <Check size={11} className="text-accent shrink-0" />
                    : <span className="w-[11px] shrink-0" />
                  }
                  {editing === proj.id ? (
                    <input
                      autoFocus
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={() => commitEdit(proj.id)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(proj.id) }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-canvas-900 border border-accent/50 rounded px-1 py-0.5 text-[15px] text-neutral-100 focus:outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 text-[15px] text-neutral-300 truncate"
                      onDoubleClick={e => startEdit(proj, e)}
                    >
                      {proj.name}
                    </span>
                  )}
                  {projects.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteProject(proj.id) }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-line p-1">
              <button
                onClick={() => { createProject(`项目 ${projects.length + 1}`); setOpen(false) }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/50 transition-colors"
              >
                <Plus size={11} />
                新建项目
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── 顶栏 ──────────────────────────────────────────────────
function Topbar() {
  const { currentProject, isGenerating } = useIPStore()
  const proj = currentProject()
  const lockedCount = proj?.lockedElements?.length ?? 0

  return (
    <header className="h-11 flex items-center gap-3 px-4 glass-panel border-0 divider-x shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center shadow-neon-purple-sm">
          <Zap size={10} className="text-white" />
        </div>
        <span className="text-[14px] font-semibold text-neutral-300 tracking-tight">IP 设计流</span>
      </div>

      <div className="w-px h-4 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* 项目下拉 */}
      <ProjectDropdown />

      {/* 右侧状态 */}
      <div className="ml-auto flex items-center gap-3">
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-[15px] text-generate">
            <span className="w-1.5 h-1.5 rounded-full bg-generate animate-pulse" />
            生成中...
          </div>
        )}
        {lockedCount > 0 && (
          <div className="flex items-center gap-1 text-[15px] text-locked">
            <Lock size={10} />
            <span>{lockedCount} 锁定</span>
          </div>
        )}
        <button className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
          <History size={12} />
        </button>
        <button className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
          <Settings size={12} />
        </button>
      </div>
    </header>
  )
}

// ── 步骤导航 ──────────────────────────────────────────────
function StepNavContent() {
  const { currentProject, setActiveStep } = useIPStore()
  const activeStep = currentProject()?.activeStep ?? 0

  return (
    <div className="h-full flex flex-col glass-panel border-0 divider-r overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0">
        <p className="text-[13px] text-neutral-500 font-mono uppercase tracking-wider px-1">工作流</p>
      </div>
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {STEPS.map(step => {
          const active = activeStep === step.id
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all',
                active
                  ? 'glass-card neon-ring text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]'
              )}
            >
              <span className={cn('font-mono text-[14px] w-4 shrink-0 tabular-nums', active ? step.color : 'text-neutral-600')}>
                {step.num}
              </span>
              <span className="text-[14px] font-medium truncate flex-1">{step.label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-neon-purple-sm" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── 把手 ──────────────────────────────────────────────────
function HResizeHandle() {
  return (
    <PanelResizeHandle
      hitAreaMargins={{ coarse: 12, fine: 6 }}
      className="group relative flex items-center justify-center"
      style={{ width: 5, cursor: 'col-resize' }}
    >
      <div className="w-px h-full bg-neutral-600 group-hover:bg-accent/70 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
      <div className="absolute top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-neutral-500 group-hover:bg-accent/90 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
    </PanelResizeHandle>
  )
}

function VResizeHandle() {
  return (
    <PanelResizeHandle
      hitAreaMargins={{ coarse: 12, fine: 6 }}
      className="group relative flex items-center justify-center shrink-0"
      style={{ height: 5, cursor: 'row-resize' }}
    >
      <div className="h-px w-full bg-neutral-600 group-hover:bg-accent/60 group-data-[resize-handle-state=drag]:bg-accent/80 transition-colors" />
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-[3px] px-3 py-1.5 rounded bg-neutral-700 group-hover:bg-neutral-600 group-data-[resize-handle-state=drag]:bg-neutral-600 transition-colors">
        <div className="w-8 h-[1.5px] rounded-full bg-neutral-400 group-hover:bg-accent/70 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
        <div className="w-8 h-[1.5px] rounded-full bg-neutral-400 group-hover:bg-accent/70 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
      </div>
    </PanelResizeHandle>
  )
}

// ── 主布局 ────────────────────────────────────────────────
export default function AppShell({ canvas, controlPanel, contextDrawer }) {
  const { hLayoutSizes, setHLayoutSizes } = useIPStore()
  // 底部控制舱已移除，画布始终占满中部
  void controlPanel

  return (
    <div className="h-full flex flex-col text-neutral-200 overflow-hidden" style={{ background: '#0B0D13' }}>
      <Topbar />

      <PanelGroup
        direction="horizontal"
        onLayout={setHLayoutSizes}
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* 左侧步骤导航 */}
        <Panel defaultSize={hLayoutSizes[0]} minSize={9} maxSize={20} style={{ overflow: 'hidden' }}>
          <StepNavContent />
        </Panel>

        <HResizeHandle />

        {/* 中央主工作区（画布占满） */}
        <Panel defaultSize={hLayoutSizes[1]} minSize={40} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-1 min-h-0 relative" style={{ background: '#0B0D13' }}>
            {canvas}
          </div>
        </Panel>

        <HResizeHandle />

        {/* 右侧 Context Drawer */}
        <Panel defaultSize={hLayoutSizes[2]} minSize={12} maxSize={40} style={{ overflow: 'hidden' }}>
          {contextDrawer}
        </Panel>
      </PanelGroup>
    </div>
  )
}
