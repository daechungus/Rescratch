import { motion } from 'framer-motion'
import { useGameState } from '../hooks/useGameState.js'

function ScoreBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100)
  const barColor =
    pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-bold">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function ScorePanel() {
  const { result } = useGameState()
  if (!result) return null

  const { score, breakdown, feedback, is_valid } = result
  const maxScore = 85
  const pct = Math.round((score / maxScore) * 100)
  const scoreColor = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
  const bgColor = pct >= 75 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <aside className="w-72 min-w-[18rem] bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Results</h2>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Total score */}
        <div className={`rounded-xl border-2 p-4 text-center ${bgColor}`}>
          <motion.div
            className={`text-5xl font-black ${scoreColor}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {score}
          </motion.div>
          <div className="text-gray-500 text-sm">out of {maxScore}</div>
          <div className={`text-sm font-semibold mt-1 ${scoreColor}`}>
            {pct >= 75 ? '🏆 Excellent' : pct >= 50 ? '👍 Good Work' : pct >= 30 ? '🔧 Needs Work' : '🔄 Try Again'}
          </div>
        </div>

        {/* Score breakdown */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Breakdown</h3>
          <ScoreBar label="Completeness" value={breakdown?.completeness || 0} max={30} />
          <ScoreBar label="Logical Coherence" value={breakdown?.logical_coherence || 0} max={30} />
          <ScoreBar label="Methodological Rigor" value={breakdown?.methodological_rigor || 0} max={25} />
        </div>

        {/* Summary */}
        {feedback?.summary && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
            "{feedback.summary}"
          </div>
        )}

        {/* Errors */}
        {feedback?.errors?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Errors</h3>
            <ul className="flex flex-col gap-1.5">
              {feedback.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg p-2">
                  <span className="flex-shrink-0 font-bold">✗</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {feedback?.warnings?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-2">Warnings</h3>
            <ul className="flex flex-col gap-1.5">
              {feedback.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2">
                  <span className="flex-shrink-0">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {feedback?.suggestions?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Suggestions</h3>
            <ul className="flex flex-col gap-1.5">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
                  <span className="flex-shrink-0">💡</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Encouragement */}
        {feedback?.encouragement && (
          <div className="text-xs text-gray-500 text-center italic mt-auto pt-2 border-t border-gray-100">
            {feedback.encouragement}
          </div>
        )}
      </div>
    </aside>
  )
}
