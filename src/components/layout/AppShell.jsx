import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { History, Settings, Zap, Lock } from 'lucide-react'
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

function Topbar() {
  const { lockedElements, isGenerating } = useIPStore()
  return (
    <header className="h-10 flex items-center justify-between px-3 bg-canvas-900 border-b border-neutral-800 shrink-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0">
          <Zap size={10} className="text-white" />
        </div>
        <span className="text-[13px] font-semibold text-neutral-100 tracking-tight">IP 设计流</span>
        <span className="text-[9px] text-neutral-700 font-mono">v0.2.0</span>
      </div>
      <div className="flex items-center gap-3">
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-[11px] text-generate">
            <span className="w-1.5 h-1.5 rounded-full bg-generate animate-pulse" />
            生成中...
          </div>
        )}
        {lockedElements.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-locked">
            <Lock size={10} />
            <span>{lockedElements.length} 已锁定</span>
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

function StepNavContent() {
  const { activeStep, setActiveStep } = useIPStore()
  return (
    <div className="h-full flex flex-col bg-canvas-900 overflow-hidden">
      <div className="px-3 pt-3 pb-1 shrink-0">
        <p className="text-[10px] text-neutral-700 font-mono uppercase tracking-wider px-1 mb-1">工作流</p>
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {STEPS.map(step => {
          const active = activeStep === step.id
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-all',
                active
                  ? 'bg-accent/10 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'
              )}
            >
              <span className={cn('font-mono text-[10px] w-4 shrink-0 tabular-nums', active ? step.color : 'text-neutral-700')}>
                {step.num}
              </span>
              <span className="text-[11px] font-medium truncate flex-1">{step.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-accent shrink-0" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// ── 横向把手 ──────────────────────────────────────────────
function HResizeHandle() {
  return (
    <PanelResizeHandle
      hitAreaMargins={{ coarse: 12, fine: 6 }}
      className="group relative flex items-center justify-center"
      style={{ width: 5, cursor: 'col-resize' }}
    >
      {/* 默认细线 */}
      <div className="w-px h-full bg-neutral-800 group-hover:bg-accent/60 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
      {/* 中央把手点 */}
      <div className="absolute top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-neutral-700 group-hover:bg-accent/80 group-data-[resize-handle-state=drag]:bg-accent transition-colors" />
    </PanelResizeHandle>
  )
}

// ── 纵向把手 ──────────────────────────────────────────────
function VResizeHandle() {
  return (
    <PanelResizeHandle
      hitAreaMargins={{ coarse: 12, fine: 6 }}
      className="group relative flex items-center justify-center shrink-0"
      style={{ height: 5, cursor: 'row-resize' }}
    >
      {/* 默认细线 */}
      <div className="h-px w-full bg-neutral-800 group-hover:bg-accent/50 group-data-[resize-handle-state=drag]:bg-accent/70 transition-colors" />
      {/* 中央双横线操作块 */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-[3px] px-3 py-1.5 rounded bg-neutral-800/90 group-hover:bg-neutral-700 group-data-[resize-handle-state=drag]:bg-neutral-700 transition-colors">
        <div className="w-8 h-[1.5px] rounded-full bg-neutral-600 group-hover:bg-accent/60 group-data-[resize-handle-state=drag]:bg-accent/80 transition-colors" />
        <div className="w-8 h-[1.5px] rounded-full bg-neutral-600 group-hover:bg-accent/60 group-data-[resize-handle-state=drag]:bg-accent/80 transition-colors" />
      </div>
    </PanelResizeHandle>
  )
}

export default function AppShell({ canvas, controlPanel }) {
  const { hLayoutSizes, vLayoutSizes, setHLayoutSizes, setVLayoutSizes } = useIPStore()

  return (
    <div className="h-full flex flex-col bg-canvas-950 text-neutral-200 overflow-hidden">
      <Topbar />

      {/* 横向主分栏 — 用 style 确保高度充满 */}
      <PanelGroup
        direction="horizontal"
        onLayout={setHLayoutSizes}
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* 左侧步骤导航 */}
        <Panel
          defaultSize={hLayoutSizes[0]}
          minSize={10}
          maxSize={22}
          style={{ overflow: 'hidden' }}
        >
          <StepNavContent />
        </Panel>

        <HResizeHandle />

        {/* 右侧主工作区 */}
        <Panel
          defaultSize={hLayoutSizes[1]}
          minSize={50}
          style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* 纵向嵌套分栏 */}
          <PanelGroup
            direction="vertical"
            onLayout={setVLayoutSizes}
            style={{ flex: 1, minHeight: 0 }}
          >
            {/* 上方画布 */}
            <Panel
              defaultSize={vLayoutSizes[0]}
              minSize={20}
              maxSize={85}
              style={{ overflow: 'hidden', position: 'relative' }}
              className="bg-canvas-950"
            >
              {canvas}
            </Panel>

            <VResizeHandle />

            {/* 下方控制舱 */}
            <Panel
              defaultSize={vLayoutSizes[1]}
              minSize={15}
              maxSize={80}
              style={{ overflow: 'hidden' }}
              className="bg-canvas-900 border-t border-neutral-800"
            >
              {controlPanel}
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}
