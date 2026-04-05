import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check, X, Star, AlertTriangle } from 'lucide-react'
import { useGameState } from '../hooks/useGameState.js'
import { useStore } from '../store.js'

function ScoreBar({ label, value, max }) {
  const pct = Math.round((value / max) * 100)
  const barColor = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-bold">{value}/{max}</span>
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

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full text-left py-1"
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}

function MistakeCard({ mistake }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-amber-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-amber-50 text-left"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-amber-800 flex-1">{mistake.mistake}</span>
        {open
          ? <ChevronDown className="w-3 h-3 text-amber-400 flex-shrink-0" />
          : <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-3 py-2 space-y-1.5 bg-white">
          <p className="text-xs text-red-600"><span className="font-bold">Why it's wrong: </span>{mistake.why_wrong}</p>
          <p className="text-xs text-green-700"><span className="font-bold">Better choice: </span>{mistake.better_choice}</p>
        </div>
      )}
    </div>
  )
}

function CompareRow({ label, yours, ideal, match }) {
  if (!ideal && !yours) return null
  const fmt = (id) => id ? id.replace(/_/g, ' ').replace(/^(method|analysis) /, '') : '—'
  return (
    <div className="text-xs space-y-0.5">
      <span className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`flex-1 px-2 py-1 rounded ${match === true ? 'bg-green-50 text-green-700' : match === false ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'}`}>
          Yours: {fmt(yours)}
        </div>
        {match === false && (
          <div className="flex-1 px-2 py-1 rounded bg-blue-50 text-blue-700">
            Ideal: {fmt(ideal)}
          </div>
        )}
      </div>
    </div>
  )
}

const DIFF_ORDER = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 }

export function ScorePanel() {
  const { result, currentChallenge } = useGameState()
  const challenges = useStore((s) => s.challenges)
  const navigate = useNavigate()

  if (!result) return null

  const { score, breakdown, feedback, rubric_results, ideal_comparison, common_mistakes_triggered } = result
  const fb = feedback || {}

  const nextChallenge = (() => {
    if (!currentChallenge) return null
    const same = challenges
      .filter((c) => c.subtopic === currentChallenge.subtopic && c.id !== currentChallenge.id)
      .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 99) - (DIFF_ORDER[b.difficulty] ?? 99))
    const currentOrder = DIFF_ORDER[currentChallenge.difficulty] ?? 0
    return same.find((c) => (DIFF_ORDER[c.difficulty] ?? 0) >= currentOrder) || same[0] || null
  })()

  const pct = Math.round((score / 100) * 100)
  const scoreColor = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
  const bgColor = pct >= 75 ? 'bg-green-50 border-green-200' : pct >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  const hasRubric = rubric_results && (
    rubric_results.met?.length > 0 || rubric_results.missed?.length > 0 ||
    rubric_results.bonuses?.length > 0 || rubric_results.penalties?.length > 0
  )
  const hasIdeal    = !!ideal_comparison
  const hasMistakes = common_mistakes_triggered?.length > 0

  return (
    <aside className="w-80 min-w-[20rem] bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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
          <div className="text-gray-500 text-sm">out of 100</div>
          <div className={`text-sm font-semibold mt-1 ${scoreColor}`}>
            {pct >= 75 ? '🏆 Excellent' : pct >= 50 ? '👍 Good Work' : pct >= 30 ? '🔧 Needs Work' : '🔄 Try Again'}
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Breakdown</h3>
          <ScoreBar label="Completeness"         value={breakdown?.completeness || 0}         max={35} />
          <ScoreBar label="Logical Coherence"    value={breakdown?.logical_coherence || 0}    max={35} />
          <ScoreBar label="Methodological Rigor" value={breakdown?.methodological_rigor || 0} max={30} />
        </div>

        {/* Summary */}
        {fb.summary && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
            "{fb.summary}"
          </div>
        )}

        {/* Rubric check */}
        {hasRubric && (
          <Collapsible title="Rubric Check" defaultOpen>
            <div className="space-y-1.5">
              {rubric_results.met?.map((item, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-px" />
                  <span>{item}</span>
                </div>
              ))}
              {rubric_results.missed?.map((item, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-red-700 bg-red-50 rounded-lg px-2.5 py-1.5">
                  <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" />
                  <span>{item}</span>
                </div>
              ))}
              {rubric_results.bonuses?.map((item, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2.5 py-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-px" />
                  <span>{item}</span>
                </div>
              ))}
              {rubric_results.penalties?.map((item, i) => (
                <div key={i} className="flex gap-2 items-start text-xs text-orange-700 bg-orange-50 rounded-lg px-2.5 py-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-px" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Errors */}
        {fb.errors?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Errors</h3>
            <ul className="flex flex-col gap-1.5">
              {fb.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-lg p-2">
                  <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-px" />
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {fb.warnings?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-2">Warnings</h3>
            <ul className="flex flex-col gap-1.5">
              {fb.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-px" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {fb.suggestions?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Suggestions</h3>
            <ul className="flex flex-col gap-1.5">
              {fb.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
                  <span className="flex-shrink-0">💡</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ideal comparison */}
        {hasIdeal && (
          <Collapsible title="How Your Design Compares">
            <div className="space-y-2 mt-1">
              {ideal_comparison.explanation && (
                <p className="text-xs text-[#4A4A4A] leading-relaxed italic border-l-2 border-[#2EC4B6] pl-2">
                  {ideal_comparison.explanation}
                </p>
              )}
              <CompareRow
                label="Method"
                yours={ideal_comparison.player_method}
                ideal={ideal_comparison.ideal_method}
                match={ideal_comparison.method_match}
              />
              <CompareRow
                label="Analysis"
                yours={ideal_comparison.player_analysis}
                ideal={ideal_comparison.ideal_analysis}
                match={ideal_comparison.analysis_match}
              />
              {ideal_comparison.variables_match !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] w-16 flex-shrink-0">Controls</span>
                  {ideal_comparison.variables_match
                    ? <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Included</span>
                    : <span className="text-amber-600 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Missing</span>}
                </div>
              )}
            </div>
          </Collapsible>
        )}

        {/* Common mistakes */}
        {hasMistakes && (
          <Collapsible title={`Common Mistakes (${common_mistakes_triggered.length})`}>
            <div className="space-y-2 mt-1">
              {common_mistakes_triggered.map((m, i) => (
                <MistakeCard key={i} mistake={m} />
              ))}
            </div>
          </Collapsible>
        )}

        {/* Encouragement */}
        {fb.encouragement && (
          <div className="text-xs text-gray-500 text-center italic pt-2 border-t border-gray-100">
            {fb.encouragement}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
          {nextChallenge ? (
            <button
              onClick={() => navigate(`/lab/${nextChallenge.id}`)}
              className="w-full py-2 px-4 rounded-lg bg-[#2EC4B6] text-white text-sm font-bold hover:bg-[#239E93] transition-colors"
            >
              Next Challenge →
            </button>
          ) : (
            <button
              onClick={() =>
                navigate(
                  currentChallenge?.pillar
                    ? `/explore?pillar=${currentChallenge.pillar}${currentChallenge.subtopic ? `&subtopic=${currentChallenge.subtopic}` : ''}`
                    : '/explore'
                )
              }
              className="w-full py-2 px-4 rounded-lg bg-[#2EC4B6] text-white text-sm font-bold hover:bg-[#239E93] transition-colors"
            >
              Back to Explore →
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
