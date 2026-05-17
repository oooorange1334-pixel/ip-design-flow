// 模拟生成 API — 预留 ComfyUI / Replicate 接口结构
// 真实接入时替换 simulateRequest 函数体

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/ip1/512/512',
  'https://picsum.photos/seed/ip2/512/512',
  'https://picsum.photos/seed/ip3/512/512',
  'https://picsum.photos/seed/ip4/512/512',
]

function getPlaceholder() {
  return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]
}

async function simulateRequest(prompt, _params, signal) {
  const delay = 1500 + Math.random() * 1500
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, delay)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Generation cancelled', 'AbortError'))
    })
  })
  return {
    imageUrl: getPlaceholder(),
    seed: Math.floor(Math.random() * 999999),
    prompt,
  }
}

// Phase 1 步骤对应的生成入口
export async function generateConcept(ipContext, lockedElements, signal) {
  const prompt = buildPrompt(ipContext, lockedElements)
  return simulateRequest(prompt, { steps: 30, cfg: 7 }, signal)
}

export async function generateTripleView(imageUrl, lockedElements, signal) {
  const prompt = `orthographic three-view technical illustration, front side back, locked: ${lockedElements.map(e => e.label).join(', ')}`
  return simulateRequest(prompt, { steps: 40, cfg: 7.5, controlnet: imageUrl }, signal)
}

// 独立三视图集（三张并行生成）
export async function generateTripleViewSet(referenceUrl, ipContext, lockedElements, signal) {
  const base = buildPrompt(ipContext, lockedElements)
  const viewPrompts = [
    `front orthographic view, facing camera, ${base}`,
    `side orthographic view, 90deg profile, ${base}`,
    `back orthographic view, rear facing, ${base}`,
  ]
  const seeds = [
    Math.floor(Math.random() * 999999),
    Math.floor(Math.random() * 999999),
    Math.floor(Math.random() * 999999),
  ]
  // 模拟三张图并行生成，每张随机延迟略有差异
  const [frontRes, sideRes, backRes] = await Promise.all(
    viewPrompts.map((p, i) =>
      simulateRequest(p, { steps: 40, cfg: 7.5, controlnet: referenceUrl, seed: seeds[i] }, signal)
    )
  )
  return {
    front: frontRes.imageUrl,
    side:  sideRes.imageUrl,
    back:  backRes.imageUrl,
    seed: seeds[0],
  }
}

// 内部 Prompt 构建器 — 封装隐性 Prompt 工程
function buildPrompt(ipContext, lockedElements) {
  const parts = []
  if (ipContext.personality) parts.push(ipContext.personality)
  if (ipContext.material) parts.push(`material: ${ipContext.material}`)
  if (ipContext.accent) parts.push(`accent: ${ipContext.accent}`)
  if (ipContext.metalness > 0.5) parts.push('highly metallic surface')
  if (ipContext.roughness < 0.3) parts.push('polished glossy finish')
  else if (ipContext.roughness > 0.7) parts.push('matte rough surface')
  lockedElements.forEach(el => parts.push(`[LOCKED] ${el.prompt}`))
  parts.push('IP character design, concept art, professional illustration, studio lighting')
  return parts.join(', ')
}
