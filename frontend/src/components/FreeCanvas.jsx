import { useRef } from 'react'
import { useStore } from '../store.js'
import { useCanvas } from '../hooks/useCanvas.js'
import { CanvasBlock } from './CanvasBlock.jsx'
import { ConnectionLine } from './ConnectionLine.jsx'
import { LiveConnectionLine } from './LiveConnectionLine.jsx'

const CANVAS_W = 2400
const CANVAS_H = 1400
const BLOCK_WIDTH = 200
const BLOCK_HALF_H = 44   // approx half of (header + body) height

export function FreeCanvas() {
  const canvasBlocks = useStore((s) => s.canvasBlocks)
  const connections = useStore((s) => s.connections)
  const connectingFrom = useStore((s) => s.connectingFrom)
  const liveValidation = useStore((s) => s.liveValidation)
  const currentChallenge = useStore((s) => s.currentChallenge)
  const removeConnection = useStore((s) => s.removeConnection)
  const { onCanvasClick } = useCanvas()
  const canvasRef = useRef(null)

  // Build per-category error/warning maps for live badges
  const errorsByCategory = {}
  const warningsByCategory = {}
  for (const e of liveValidation.errors || []) {
    if (!errorsByCategory[e.category]) errorsByCategory[e.category] = []
    errorsByCategory[e.category].push(e)
  }
  for (const w of liveValidation.warnings || []) {
    if (!warningsByCategory[w.category]) warningsByCategory[w.category] = []
    warningsByCategory[w.category].push(w)
  }

  const fromBlock = connectingFrom
    ? canvasBlocks.find((b) => b.instanceId === connectingFrom)
    : null

  const isBrokenLab = currentChallenge?.type === 'broken_lab'

  return (
    <div
      className="flex-1 overflow-auto bg-gray-100 relative"
      style={{ cursor: connectingFrom ? 'crosshair' : 'default' }}
    >
      {/* Broken Lab banner */}
      {isBrokenLab && (
        <div className="sticky top-0 left-0 right-0 z-30 bg-red-600 text-white text-center text-sm font-bold py-2 shadow-lg">
          🔴 BROKEN LAB MODE — Find and fix the flawed methodology before submitting
        </div>
      )}

      {/* Empty state */}
      {canvasBlocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-3">🧪</div>
            <div className="text-lg font-semibold">Your lab bench is empty</div>
            <div className="text-sm mt-1">Click blocks in the library on the left to add them here</div>
          </div>
        </div>
      )}

      {/* Main scrollable canvas */}
      <div
        ref={canvasRef}
        onClick={onCanvasClick}
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* SVG: connection lines only (pointer-events: none so blocks stay clickable) */}
        <svg
          style={{
            position: 'absolute', top: 0, left: 0,
            width: CANVAS_W, height: CANVAS_H,
            pointerEvents: 'none', overflow: 'visible', zIndex: 5,
          }}
        >
          {connections.map((conn) => {
            const from = canvasBlocks.find((b) => b.instanceId === conn.fromInstanceId)
            const to = canvasBlocks.find((b) => b.instanceId === conn.toInstanceId)
            return <ConnectionLine key={conn.id} conn={conn} fromBlock={from} toBlock={to} />
          })}
          {fromBlock && <LiveConnectionLine fromBlock={fromBlock} canvasRef={canvasRef} />}
        </svg>

        {/* Connection delete buttons (midpoint of each bezier) */}
        {connections.map((conn) => {
          const from = canvasBlocks.find((b) => b.instanceId === conn.fromInstanceId)
          const to = canvasBlocks.find((b) => b.instanceId === conn.toInstanceId)
          if (!from || !to) return null
          const mx = (from.x + BLOCK_WIDTH + to.x) / 2
          const my = (from.y + BLOCK_HALF_H + to.y + BLOCK_HALF_H) / 2
          return (
            <button
              key={`del_${conn.id}`}
              onClick={(e) => { e.stopPropagation(); removeConnection(conn.id) }}
              style={{ position: 'absolute', left: mx - 8, top: my - 8, zIndex: 15 }}
              className="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400
                hover:bg-red-500 hover:border-red-500 hover:text-white text-xs
                flex items-center justify-center shadow opacity-0 hover:opacity-100
                transition-all group-hover:opacity-100"
              title="Delete connection"
            >
              ×
            </button>
          )
        })}

        {/* Canvas blocks */}
        {canvasBlocks.map((block) => (
          <CanvasBlock
            key={block.instanceId}
            block={block}
            liveErrors={errorsByCategory[block.category] || []}
            liveWarnings={warningsByCategory[block.category] || []}
          />
        ))}
      </div>
    </div>
  )
}
