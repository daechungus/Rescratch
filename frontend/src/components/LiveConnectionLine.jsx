import { useEffect, useState } from 'react'

const BLOCK_WIDTH = 200
const BLOCK_HEADER_HEIGHT = 32
const BLOCK_BODY_HEIGHT = 56
const HALF_BLOCK_H = (BLOCK_HEADER_HEIGHT + BLOCK_BODY_HEIGHT) / 2

/**
 * A bezier line that follows the mouse cursor while the user is in
 * connection-drawing mode (connectingFrom is set).
 */
export function LiveConnectionLine({ fromBlock, canvasRef }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function onMouseMove(e) {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [canvasRef])

  if (!fromBlock) return null

  const x1 = fromBlock.x + BLOCK_WIDTH + 8
  const y1 = fromBlock.y + HALF_BLOCK_H
  const x2 = mousePos.x
  const y2 = mousePos.y

  const cx1 = x1 + Math.max(40, Math.abs(x2 - x1) * 0.4)
  const cx2 = x2 - Math.max(40, Math.abs(x2 - x1) * 0.4)

  const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`

  return (
    <path
      d={d}
      fill="none"
      stroke="#6366f1"
      strokeWidth={2}
      strokeDasharray="6 4"
      strokeLinecap="round"
      opacity={0.7}
      style={{ pointerEvents: 'none' }}
    />
  )
}
