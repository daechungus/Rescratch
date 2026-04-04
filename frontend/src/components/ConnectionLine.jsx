import { motion } from 'framer-motion'
import { useCanvas } from '../hooks/useCanvas.js'

const BLOCK_WIDTH = 200
const FALLBACK_HALF_H = 44

/**
 * An SVG bezier connection between two canvas blocks.
 * fromBlock / toBlock: canvas block objects with x, y, height (measured).
 * conn: { id, fromInstanceId, toInstanceId }
 */
export function ConnectionLine({ conn, fromBlock, toBlock, isInvalid = false }) {
  const { removeConnection } = useCanvas()

  if (!fromBlock || !toBlock) return null

  // Port circles are w-4 (16px), output at right:-8, input at left:-8
  // Output port right edge  = block.x + BLOCK_WIDTH + 8  (start line here)
  // Input  port left edge   = block.x - 8                (arrowhead tip here)
  const x1 = fromBlock.x + BLOCK_WIDTH + 8   // right edge of output port circle
  const y1 = fromBlock.y + (fromBlock.height != null ? fromBlock.height / 2 : FALLBACK_HALF_H)
  const x2 = toBlock.x - 8                    // left edge of input port circle
  const y2 = toBlock.y + (toBlock.height != null ? toBlock.height / 2 : FALLBACK_HALF_H)

  const cx1 = x1 + Math.max(60, Math.abs(x2 - x1) * 0.4)
  const cx2 = x2 - Math.max(60, Math.abs(x2 - x1) * 0.4)

  const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`

  const strokeColor = isInvalid ? '#ef4444' : '#6366f1'
  const strokeWidth = 2.5

  return (
    <g className="group" style={{ cursor: 'pointer' }} onClick={() => removeConnection(conn.id)}>
      {/* Invisible wider hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={16} />

      {/* Visible line */}
      <motion.path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group-hover:stroke-red-400 transition-colors"
      />

      {/* Arrowhead pointing right, tip at input port left edge */}
      <polygon
        points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`}
        fill={strokeColor}
        className="group-hover:fill-red-400 transition-colors"
      />

      {/* Delete hint on hover */}
      <title>Click to delete this connection</title>
    </g>
  )
}
