import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Send, X, ChevronDown, Image as ImageIcon,
  Type, Cpu, Ratio, Gauge, Loader2, Plus, Trash2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'

const MODELS  = ['GLM-5.2', 'GLM-4V', 'SDXL', 'Flux.1', 'DALL·E 3']
const RATIOS  = ['1:1', '4:3', '3:4', '16:9', '9:16']
const CLARITY = ['标清', '高清', '超清']

// 下拉选择器
function Selector({ icon: Icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex-1 min-w-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-card glass-card-hover text-left"
      >
        <Icon size={12} className="text-neutral-500 shrink-0" />
        <span className="flex-1 min-w-0 truncate text-[12px] text-neutral-200">{value}</span>
        <ChevronDown size={11} className={cn('text-neutral-500 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 w-full glass-strong rounded-lg z-50 overflow-hidden p-1"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <p className="text-[11px] text-neutral-500 px-2 py-1">{label}</p>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  'w-full text-left px-2 py-1.5 rounded-md text-[12px] transition-colors',
                  opt === value ? 'bg-accent/20 text-accent' : 'text-neutral-300 hover:bg-white/[0.05]'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 参考节点芯片
function RefChip({ ref, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 glass-card rounded-lg pl-1.5 pr-1 py-1 shrink-0 max-w-[140px]">
      {ref.kind === 'image' && ref.imageUrl ? (
        <img src={ref.imageUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
      ) : (
        <span className="w-5 h-5 rounded bg-accent-soft flex items-center justify-center shrink-0">
          <Type size={10} className="text-accent" />
        </span>
      )}
      <span className="text-[12px] text-neutral-200 truncate">{ref.label}</span>
      <button onClick={() => onRemove(ref.id)} className="text-neutral-500 hover:text-red-400 shrink-0">
        <X size={11} />
      </button>
    </div>
  )
}

// 单条消息
function MessageBubble({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {msg.refs?.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end max-w-[85%]">
            {msg.refs.map(r => (
              <span key={r.id} className="text-[11px] px-1.5 py-0.5 rounded-md glass-card text-neutral-400">
                @{r.label}
              </span>
            ))}
          </div>
        )}
        <div className="max-w-[85%] rounded-xl rounded-tr-sm px-3 py-2 text-[13px] text-white"
          style={{ background: 'linear-gradient(90deg,#7C4DFF,#5E35B1)' }}>
          {msg.text}
        </div>
      </div>
    )
  }
  // AI
  return (
    <div className="flex flex-col items-start gap-1.5 max-w-[90%]">
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
        <Sparkles size={11} className="text-accent" /> AI
      </div>
      {msg.status === 'loading' ? (
        <div className="rounded-xl glass-card px-3 py-2.5 flex items-center gap-2 text-[13px] text-neutral-400">
          <Loader2 size={13} className="animate-spin text-accent" />
          {msg.text}
        </div>
      ) : (
        <div className="rounded-xl glass-card overflow-hidden">
          {msg.imageUrl && (
            <img src={msg.imageUrl} alt={msg.text} className="w-full object-cover" style={{ maxHeight: 220 }} />
          )}
          <div className="px-2.5 py-2">
            <p className="text-[12px] text-neutral-300">{msg.text}</p>
            {msg.result && (
              <p className="text-[11px] text-neutral-500 mt-1">
                {msg.result.model} · {msg.result.ratio} · {msg.result.clarity} · 已加入画布
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GenerateChatPanel() {
  const { chat, addChatRef, removeChatRef, setChatConfig, sendChatPrompt, clearChat, rfNodes } = useProject()
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  const { refs, messages, model, ratio, clarity } = chat

  // 画布上当前被选中的思维导图节点（可一键加入参考）
  const selectedMind = rfNodes.filter(
    n => n.selected && (n.type === 'mindText' || n.type === 'mindImage')
  )
  const unaddedSelected = selectedMind.filter(n => !refs.some(r => r.id === n.id))

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setBusy(true)
    try { await sendChatPrompt(text) } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-4 pt-4 pb-3 divider-x shrink-0 flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-accent-soft shadow-neon-purple-sm">
          <Sparkles size={11} className="text-accent" />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-neutral-100">AI 生成</p>
          <p className="text-[12px] text-neutral-500">选中画布节点加入参考，对话生成图片</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} title="清空对话"
            className="text-neutral-500 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* 消息流 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-2">
            <span className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center shadow-neon-purple-sm">
              <ImageIcon size={16} className="text-accent" />
            </span>
            <div className="space-y-1">
              <p className="text-[13px] font-medium text-neutral-300">从画布选取灵感，生成 IP 形象</p>
              <p className="text-[12px] text-neutral-500 leading-relaxed">
                点击中间画布的思维导图节点 → 加入参考<br />输入描述并发送 → 生成图片回到画布
              </p>
            </div>
          </div>
        ) : (
          messages.map(m => <MessageBubble key={m.id} msg={m} />)
        )}
      </div>

      {/* 选中节点快捷加入 */}
      {unaddedSelected.length > 0 && (
        <div className="px-3 pb-1 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {unaddedSelected.map(n => (
              <button
                key={n.id}
                onClick={() => addChatRef(n)}
                className="flex items-center gap-1 text-[12px] px-2 py-1 rounded-lg glass-card glass-card-hover text-neutral-300"
              >
                <Plus size={11} className="text-accent" />
                {n.type === 'mindImage' ? '图片' : ''}{(n.data?.label ?? '节点')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区 */}
      <div className="p-3 shrink-0 space-y-2 divider-t">
        {/* 参考节点区 */}
        {refs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {refs.map(r => <RefChip key={r.id} ref={r} onRemove={removeChatRef} />)}
          </div>
        )}

        {/* 配置行 */}
        <div className="flex gap-1.5">
          <Selector icon={Cpu}   label="模型" value={model}   options={MODELS}  onChange={v => setChatConfig({ model: v })} />
          <Selector icon={Ratio} label="比例" value={ratio}   options={RATIOS}  onChange={v => setChatConfig({ ratio: v })} />
          <Selector icon={Gauge} label="清晰度" value={clarity} options={CLARITY} onChange={v => setChatConfig({ clarity: v })} />
        </div>

        {/* 输入框 + 发送 */}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            rows={1}
            placeholder="描述想生成的画面，Enter 发送..."
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 96 }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.55)'; e.target.style.boxShadow = '0 0 0 1px rgba(124,77,255,0.35)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || busy}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
              input.trim() && !busy ? 'cta-primary' : 'glass-card text-neutral-600 cursor-not-allowed'
            )}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
