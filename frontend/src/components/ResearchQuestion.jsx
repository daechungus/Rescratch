import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'

export function ResearchQuestion() {
  const navigate        = useNavigate()
  const currentChallenge = useStore((s) => s.currentChallenge)
  const backToMenu      = useStore((s) => s.backToMenu)
  const submitPipeline  = useStore((s) => s.submitPipeline)
  const resetCanvas     = useStore((s) => s.resetCanvas)
  const retrySubmit     = useStore((s) => s.retrySubmit)
  const canvasBlocks    = useStore((s) => s.canvasBlocks)
  const { gamePhase, isLoading } = useGameState()

  function handleBack() {
    if (canvasBlocks.length > 0) {
      if (!window.confirm('Leave this challenge? Your progress will be lost.')) return
    }
    backToMenu()
    navigate('/explore')
  }

  if (!currentChallenge) return null

  return (
    <header className="bg-white border-b border-[#E5E3DE] px-4 py-2 flex-shrink-0 flex items-center justify-between gap-4">
      {/* Left: back + challenge title (compact) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleBack}
          className="text-[#9A9A9A] hover:text-[#1A1A1A] text-sm flex-shrink-0 transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm font-bold text-[#1A1A1A] truncate hidden md:block">
          {currentChallenge.title}
        </span>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {gamePhase === 'building' && (
          <>
            <button
              onClick={resetCanvas}
              className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E3DE] text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={submitPipeline}
              disabled={isLoading}
              className="px-4 py-1.5 text-sm font-bold rounded-lg bg-[#2EC4B6] text-white hover:bg-[#239E93] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? 'Running…' : '▶ Run Experiment'}
            </button>
          </>
        )}

        {gamePhase === 'submitted' && (
          <>
            <button
              onClick={retrySubmit}
              className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E3DE] text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => { backToMenu(); navigate('/explore') }}
              className="px-4 py-1.5 text-sm font-bold rounded-lg bg-[#2EC4B6] text-white hover:bg-[#239E93] transition-colors shadow-sm"
            >
              New Challenge →
            </button>
          </>
        )}
      </div>
    </header>
  )
}
