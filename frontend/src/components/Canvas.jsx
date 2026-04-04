import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'
import { Block } from './Block.jsx'
import {
  PIPELINE_ORDER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ICONS,
} from '../data/blockDefinitions.js'

export function Canvas({ activeBlock }) {
  const { pipeline, result, gamePhase } = useGameState()
  const removeBlockFromZone = useStore((s) => s.removeBlockFromZone)

  // Build a map of category -> error messages from result
  const categoryErrors = {}
  const categoryWarnings = {}
  if (result) {
    ;(result.validation_results || []).forEach((vr) => {
      if (!vr.passed && vr.category) {
        if (vr.severity === 'error') {
          if (!categoryErrors[vr.category]) categoryErrors[vr.category] = []
          categoryErrors[vr.category].push(vr.message)
        } else {
          if (!categoryWarnings[vr.category]) categoryWarnings[vr.category] = []
          categoryWarnings[vr.category].push(vr.message)
        }
      }
    })
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {PIPELINE_ORDER.map((category, idx) => (
          <DropZone
            key={category}
            category={category}
            blocks={pipeline[category] || []}
            activeBlock={activeBlock}
            onRemove={(blockId) => removeBlockFromZone(category, blockId)}
            errors={categoryErrors[category] || []}
            warnings={categoryWarnings[category] || []}
            isSubmitted={gamePhase === 'submitted'}
            index={idx}
          />
        ))}
      </div>
    </main>
  )
}

function DropZone({ category, blocks, activeBlock, onRemove, errors, warnings, isSubmitted, index }) {
  const { setNodeRef, isOver } = useDroppable({ id: category })
  const colors = CATEGORY_COLORS[category]
  const isCompatible = activeBlock?.category === category
  const isIncompatible = activeBlock && activeBlock.category !== category

  let zoneClass = `rounded-xl border-2 p-3 transition-all duration-150 min-h-[80px] ${colors.zone}`
  if (isOver && isCompatible) {
    zoneClass = `rounded-xl border-2 p-3 transition-all duration-150 min-h-[80px] bg-green-50 border-green-400 shadow-md`
  } else if (isOver && isIncompatible) {
    zoneClass = `rounded-xl border-2 p-3 transition-all duration-150 min-h-[80px] bg-red-50 border-red-300`
  } else if (isCompatible && activeBlock) {
    zoneClass = `rounded-xl border-2 border-dashed p-3 transition-all duration-150 min-h-[80px] ${colors.highlight}`
  }

  const hasError = errors.length > 0
  const hasWarning = warnings.length > 0
  if (isSubmitted && hasError) {
    zoneClass += ' ring-2 ring-red-400'
  } else if (isSubmitted && hasWarning) {
    zoneClass += ' ring-2 ring-yellow-400'
  } else if (isSubmitted && blocks.length > 0) {
    zoneClass += ' ring-2 ring-green-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="flex items-start gap-3">
        {/* Step indicator */}
        <div className="flex flex-col items-center pt-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colors.badge} text-white shadow-sm`}>
            {index + 1}
          </div>
          {index < PIPELINE_ORDER.length - 1 && (
            <div className="w-0.5 h-4 bg-gray-300 mt-1" />
          )}
        </div>

        {/* Zone */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span>{CATEGORY_ICONS[category]}</span>
            <span className={`text-sm font-bold ${colors.text}`}>{CATEGORY_LABELS[category]}</span>
            <span className="text-xs text-gray-400">{CATEGORY_DESCRIPTIONS[category]}</span>
          </div>

          <div ref={setNodeRef} className={zoneClass}>
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <span className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 text-gray-300">
                  Drop {CATEGORY_LABELS[category]} block here
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {blocks.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex-shrink-0"
                    >
                      <Block block={block} onRemove={isSubmitted ? null : onRemove} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Inline errors/warnings after submit */}
          {isSubmitted && (
            <>
              {errors.map((msg, i) => (
                <p key={i} className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>✗</span> {msg}
                </p>
              ))}
              {warnings.map((msg, i) => (
                <p key={i} className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <span>⚠</span> {msg}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
