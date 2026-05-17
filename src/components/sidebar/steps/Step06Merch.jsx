import { ShoppingBag } from 'lucide-react'

const MERCH = ['马克杯', 'T恤', '手机壳', '海报', '徽章', '钥匙扣', '帆布袋', '公仔']

export default function Step06Merch() {
  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2 p-2.5 rounded-md bg-pink-950/30 border border-pink-900/30">
        <ShoppingBag size={13} className="text-pink-500 shrink-0" />
        <p className="text-[10px] text-pink-400/80">
          Phase 3 将实现衍生文创：一键将 IP 形象适配到商品模板上
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {MERCH.map((m) => (
          <span key={m} className="text-[10px] px-2 py-0.5 rounded border border-neutral-700 text-neutral-600">{m}</span>
        ))}
      </div>
    </div>
  )
}
