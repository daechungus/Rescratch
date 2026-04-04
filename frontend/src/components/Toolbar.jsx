import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'

export function Toolbar() {
  const { gamePhase, currentChallenge, hintIndex, isLoading } = useGameState()
  const submitPipeline = useStore((s) => s.submitPipeline)
  const resetPipeline = useStore((s) => s.resetPipeline)
  const backToMenu = useStore((s) => s.backToMenu)
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

        <div className="flex items-center gap-2">
          {gamePhase === 'building' && (
            <>
              <button
                onClick={resetPipeline}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={submitPipeline}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isLoading ? 'Evaluating…' : '▶ Submit Methodology'}
              </button>
            </>
          )}

          {gamePhase === 'submitted' && (
            <>
              <button
                onClick={resetPipeline}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={backToMenu}
                className="px-6 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                New Challenge →
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
