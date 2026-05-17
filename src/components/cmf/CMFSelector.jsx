import { useState } from 'react'
import { Pin, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import useIPStore from '../../store/useIPStore'
import { MATERIAL_PRESETS, SURFACE_TREATMENTS, MATERIAL_GROUPS } from './MaterialPresets'

// ── 颜色色槽 ─────────────────────────────────────────────
function ColorPalette() {
  const { ipContext, updateIPContext } = useIPStore()
  const palette = ipContext.colorPalette.length
    ? ipContext.colorPalette
    : ['#7c5af0', '#1a1a1f', '#9a9a9a', '#8b6914', '']

  function updateColor(idx, hex) {
    const next = [...palette]
    next[idx] = hex
    updateIPContext({ colorPalette: next })
  }

  return (
    <div>
      <p className="text-[10px] text-neutral-500 mb-1.5">CMF 色板</p>
      <div className="flex gap-1.5">
        {palette.map((hex, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-6 rounded border border-neutral-700 cursor-pointer transition-transform hover:scale-110"
              style={{ background: hex || '#1a1a1f' }}
              title={hex || '未设置'}
            />
            <input
              type="text"
              maxLength={7}
              placeholder="#hex"
              value={hex}
              onChange={(e) => updateColor(i, e.target.value)}
              className="w-full bg-transparent text-[8px] font-mono text-neutral-600 text-center focus:outline-none focus:text-neutral-300 placeholder-neutral-800 border-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 参数滑块 ──────────────────────────────────────────────
function ParamSlider({ label, sublabel, value, onChange, color = 'accent' }) {
  const trackColors = {
    accent: 'accent-violet-500',
    cyan: 'accent-cyan-500',
    amber: 'accent-amber-500',
    rose: 'accent-rose-500',
  }
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] text-neutral-400">{label}</span>
        <div className="flex items-center gap-1.5">
          {sublabel && <span className="text-[9px] text-neutral-700">{sublabel}</span>}
          <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">{value.toFixed(2)}</span>
        </div>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn('w-full h-0.5 cursor-pointer', trackColors[color] ?? trackColors.accent)}
      />
    </div>
  )
}

// ── 材质网格 ──────────────────────────────────────────────
function MaterialGrid() {
  const { ipContext, updateIPContext } = useIPStore()
  const [activeGroup, setActiveGroup] = useState('金属')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = MATERIAL_PRESETS.filter((m) => m.group === activeGroup)

  function applyPreset(preset) {
    setSelectedId(preset.id)
    updateIPContext({
      material: preset.label,
      roughness: preset.roughness,
      metalness: preset.metalness,
      reflectance: preset.reflectance,
      ...(preset.alpha != null ? { alpha: preset.alpha } : {}),
    })
  }

  return (
    <div>
      <p className="text-[10px] text-neutral-500 mb-1.5">材质预设</p>
      {/* 分组 tab */}
      <div className="flex gap-0.5 mb-2">
        {MATERIAL_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={cn(
              'flex-1 text-[9px] py-0.5 rounded transition-colors',
              activeGroup === g
                ? 'bg-accent/20 text-accent'
                : 'text-neutral-600 hover:text-neutral-400'
            )}
          >
            {g}
          </button>
        ))}
      </div>
      {/* 材质网格 4列 */}
      <div className="grid grid-cols-4 gap-1">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={cn(
              'flex flex-col items-center gap-1 p-1.5 rounded border transition-all',
              selectedId === preset.id || ipContext.material === preset.label
                ? 'border-accent/60 bg-accent/5'
                : 'border-neutral-800 hover:border-neutral-700 bg-canvas-800'
            )}
            title={preset.label}
          >
            {/* 材质色块 */}
            <div
              className="w-6 h-6 rounded-full border border-neutral-700/50 shrink-0"
              style={{
                background: preset.color,
                boxShadow: preset.metalness > 0.7
                  ? `inset -2px -2px 4px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,${preset.reflectance * 0.3})`
                  : 'none',
              }}
            />
            <span className="text-[8px] text-neutral-500 text-center leading-tight line-clamp-2">
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 表面处理标签 ──────────────────────────────────────────
function SurfaceTreatmentTags() {
  const { ipContext, updateIPContext, lockElement, unlockElement, lockedElements } = useIPStore()
  const selected = ipContext.surfaceTreatment ?? []

  function toggle(tag) {
    const tagId = `surface-${tag}`
    if (selected.includes(tag)) {
      updateIPContext({ surfaceTreatment: selected.filter((t) => t !== tag) })
      unlockElement(tagId)
    } else {
      updateIPContext({ surfaceTreatment: [...selected, tag] })
      lockElement({ id: tagId, label: tag, prompt: `surface treatment: ${tag}` })
    }
  }

  return (
    <div>
      <p className="text-[10px] text-neutral-500 mb-1.5">表面处理</p>
      <div className="flex flex-wrap gap-1">
        {SURFACE_TREATMENTS.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={cn(
                'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                active
                  ? 'bg-locked/10 border-locked/40 text-locked'
                  : 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-400'
              )}
            >
              {active && <Pin size={8} />}
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────
export default function CMFSelector() {
  const { ipContext, updateIPContext } = useIPStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-4">
      {/* 材质预设网格 */}
      <MaterialGrid />

      {/* CMF 色板 */}
      <ColorPalette />

      {/* 基础参数滑块 */}
      <div className="space-y-2.5">
        <p className="text-[10px] text-neutral-500">表面参数</p>
        <ParamSlider
          label="粗糙度 Roughness"
          sublabel={ipContext.roughness < 0.2 ? '镜面' : ipContext.roughness > 0.7 ? '哑光' : ''}
          value={ipContext.roughness}
          onChange={(v) => updateIPContext({ roughness: v })}
          color="accent"
        />
        <ParamSlider
          label="金属度 Metalness"
          sublabel={ipContext.metalness > 0.7 ? '金属' : '非金属'}
          value={ipContext.metalness}
          onChange={(v) => updateIPContext({ metalness: v })}
          color="cyan"
        />
        <ParamSlider
          label="反射率 Reflectance"
          value={ipContext.reflectance}
          onChange={(v) => updateIPContext({ reflectance: v })}
          color="amber"
        />

        {/* 高级参数折叠 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          高级参数
        </button>
        {showAdvanced && (
          <ParamSlider
            label="透明度 Alpha"
            sublabel={ipContext.alpha < 0.3 ? '近透明' : ipContext.alpha > 0.9 ? '不透明' : '半透明'}
            value={ipContext.alpha}
            onChange={(v) => updateIPContext({ alpha: v })}
            color="rose"
          />
        )}
      </div>

      {/* 表面处理 */}
      <SurfaceTreatmentTags />
    </div>
  )
}
