import { Clapperboard } from 'lucide-react'

export default function Step05Scenes() {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 p-2.5 rounded-md bg-orange-950/30 border border-orange-900/30">
        <Clapperboard size={13} className="text-orange-500 shrink-0" />
        <p className="text-[14px] text-orange-400/80">
          Phase 3 将实现场景融合：将 IP 形象置入城市、自然、赛博朋克等场景
        </p>
      </div>
    </div>
  )
}
