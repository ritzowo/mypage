import { useEffect, useRef } from 'react'

const CELL = 16
const FADE_MS = 600
const GRAY = 255
const GAP_MS = 150 // この時間以上 move が空いたら補間を切る(タブ復帰など)

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

    const lit = new Map<string, number>() // "col,row" -> 点灯時刻
    let lastCell: { col: number; row: number } | null = null
    let lastMoveAt = 0

    const onMove = (e: PointerEvent) => {
      if (!document.hasFocus()) return

      const now = performance.now()
      const col = Math.floor(e.clientX / CELL)
      const row = Math.floor(e.clientY / CELL)

      const gapTooLong = now - lastMoveAt > GAP_MS
      lastMoveAt = now

      if (
        lastCell &&
        !gapTooLong &&
        (lastCell.col !== col || lastCell.row !== row)
      ) {
        // Bresenham で前セルから現セルまでを辿る(斜めも角セルを出さない)
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
        }
      } else {
        lit.set(`${col},${row}`, now)
      }
      lastCell = { col, row }
    }

    const onLeave = () => {
      lastCell = null
    }

    let raf = 0
    const render = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cellPx = Math.round(CELL * dpr)

      for (const [key, litAt] of lit) {
        const alpha = 1 - (now - litAt) / FADE_MS
        if (alpha <= 0) {
          lit.delete(key)
          continue
        }
        const [col, row] = key.split(',').map(Number)
        const x = Math.round(col * CELL * dpr)
        const y = Math.round(row * CELL * dpr)
        ctx.fillStyle = `rgba(${GRAY}, ${GRAY}, ${GRAY}, ${alpha})`
        ctx.fillRect(x, y, cellPx, cellPx)
      }

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    document.addEventListener('visibilitychange', onLeave)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
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
