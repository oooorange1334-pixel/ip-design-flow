import { Dumbbell } from 'lucide-react'

const POSES = ['站立正面', '行走', '奔跑', '跳跃', '战斗姿态', '休息']

export default function Step04Actions() {
  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-950/30 border border-emerald-900/30">
        <Dumbbell size={13} className="text-emerald-500 shrink-0" />
        <p className="text-[14px] text-emerald-400/80">
          Phase 3 将实现动作矩阵生成，支持选定姿态批量输出
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {POSES.map((p) => (
          <span key={p} className="text-[14px] px-2 py-0.5 rounded border border-line text-neutral-600">{p}</span>
        ))}
      </div>
    </div>
  )
}
