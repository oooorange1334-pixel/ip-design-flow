/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          950: '#0d1117',   // 最深底色（画布背景）
          900: '#161b22',   // 面板/侧边栏背景
          800: '#1c2128',   // 卡片/输入框背景
          700: '#22272e',   // 悬浮/选中背景
          600: '#2d333b',   // 次级边框色
        },
        // ── Vibe OS 玻璃拟物 Design Tokens ──────────────────
        // 深空碳黑底色 + 半透明玻璃层 + 霓虹紫/青强调
        vibe: {
          base:   '#0B0D13',                       // 碳黑根背景
          glass:  'rgba(20, 24, 34, 0.55)',        // 主玻璃面板（配合 backdrop-blur）
          'glass-strong': 'rgba(16, 19, 28, 0.78)',// 强玻璃（更不透明）
          'glass-soft':   'rgba(28, 33, 46, 0.40)',// 轻玻璃（嵌套卡片）
        },
        // 玻璃面板内描边（1px 内描边制造深度）
        'glass-edge':       'rgba(255, 255, 255, 0.08)',
        'glass-edge-strong':'rgba(255, 255, 255, 0.14)',
        // 边框语义色（平铺，避免与 Tailwind border 工具类冲突）
        'line':        '#30363d',   // 主边框 → border-line
        'line-subtle': '#21262d',   // 次级边框 → border-line-subtle
        'line-strong': '#444c56',   // 强调边框 → border-line-strong
        accent: {
          DEFAULT: '#7C4DFF',       // 电光霓虹紫（对齐规范）
          hover:   '#6a3dff',
          soft:    '#7C4DFF22',
          muted:   '#7C4DFF30',
        },
        neon: {
          purple: '#7C4DFF',
          cyan:   '#22D3EE',
        },
        locked:   '#f59e0b',
        generate: '#22d3ee',
      },
      // 毛玻璃模糊强度
      backdropBlur: {
        vibe: '16px',
      },
      // 霓虹辉光阴影
      boxShadow: {
        'neon-purple':     '0 0 0 1px rgba(124,77,255,0.35), 0 0 16px rgba(124,77,255,0.35)',
        'neon-purple-sm':  '0 0 8px rgba(124,77,255,0.45)',
        'neon-cyan-sm':    '0 0 8px rgba(34,211,238,0.45)',
        'glass':           '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg':   ['16px', { lineHeight: '24px' }],
        'xl':   ['18px', { lineHeight: '28px' }],
      },
      // 统一小圆角
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
    },
  },
  plugins: [],
}
