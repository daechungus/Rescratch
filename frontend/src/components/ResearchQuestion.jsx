import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'

const DIFFICULTY_STYLES = {
  beginner: 'bg-green-100 text-green-700 border border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  advanced: 'bg-red-100 text-red-700 border border-red-300',
  expert: 'bg-purple-100 text-purple-700 border border-purple-300',
}

export function ResearchQuestion() {
  const navigate = useNavigate()
  const currentChallenge = useStore((s) => s.currentChallenge)
  const backToMenu = useStore((s) => s.backToMenu)
  const submitPipeline = useStore((s) => s.submitPipeline)
  const resetCanvas = useStore((s) => s.resetCanvas)
  const canvasBlocks = useStore((s) => s.canvasBlocks)
  const { gamePhase, isLoading } = useGameState()

  function handleBack() {
    if (canvasBlocks.length > 0) {
      if (!window.confirm('Leave this challenge? Your progress will be lost.')) return
    }
    backToMenu()
    navigate('/explore')
  }

  if (!currentChallenge) return null

  const diffStyle = DIFFICULTY_STYLES[currentChallenge.difficulty] || DIFFICULTY_STYLES.beginner

  return (
    <header className="bg-white border-b border-[#E5E3DE] px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="text-[#9A9A9A] hover:text-[#1A1A1A] text-sm flex-shrink-0 transition-colors"
          title="Back to challenges"
        >
          ← Back
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diffStyle}`}>
              {currentChallenge.difficulty}
            </span>
            {(currentChallenge.tags || []).map((tag) => (
              <span key={tag} className="text-xs text-[#9A9A9A] bg-[#F0EFEB] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-base font-bold text-[#1A1A1A] leading-snug truncate">
            🔬 {currentChallenge.title}
          </h1>
        </div>

        {gamePhase === 'building' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={resetCanvas}
              className="px-4 py-2 text-sm rounded-lg border border-[#E5E3DE] text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={submitPipeline}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-bold rounded-lg bg-[#2EC4B6] text-white hover:bg-[#239E93] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? 'Running…' : '▶ Run Experiment'}
            </button>
          </div>
        )}

        {gamePhase === 'submitted' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={resetCanvas}
              className="px-4 py-2 text-sm rounded-lg border border-[#E5E3DE] text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => { backToMenu(); navigate('/explore') }}
              className="px-5 py-2 text-sm font-bold rounded-lg bg-[#2EC4B6] text-white hover:bg-[#239E93] transition-colors shadow-sm"
            >
              New Challenge →
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
