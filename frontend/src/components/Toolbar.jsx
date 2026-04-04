import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'

export function Toolbar() {
  const { gamePhase, currentChallenge, hintIndex } = useGameState()
  const advanceHint = useStore((s) => s.advanceHint)

  const [showHint, setShowHint] = useState(false)

  const hints = currentChallenge?.hints || []
  const currentHint = hints[hintIndex] || null
  const hasMoreHints = hintIndex < hints.length - 1

  function handleHint() {
    setShowHint(true)
    setTimeout(() => setShowHint(false), 4000)
    if (hasMoreHints) advanceHint()
  }

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Hint button */}
          {hints.length > 0 && gamePhase === 'building' && (
            <button
              onClick={handleHint}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              💡 Hint {hints.length > 1 ? `(${Math.min(hintIndex + 1, hints.length)}/${hints.length})` : ''}
            </button>
          )}
        </div>

        {/* Hint toast */}
        <AnimatePresence>
          {showHint && currentHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl max-w-sm text-center z-50"
            >
              💡 {currentHint}
            </motion.div>
          )}
        </AnimatePresence>

        <div />
      </div>
    </footer>
  )
}
