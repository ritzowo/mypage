import { useEffect, useRef } from 'react'

const CELL = 16
const SUB = 4
const FADE_MS = 600
const GRAY = 255
const GAP_MS = 150

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

function PixelCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const noHover = window.matchMedia('(hover: none)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (noHover || reduce) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.max(1, window.devicePixelRatio || 1)

    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()

    const lit = new Map<string, number>()
    const held = new Set<string>()
    let lastCell: { col: number; row: number } | null = null
    let lastMoveAt = 0
    let pressing = false

    const onMove = (e: PointerEvent) => {
      if (!document.hasFocus()) return

      const now = performance.now()
      const col = Math.floor(e.clientX / CELL)
      const row = Math.floor(e.clientY / CELL)

      const gapTooLong = now - lastMoveAt > GAP_MS
      lastMoveAt = now

      if (
        lastCell &&
        (pressing || !gapTooLong) &&
        (lastCell.col !== col || lastCell.row !== row)
      ) {

        let x0 = lastCell.col
        let y0 = lastCell.row
        const dx = Math.abs(col - x0)
        const dy = Math.abs(row - y0)
        const sx = x0 < col ? 1 : -1
        const sy = y0 < row ? 1 : -1
        let err = dx - dy
        for (;;) {
          if (x0 === col && y0 === row) break
          const e2 = 2 * err
          if (e2 > -dy) {
            err -= dy
            x0 += sx
          }
          if (e2 < dx) {
            err += dx
            y0 += sy
          }
          lit.set(`${x0},${y0}`, now)
          if (pressing) held.add(`${x0},${y0}`)
        }
      } else {
        lit.set(`${col},${row}`, now)
      }
      lastCell = { col, row }
      if (pressing) held.add(`${col},${row}`)
    }

    const onDown = (e: PointerEvent) => {
      if (!document.hasFocus()) return
      pressing = true
      const col = Math.floor(e.clientX / CELL)
      const row = Math.floor(e.clientY / CELL)
      held.add(`${col},${row}`)
      lastCell = { col, row }
      lastMoveAt = performance.now()
    }

    const onUp = () => {
      pressing = false
      held.clear()
    }

    const onLeave = () => {
      lastCell = null
      pressing = false
      held.clear()
    }

    let raf = 0
    const render = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = `rgb(${GRAY}, ${GRAY}, ${GRAY})`

      const subPx = Math.round(SUB * dpr)

      const paintCell = (col: number, row: number, level: number) => {
        const cellX = col * CELL * dpr
        const cellY = row * CELL * dpr
        for (let by = 0; by < SUB; by++) {
          for (let bx = 0; bx < SUB; bx++) {
            if (BAYER[by][bx] < level) {
              const x = Math.round(cellX + bx * SUB * dpr)
              const y = Math.round(cellY + by * SUB * dpr)
              ctx.fillRect(x, y, subPx, subPx)
            }
          }
        }
      }

      for (const [key, litAt] of lit) {
        const alpha = 1 - (now - litAt) / FADE_MS
        if (alpha <= 0) {
          lit.delete(key)
          continue
        }

        const level = Math.ceil(alpha * 16)
        const [col, row] = key.split(',').map(Number)
        paintCell(col, row, level)
      }

      for (const key of held) {
        const [col, row] = key.split(',').map(Number)
        paintCell(col, row, 16)
      }

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    document.addEventListener('visibilitychange', onLeave)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      document.removeEventListener('visibilitychange', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
      }}
    />
  )
}

export default PixelCursorTrail
