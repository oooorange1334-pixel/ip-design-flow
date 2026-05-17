import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'
import { CheckCircle2 } from 'lucide-react'

import Step01Inspiration from './steps/Step01Inspiration'
import Step02Elements from './steps/Step02Elements'
import Step03TripleView from './steps/Step03TripleView'
import Step04Actions from './steps/Step04Actions'
import Step05Scenes from './steps/Step05Scenes'
import Step06Merch from './steps/Step06Merch'

const STEPS = [
  { id: 'step-01', index: 0, label: '灵感调研',      sub: 'Moodboard',   accentColor: 'text-violet-400', component: Step01Inspiration },
  { id: 'step-02', index: 1, label: '核心元素提取',  sub: 'Elements',    accentColor: 'text-blue-400',   component: Step02Elements },
  { id: 'step-03', index: 2, label: '三视图 / CMF',  sub: 'Triple View', accentColor: 'text-cyan-400',   component: Step03TripleView },
  { id: 'step-04', index: 3, label: '动作矩阵',      sub: 'Actions',     accentColor: 'text-emerald-400', component: Step04Actions },
  { id: 'step-05', index: 4, label: '场景融合',      sub: 'Scenes',      accentColor: 'text-orange-400', component: Step05Scenes },
  { id: 'step-06', index: 5, label: '衍生文创',      sub: 'Merch',       accentColor: 'text-pink-400',   component: Step06Merch },
]

// ── IP 设定常驻栏（左列） ────────────────────────────────
function IPContextPanel() {
  const { ipContext, updateIPContext } = useIPStore()
  return (
    <div className="w-64 shrink-0 border-r border-neutral-800 flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">IP 全局设定</p>
      </div>
      <div className="px-3 pb-3 space-y-2.5 flex-1">
        <input
          className="w-full bg-canvas-800 border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
          placeholder="性格定位，如：高科技机器人"
          value={ipContext.personality}
          onChange={(e) => updateIPContext({ personality: e.target.value })}
        />
        <div className="flex gap-1.5">
          <input
            className="flex-1 bg-canvas-800 border border-neutral-800 rounded px-2 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
            placeholder="主材质"
            value={ipContext.material}
            onChange={(e) => updateIPContext({ material: e.target.value })}
          />
          <input
            className="flex-1 bg-canvas-800 border border-neutral-800 rounded px-2 py-1.5 text-[11px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
            placeholder="点缀件"
            value={ipContext.accent}
            onChange={(e) => updateIPContext({ accent: e.target.value })}
          />
        </div>
        <SliderRow label="粗糙度" value={ipContext.roughness} onChange={(v) => updateIPContext({ roughness: v })} />
        <SliderRow label="金属度" value={ipContext.metalness} onChange={(v) => updateIPContext({ metalness: v })} />
        <SliderRow label="反射率" value={ipContext.reflectance ?? 0.5} onChange={(v) => updateIPContext({ reflectance: v })} color="cyan" />
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange, color = 'accent' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neutral-600 w-10 shrink-0">{label}</span>
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn('flex-1 h-0.5 cursor-pointer', color === 'cyan' ? 'accent-cyan-500' : 'accent-violet-500')}
      />
      <span className="text-[10px] font-mono text-neutral-500 w-8 text-right">{value.toFixed(2)}</span>
    </div>
  )
}

// ── 当前步骤内容区（右侧主区域） ─────────────────────────
function ActiveStepPanel() {
  const { activeStep, historyNodes } = useIPStore()
  const step = STEPS[activeStep]
  if (!step) return null
  const StepComponent = step.component
  const done = historyNodes.some((n) => n.step === step.index)

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      {/* 步骤标题 */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 border-b border-neutral-800/60 shrink-0">
        {done
          ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          : <span className={cn('text-[10px] font-mono font-bold shrink-0', step.accentColor)}>
              {String(step.index + 1).padStart(2, '0')}
            </span>
        }
        <p className="text-[12px] font-semibold text-neutral-100">{step.label}</p>
        <p className="text-[10px] text-neutral-600">{step.sub}</p>
      </div>

      {/* 步骤内容 */}
      <div className="px-4 py-3 flex-1">
        <StepComponent />
      </div>
    </div>
  )
}

// ── 主组件：横向两列 ──────────────────────────────────────
export default function StepAccordion() {
  return (
    <div className="h-full flex">
      <IPContextPanel />
      <ActiveStepPanel />
    </div>
  )
}
