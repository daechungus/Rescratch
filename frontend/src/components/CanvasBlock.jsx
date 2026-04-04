import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store.js'
import { useCanvas } from '../hooks/useCanvas.js'
import { CATEGORY_COLORS, CATEGORY_LABELS, PORT_COLORS } from '../data/blockDefinitions.js'

const BLOCK_WIDTH = 200

export function CanvasBlock({ block, liveErrors, liveWarnings }) {
  const connectingFrom = useStore((s) => s.connectingFrom)
  const rejectTarget = useStore((s) => s.rejectTarget)

  const {
    onBlockPointerDown,
    onBlockPointerMove,
    onBlockPointerUp,
    onOutputPortClick,
    onInputPortClick,
    removeBlockFromCanvas,
  } = useCanvas()

  const colors = CATEGORY_COLORS[block.category] || {}
  const portColor = PORT_COLORS[block.category] || 'bg-gray-400'

  const isConnectingMode = !!connectingFrom
  const isSource = connectingFrom === block.instanceId
  const isShaking = rejectTarget === block.instanceId

  const hasError = liveErrors?.length > 0
  const hasWarning = !hasError && liveWarnings?.length > 0

  let ringClass = ''
  if (hasError) ringClass = 'ring-2 ring-red-400'
  else if (hasWarning) ringClass = 'ring-2 ring-yellow-400'
  if (isSource) ringClass = 'ring-2 ring-indigo-500 ring-offset-1'

  return (
    <motion.div
      key={block.instanceId}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        isShaking
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0], scale: 1, opacity: 1 }
          : { x: 0, scale: 1, opacity: 1 }
      }
      transition={isShaking ? { duration: 0.4 } : { type: 'spring', stiffness: 300, damping: 22 }}
      style={{ position: 'absolute', left: block.x, top: block.y, width: BLOCK_WIDTH, zIndex: isSource ? 20 : 10 }}
      onPointerDown={(e) => onBlockPointerDown(e, block.instanceId)}
      onPointerMove={onBlockPointerMove}
      onPointerUp={onBlockPointerUp}
      className={`rounded-xl border-2 shadow-md select-none cursor-grab active:cursor-grabbing
        ${colors.bg} ${colors.border} ${ringClass}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${colors.badge} bg-opacity-90`}>
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {CATEGORY_LABELS[block.category]}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); removeBlockFromCanvas(block.instanceId) }}
          className="text-white/70 hover:text-white text-sm leading-none ml-2 transition-colors"
          title="Remove block"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <div className={`text-sm font-semibold ${colors.text} leading-snug`}>{block.label}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{block.description}</div>
      </div>

      {/* Live validation badge */}
      {(hasError || hasWarning) && (
        <div className={`mx-3 mb-2 text-xs rounded-lg px-2 py-1 leading-snug
          ${hasError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {hasError ? (liveErrors[0].message) : (liveWarnings[0].message)}
        </div>
      )}

      {/* Input port — left side */}
      <div
        style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)' }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onInputPortClick(e, block.instanceId)}
        className={`w-4 h-4 rounded-full border-2 border-white shadow transition-all cursor-crosshair
          ${isConnectingMode && !isSource
            ? 'bg-green-400 scale-125 ring-2 ring-green-300 animate-pulse'
            : 'bg-gray-300 hover:bg-gray-400'
          }`}
        title="Input port"
      />

      {/* Output port — right side */}
      <div
        style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)' }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onOutputPortClick(e, block.instanceId)}
        className={`w-4 h-4 rounded-full border-2 border-white shadow transition-all cursor-crosshair
          ${isSource
            ? 'scale-125 ring-2 ring-indigo-400 ' + portColor
            : portColor + ' hover:scale-110'
          }`}
        title="Output port — click to start connection"
      />
    </motion.div>
  )
}
