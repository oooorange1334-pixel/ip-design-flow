import { useState } from 'react'
import { Pin, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'
import { MATERIAL_PRESETS, SURFACE_TREATMENTS, MATERIAL_GROUPS } from './MaterialPresets'

// ── 颜色色槽 ─────────────────────────────────────────────
function ColorPalette() {
  const { ipContext, updateIPContext } = useProject()
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
      <p className="text-[14px] text-neutral-400 mb-1.5">CMF 色板</p>
      <div className="flex gap-1.5">
        {palette.map((hex, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-6 rounded-lg border border-glass-edge cursor-pointer transition-transform hover:scale-110"
              style={{ background: hex || 'rgba(28,33,46,0.6)' }}
              title={hex || '未设置'}
            />
            <input
              type="text"
              maxLength={7}
              placeholder="#hex"
              value={hex}
              onChange={(e) => updateColor(i, e.target.value)}
              className="w-full bg-transparent text-[14px] font-mono text-neutral-600 text-center focus:outline-none focus:text-neutral-300 placeholder-neutral-800 border-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 参数滑块 ──────────────────────────────────────────────
function ParamSlider({ label, sublabel, value, onChange, color = 'accent' }) {
  // 主色映射（霓虹辉光滑块经 CSS 变量 --c 上色）
  const COLOR_HEX = {
    accent: '#7C4DFF',
    cyan:   '#22D3EE',
    amber:  '#F59E0B',
    rose:   '#FB7185',
  }
  const c = COLOR_HEX[color] ?? COLOR_HEX.accent
  const v = Number.isFinite(value) ? value : 0   // 兜底，防 undefined 崩溃
  const fill = `${Math.round(v * 100)}%`

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[14px] text-neutral-300">{label}</span>
        <div className="flex items-center gap-1.5">
          {sublabel && (
            <span
              className="text-[14px] px-1.5 py-px rounded-full"
              style={{ color: c, background: `${c}1a` }}
            >
              {sublabel}
            </span>
          )}
          <span className="text-[14px] font-mono w-9 text-right" style={{ color: c }}>
            {v.toFixed(2)}
          </span>
        </div>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="vibe-slider"
        style={{ '--c': c, '--fill': fill }}
      />
    </div>
  )
}

// ── 材质网格 ──────────────────────────────────────────────
function MaterialGrid() {
  const { ipContext, updateIPContext } = useProject()
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
      <p className="text-[14px] text-neutral-400 mb-1.5">材质预设</p>
      {/* 分组 tab */}
      <div className="flex gap-1 mb-2 p-0.5 rounded-lg glass-card">
        {MATERIAL_GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={cn(
              'flex-1 text-[14px] py-1 rounded-md transition-all',
              activeGroup === g
                ? 'bg-accent text-white shadow-neon-purple-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            {g}
          </button>
        ))}
      </div>
      {/* 材质网格 4列 */}
      <div className="grid grid-cols-4 gap-1.5">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={cn(
              'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all glass-card',
              selectedId === preset.id || ipContext.material === preset.label
                ? 'neon-ring'
                : 'glass-card-hover'
            )}
            title={preset.label}
          >
            {/* 材质色块 */}
            <div
              className="w-6 h-6 rounded-full border border-glass-edge shrink-0"
              style={{
                background: preset.color,
                boxShadow: preset.metalness > 0.7
                  ? `inset -2px -2px 4px rgba(0,0,0,0.5), inset 2px 2px 4px rgba(255,255,255,${preset.reflectance * 0.3})`
                  : 'none',
              }}
            />
            <span className="text-[14px] text-neutral-400 text-center leading-tight line-clamp-2">
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
  const { ipContext, updateIPContext, lockElement, unlockElement, lockedElements } = useProject()
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
      <p className="text-[14px] text-neutral-400 mb-1.5">表面处理</p>
      <div className="flex flex-wrap gap-1">
        {SURFACE_TREATMENTS.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={cn(
                'flex items-center gap-1 text-[14px] px-2 py-1 rounded-full border transition-all',
                active
                  ? 'bg-locked/15 border-locked/50 text-locked shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                  : 'glass-card text-neutral-400 hover:text-neutral-200 glass-card-hover'
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
  const { ipContext, updateIPContext } = useProject()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-4">
      {/* 材质预设网格 */}
      <MaterialGrid />

      {/* CMF 色板 */}
      <ColorPalette />

      {/* 基础参数滑块 */}
      <div className="space-y-3">
        <p className="text-[14px] text-neutral-400">表面参数</p>
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
          className="flex items-center gap-1 text-[14px] text-neutral-500 hover:text-accent transition-colors"
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
