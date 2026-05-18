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
        // 边框语义色（平铺，避免与 Tailwind border 工具类冲突）
        'line':        '#30363d',   // 主边框 → border-line
        'line-subtle': '#21262d',   // 次级边框 → border-line-subtle
        'line-strong': '#444c56',   // 强调边框 → border-line-strong
        accent: {
          DEFAULT: '#7c5af0',
          hover:   '#6d4ee0',
          muted:   '#7c5af030',
        },
        locked:   '#f59e0b',
        generate: '#22d3ee',
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
