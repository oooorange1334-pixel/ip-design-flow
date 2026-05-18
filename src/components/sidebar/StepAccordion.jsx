import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'
import { CheckCircle2 } from 'lucide-react'

import Step01Inspiration  from './steps/Step01Inspiration'
import Step02Elements     from './steps/Step02Elements'
import Step03IPGenerate   from './steps/Step03IPGenerate'
import Step04TripleView   from './steps/Step03TripleView'   // 原 Step03，序号顺延
import Step05Actions      from './steps/Step04Actions'      // 原 Step04
import Step06Scenes       from './steps/Step05Scenes'       // 原 Step05
import Step07Merch        from './steps/Step06Merch'        // 原 Step06

const STEPS = [
  { index: 0, label: '灵感调研',      sub: 'Moodboard',   color: 'text-violet-400',  component: Step01Inspiration },
  { index: 1, label: '核心元素提取',  sub: 'Elements',    color: 'text-blue-400',    component: Step02Elements    },
  { index: 2, label: 'IP 生成',       sub: 'IP Generate', color: 'text-accent',      component: Step03IPGenerate  },
  { index: 3, label: '三视图 / CMF',  sub: 'Triple View', color: 'text-cyan-400',    component: Step04TripleView  },
  { index: 4, label: '动作矩阵',      sub: 'Actions',     color: 'text-emerald-400', component: Step05Actions     },
  { index: 5, label: '场景融合',      sub: 'Scenes',      color: 'text-orange-400',  component: Step06Scenes      },
  { index: 6, label: '衍生文创',      sub: 'Merch',       color: 'text-pink-400',    component: Step07Merch       },
]

// IP 生成步骤的 index
const IP_GENERATE_INDEX = 2

// ── IP 设定面板（仅 IP 生成步骤显示） ─────────────────────
function IPContextPanel() {
  const { ipContext, updateIPContext } = useProject()
  return (
    <div className="w-64 shrink-0 border-r border-line flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-3 pb-1">
        <p className="text-[14px] font-mono text-neutral-600 uppercase tracking-wider">IP 全局设定</p>
      </div>
      <div className="px-3 pb-3 space-y-2.5 flex-1">
        <input
          className="w-full bg-canvas-800 border border-line rounded px-2.5 py-1.5 text-[15px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
          placeholder="性格定位，如：高科技机器人"
          value={ipContext.personality}
          onChange={e => updateIPContext({ personality: e.target.value })}
        />
        <div className="flex gap-1.5">
          <input
            className="flex-1 bg-canvas-800 border border-line rounded px-2 py-1.5 text-[15px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
            placeholder="主材质"
            value={ipContext.material}
            onChange={e => updateIPContext({ material: e.target.value })}
          />
          <input
            className="flex-1 bg-canvas-800 border border-line rounded px-2 py-1.5 text-[15px] text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-accent transition-colors"
            placeholder="点缀件"
            value={ipContext.accent}
            onChange={e => updateIPContext({ accent: e.target.value })}
          />
        </div>
        <SliderRow label="粗糙度" value={ipContext.roughness}          onChange={v => updateIPContext({ roughness: v })}    />
        <SliderRow label="金属度" value={ipContext.metalness}          onChange={v => updateIPContext({ metalness: v })}    />
        <SliderRow label="反射率" value={ipContext.reflectance ?? 0.5} onChange={v => updateIPContext({ reflectance: v })} color="cyan" />
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange, color = 'accent' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] text-neutral-600 w-10 shrink-0">{label}</span>
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={cn('flex-1 h-0.5 cursor-pointer', color === 'cyan' ? 'accent-cyan-500' : 'accent-violet-500')}
      />
      <span className="text-[14px] font-mono text-neutral-500 w-8 text-right">{value.toFixed(2)}</span>
    </div>
  )
}

// ── 当前步骤内容区 ─────────────────────────────────────────
function ActiveStepPanel() {
  const { activeStep, historyNodes, workflowPhase, setActiveStep } = useProject()

  // 提炼完成 → 自动跳到「元素提取」
  useEffect(() => {
    if (workflowPhase === 'library' && activeStep === 0) {
      setActiveStep(1)
    }
  }, [workflowPhase, activeStep, setActiveStep])

  const step = STEPS[activeStep]
  if (!step) return null
  const StepComponent = step.component
  const done = historyNodes.some(n => n.step === step.index)

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 border-b border-line/60 shrink-0">
        {done
          ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          : <span className={cn('text-[14px] font-mono font-bold shrink-0', step.color)}>
              {String(step.index + 1).padStart(2, '0')}
            </span>
        }
        <p className="text-[14px] font-semibold text-neutral-100">{step.label}</p>
        <p className="text-[14px] text-neutral-600">{step.sub}</p>
      </div>
      <div className="px-4 py-3 flex-1">
        <StepComponent />
      </div>
    </div>
  )
}

// ── 主组件 ─────────────────────────────────────────────────
export default function StepAccordion() {
  const { activeStep } = useProject()
  const showIPPanel = activeStep === IP_GENERATE_INDEX

  return (
    <div className="h-full flex">
      {/* IP 设定面板：仅 IP 生成步骤时显示 */}
      {showIPPanel && <IPContextPanel />}
      <ActiveStepPanel />
    </div>
  )
}
