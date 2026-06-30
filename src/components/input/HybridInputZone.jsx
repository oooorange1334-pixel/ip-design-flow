import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Search, FileText, Image, FileSpreadsheet, Loader2, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import useProject from '../../store/useProject'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
}

const QUICK_TAGS = ['首钢园', '赛博朋克', '生物机械', '极简建筑', '工业锈蚀', '深海生物']

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={12} className="text-blue-400" />
  if (type?.includes('pdf'))        return <FileText size={12} className="text-red-400" />
  return <FileSpreadsheet size={12} className="text-orange-400" />
}

function FileBadge({ file, onRemove }) {
  const sizeKB = (file.size / 1024).toFixed(0)
  return (
    <div className="flex items-center gap-1.5 glass-card rounded-lg px-2 py-1 group">
      <FileIcon type={file.type} />
      <span className="text-[14px] text-neutral-300 max-w-[100px] truncate">{file.name}</span>
      <span className="text-[14px] text-neutral-500">{sizeKB}k</span>
      <button
        onClick={() => onRemove(file.name)}
        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-neutral-200 transition-all ml-0.5"
      >
        <X size={9} />
      </button>
    </div>
  )
}

export default function HybridInputZone() {
  const { knowledgeGraph, simulateKnowledgeExtraction } = useProject()
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState([])

  const isExtracting = knowledgeGraph.isExtracting

  const onDrop = useCallback((accepted) => {
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...accepted.filter(f => !names.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    noClick: true,       // 点击不触发（内部有独立触发区）
    noKeyboard: true,
  })

  function removeFile(name) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  function handleExtract() {
    if (isExtracting) return
    if (!query.trim() && files.length === 0) return
    simulateKnowledgeExtraction(query.trim(), files)
  }

  const canExtract = (query.trim().length > 0 || files.length > 0) && !isExtracting

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-xl transition-all duration-200',
        isDragActive
          ? 'neon-ring bg-accent/5'
          : 'glass-card',
        isExtracting && 'pointer-events-none'
      )}
    >
      <input {...getInputProps()} />

      {/* 拖拽高亮遮罩 */}
      {isDragActive && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-accent/5 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles size={18} className="text-accent" />
            </div>
            <p className="text-[15px] text-accent font-medium">松开以添加文件</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* 搜索输入行 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
              placeholder="输入灵感关键词，或拖入 PDF / PPT / 图片..."
              disabled={isExtracting}
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-[14px] text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,77,255,0.55)'; e.target.style.boxShadow = '0 0 0 1px rgba(124,77,255,0.35), 0 0 14px rgba(124,77,255,0.22)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* 文件选择按钮 */}
          <label className={cn(
            'px-3 py-2.5 rounded-xl text-[14px] font-medium cursor-pointer transition-all shrink-0 flex items-center',
            'glass-card glass-card-hover text-neutral-400 hover:text-neutral-200',
            isExtracting && 'opacity-40 cursor-not-allowed'
          )}>
            + 文件
            <input
              type="file"
              multiple
              accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              disabled={isExtracting}
              onChange={e => onDrop([...e.target.files])}
            />
          </label>

          {/* 提取按钮 */}
          <button
            onClick={handleExtract}
            disabled={!canExtract}
            className={cn(
              'w-11 rounded-xl flex items-center justify-center transition-all shrink-0',
              canExtract ? 'cta-primary' : 'glass-card text-neutral-600 cursor-not-allowed'
            )}
          >
            {isExtracting
              ? <Loader2 size={14} className="animate-spin" />
              : <Sparkles size={14} />
            }
          </button>
        </div>

        {/* 已附加文件列表 */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map(f => (
              <FileBadge key={f.name} file={f} onRemove={removeFile} />
            ))}
          </div>
        )}

        {/* 快捷标签（弱化处理） */}
        {!isExtracting && (
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); simulateKnowledgeExtraction(tag, files) }}
                className="muted-tag text-[13px] px-2.5 py-1 rounded-full"
              >
                {tag}
              </button>
            ))}
            <span className="text-[13px] text-neutral-600 px-1">或拖入文件</span>
          </div>
        )}

        {/* 提取中状态 */}
        {isExtracting && (
          <div className="flex items-center gap-2.5 py-1">
            <div className="relative w-4 h-4 shrink-0">
              <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping" />
              <div className="absolute inset-0.5 rounded-full border border-t-accent border-transparent animate-spin" />
            </div>
            <div>
              <p className="text-[14px] text-neutral-300">
                正在提取文档世界观与视觉资产
                <span className="text-neutral-500"> · {knowledgeGraph.sourceLabel}</span>
              </p>
              <p className="text-[13px] text-neutral-600 mt-0.5">解析 Form · CMF · Motif · 语义关键词...</p>
            </div>
          </div>
        )}

        {/* 完成提示 */}
        {knowledgeGraph.sourceLabel && !isExtracting && (
          <p className="text-[13px] text-neutral-500">
            ✓ 已解析「{knowledgeGraph.sourceLabel}」· 知识图谱已展示在画布
          </p>
        )}
      </div>
    </div>
  )
}
