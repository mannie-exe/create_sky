import '../styles/minimap.css'
import { readColorTokens } from './style-tokens'

type Bounds = { x1: number; y1: number; x2: number; y2: number }
type Point = { x: number; y: number; color?: string }
export function createMinimap(
  canvas: HTMLCanvasElement,
  navigate: (x: number, y: number) => void,
  keyboard: (e: KeyboardEvent) => void,
  preserveAspect = true,
) {
  const ctx = canvas.getContext('2d')!,
    base = document.createElement('canvas')
  base.width = canvas.width
  base.height = canvas.height
  let scaleX = 1,
    scaleY = 1,
    x = 0,
    y = 0
  let colors = readColorTokens(canvas, {
    item: '--minimap-item',
    viewport: '--map-viewport-line',
  })
  function setScene(bounds: Bounds, points: Point[]) {
    colors = readColorTokens(canvas, {
      item: '--minimap-item',
      viewport: '--map-viewport-line',
    })
    const w = Math.max(1, bounds.x2 - bounds.x1),
      h = Math.max(1, bounds.y2 - bounds.y1)
    scaleX = (canvas.width - 16) / w
    scaleY = (canvas.height - 16) / h
    if (preserveAspect) scaleX = scaleY = Math.min(scaleX, scaleY)
    x = (canvas.width - w * scaleX) / 2 - bounds.x1 * scaleX
    y = (canvas.height - h * scaleY) / 2 - bounds.y1 * scaleY
    const c = base.getContext('2d')!
    c.clearRect(0, 0, base.width, base.height)
    for (const p of points) {
      c.fillStyle = p.color || colors.item
      c.fillRect(p.x * scaleX + x, p.y * scaleY + y, 2, 2)
    }
  }
  function draw(extent: Bounds) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base, 0, 0)
    ctx.strokeStyle = colors.viewport
    ctx.lineWidth = 1.5
    ctx.strokeRect(
      extent.x1 * scaleX + x,
      extent.y1 * scaleY + y,
      Math.max(2, (extent.x2 - extent.x1) * scaleX),
      Math.max(2, (extent.y2 - extent.y1) * scaleY),
    )
  }
  function move(e: PointerEvent) {
    const r = canvas.getBoundingClientRect()
    navigate(
      (((e.clientX - r.left) * canvas.width) / r.width - x) / scaleX,
      (((e.clientY - r.top) * canvas.height) / r.height - y) / scaleY,
    )
  }
  const events = new AbortController()
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return
      canvas.focus()
      canvas.setPointerCapture(e.pointerId)
      move(e)
    },
    { signal: events.signal },
  )
  canvas.addEventListener(
    'pointermove',
    (e) => {
      if (canvas.hasPointerCapture(e.pointerId)) move(e)
    },
    { signal: events.signal },
  )
  const release = (e: PointerEvent) => {
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId)
  }
  canvas.addEventListener('pointerup', release, { signal: events.signal })
  canvas.addEventListener('pointercancel', release, { signal: events.signal })
  canvas.addEventListener('keydown', keyboard, { signal: events.signal })
  return {
    setScene,
    draw,
    destroy() {
      events.abort()
    },
  }
}

export function scrollNavigation(
  viewport: HTMLElement,
  canvas: HTMLCanvasElement,
) {
  function keyboard(e: KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-160, 0],
      ArrowRight: [160, 0],
      ArrowUp: [0, -160],
      ArrowDown: [0, 160],
    }
    if (moves[e.key]) {
      e.preventDefault()
      viewport.scrollBy(...moves[e.key])
    }
    if (e.key === 'Home') {
      e.preventDefault()
      viewport.scrollTo(0, 0)
    }
    if (e.key === 'End') {
      e.preventDefault()
      viewport.scrollTo(viewport.scrollWidth, viewport.scrollHeight)
    }
  }
  const mini = createMinimap(
    canvas,
    (x, y) =>
      viewport.scrollTo(
        x - viewport.clientWidth / 2,
        y - viewport.clientHeight / 2,
      ),
    keyboard,
    false,
  )
  viewport.addEventListener('keydown', (e) => {
    if (e.target === viewport) keyboard(e)
  })
  let drag: {
      id: number
      x: number
      y: number
      left: number
      top: number
      moved: boolean
    } | null = null,
    suppressClick = false
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    suppressClick = false
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      moved: false,
    }
  })
  viewport.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < 5) return
    if (!drag.moved) {
      viewport.setPointerCapture(e.pointerId)
      drag.moved = true
      viewport.classList.add('panning')
    }
    viewport.scrollTo(drag.left - dx, drag.top - dy)
    e.preventDefault()
  })
  function end(e: PointerEvent) {
    if (!drag || drag.id !== e.pointerId) return
    suppressClick = drag.moved
    drag = null
    viewport.classList.remove('panning')
    if (viewport.hasPointerCapture(e.pointerId))
      viewport.releasePointerCapture(e.pointerId)
  }
  viewport.addEventListener('pointerup', end)
  viewport.addEventListener('pointercancel', end)
  viewport.addEventListener('pointerleave', (e) => {
    if (drag && !drag.moved) end(e)
  })
  viewport.addEventListener(
    'click',
    (e) => {
      if (suppressClick) {
        e.preventDefault()
        e.stopImmediatePropagation()
        suppressClick = false
      }
    },
    true,
  )
  return {
    setScene: mini.setScene,
    draw() {
      mini.draw({
        x1: viewport.scrollLeft,
        y1: viewport.scrollTop,
        x2: viewport.scrollLeft + viewport.clientWidth,
        y2: viewport.scrollTop + viewport.clientHeight,
      })
    },
  }
}
