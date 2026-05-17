import { History, Settings, Zap, Lock } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'

const STEPS = [
  { id: 0, label: '灵感调研',       icon: '01', desc: 'Moodboard' },
  { id: 1, label: '核心元素提取',   icon: '02', desc: 'Elements' },
  { id: 2, label: '三视图 / CMF',   icon: '03', desc: 'Triple View' },
  { id: 3, label: '动作矩阵',       icon: '04', desc: 'Actions' },
  { id: 4, label: '场景融合',       icon: '05', desc: 'Scenes' },
  { id: 5, label: '衍生文创',       icon: '06', desc: 'Merch' },
]

// ── 顶栏 ──────────────────────────────────────────────────
function Topbar() {
  const { lockedElements, isGenerating } = useIPStore()
  return (
    <header className="h-11 flex items-center justify-between px-4 bg-canvas-900 border-b border-neutral-800 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
          <Zap size={11} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-neutral-100 tracking-tight">IP 设计流</span>
        <span className="text-[10px] text-neutral-700 font-mono">v0.1.0</span>
      </div>
      <div className="flex items-center gap-4">
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-xs text-generate">
            <span className="w-1.5 h-1.5 rounded-full bg-generate animate-pulse" />
            生成中...
          </div>
        )}
        {lockedElements.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-locked">
            <Lock size={11} />
            <span>{lockedElements.length} 已锁定</span>
          </div>
        )}
        <button className="w-7 h-7 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
          <History size={13} />
        </button>
        <button className="w-7 h-7 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 transition-colors">
          <Settings size={13} />
        </button>
      </div>
    </header>
  )
}

// ── 左侧步骤导航栏（纯导航，不含展开内容） ────────────────
function StepNav() {
  const { activeStep, setActiveStep, lockedElements } = useIPStore()
  return (
    <aside className="w-52 shrink-0 flex flex-col bg-canvas-900 border-r border-neutral-800 overflow-hidden">
      <div className="px-3 pt-3 pb-1">
        <p className="text-[10px] text-neutral-700 font-mono uppercase tracking-wider px-1 mb-1">工作流</p>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {STEPS.map((step) => {
          const active = activeStep === step.id
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-all',
                active
                  ? 'bg-accent/10 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'
              )}
            >
              <span className={cn(
                'font-mono text-[10px] w-4 shrink-0 tabular-nums',
                active ? 'text-accent' : 'text-neutral-700'
              )}>
                {step.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{step.label}</p>
                <p className={cn(
                  'text-[9px] truncate',
                  active ? 'text-neutral-600' : 'text-neutral-700'
                )}>
                  {step.desc}
                </p>
              </div>
              {active && <span className="w-1 h-1 rounded-full bg-accent shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* 锁定特征浮层 */}
      {lockedElements.length > 0 && (
        <div className="border-t border-neutral-800 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lock size={10} className="text-locked" />
            <span className="text-[9px] font-mono text-locked uppercase tracking-wider">锁定 · {lockedElements.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {lockedElements.slice(0, 4).map((el) => (
              <span key={el.id} className="text-[9px] px-1.5 py-0.5 rounded-full bg-locked/10 text-locked border border-locked/20 truncate max-w-[80px]">
                {el.label}
              </span>
            ))}
            {lockedElements.length > 4 && (
              <span className="text-[9px] text-neutral-600">+{lockedElements.length - 4}</span>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

// ── 右侧：上方操作台 + 下方画布 ──────────────────────────
export default function AppShell({ controlPanel, canvas }) {
  return (
    <div className="h-full flex flex-col bg-canvas-950 text-neutral-200">
      <Topbar />
      <div className="flex flex-1 min-h-0">
        <StepNav />

        {/* 右侧区域 — 上下分割 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* 上方操作台 */}
          <div className="h-[300px] shrink-0 border-b border-neutral-800 bg-canvas-900 overflow-y-auto">
            {controlPanel}
          </div>

          {/* 下方画布 */}
          <div className="flex-1 relative bg-canvas-950 overflow-hidden min-h-0">
            {canvas}
          </div>
        </div>
      </div>
    </div>
  )
}
