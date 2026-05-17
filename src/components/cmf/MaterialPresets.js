export const MATERIAL_PRESETS = [
  // ── 金属系 ────────────────────────────────
  { id: 'matte-metal',      label: '哑光金属',    roughness: 0.80, metalness: 1.00, reflectance: 0.30, color: '#7a7a7a', group: '金属' },
  { id: 'polished-chrome',  label: '镜面铬',      roughness: 0.04, metalness: 1.00, reflectance: 0.98, color: '#d8d8d8', group: '金属' },
  { id: 'brushed-steel',    label: '拉丝钢',      roughness: 0.40, metalness: 0.95, reflectance: 0.65, color: '#9a9a9a', group: '金属' },
  { id: 'anodized-black',   label: '阳极氧化',    roughness: 0.30, metalness: 0.70, reflectance: 0.45, color: '#1e1e1e', group: '金属' },
  { id: 'bronze-patina',    label: '青铜锈',      roughness: 0.72, metalness: 0.60, reflectance: 0.40, color: '#7a5c14', group: '金属' },
  { id: 'gold-leaf',        label: '金箔',        roughness: 0.15, metalness: 1.00, reflectance: 0.92, color: '#c9a84c', group: '金属' },
  { id: 'titanium',         label: '钛合金',      roughness: 0.35, metalness: 0.90, reflectance: 0.60, color: '#8c8c96', group: '金属' },
  { id: 'copper',           label: '纯铜',        roughness: 0.22, metalness: 1.00, reflectance: 0.88, color: '#b87333', group: '金属' },

  // ── 非金属 ────────────────────────────────
  { id: 'carbon-fiber',     label: '碳纤维',      roughness: 0.20, metalness: 0.00, reflectance: 0.35, color: '#1c1c1c', group: '非金属' },
  { id: 'rubber-matte',     label: '橡胶哑光',    roughness: 0.95, metalness: 0.00, reflectance: 0.02, color: '#2a2a2a', group: '非金属' },
  { id: 'abs-plastic',      label: 'ABS 塑料',   roughness: 0.55, metalness: 0.00, reflectance: 0.18, color: '#c8c8c8', group: '非金属' },
  { id: 'soft-touch',       label: '软触感涂层',  roughness: 0.90, metalness: 0.00, reflectance: 0.05, color: '#3a3a3a', group: '非金属' },

  // ── 透明/半透明 ───────────────────────────
  { id: 'clear-glass',      label: '清透玻璃',    roughness: 0.02, metalness: 0.00, reflectance: 0.85, color: '#e8f4f8', alpha: 0.15, group: '透明' },
  { id: 'frosted-glass',    label: '磨砂玻璃',    roughness: 0.60, metalness: 0.00, reflectance: 0.55, color: '#ccd8e0', alpha: 0.45, group: '透明' },
  { id: 'resin',            label: '环氧树脂',    roughness: 0.10, metalness: 0.00, reflectance: 0.70, color: '#f0e8c8', alpha: 0.60, group: '透明' },
  { id: 'crystal',          label: '水晶',        roughness: 0.01, metalness: 0.00, reflectance: 0.95, color: '#e8f0ff', alpha: 0.25, group: '透明' },

  // ── 特殊效果 ──────────────────────────────
  { id: 'iridescent',       label: '镭射/炫彩',  roughness: 0.10, metalness: 0.60, reflectance: 0.90, color: '#b088ff', group: '特效' },
  { id: 'velvet',           label: '植绒',        roughness: 0.98, metalness: 0.00, reflectance: 0.01, color: '#4a2a5a', group: '特效' },
  { id: 'ceramic-gloss',    label: '高光陶瓷',    roughness: 0.05, metalness: 0.00, reflectance: 0.80, color: '#f4f4f4', group: '特效' },
  { id: 'wood-natural',     label: '原木',        roughness: 0.75, metalness: 0.00, reflectance: 0.08, color: '#8b6340', group: '特效' },
]

export const SURFACE_TREATMENTS = [
  '喷砂', '电镀', '阳极氧化', '抛光', '拉丝',
  '烤漆', 'PVD 镀膜', '镭雕', '皮纹', '橘纹',
]

export const MATERIAL_GROUPS = ['金属', '非金属', '透明', '特效']
