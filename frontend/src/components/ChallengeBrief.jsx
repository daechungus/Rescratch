import { useState } from 'react'
import { useStore } from '../store.js'
import { PIPELINE_ORDER, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '../data/blockDefinitions.js'
import { Bug, Target, BookOpen, Lightbulb, ChevronDown, ChevronRight, ExternalLink, FlaskConical } from 'lucide-react'

const DIFFICULTY_STYLES = {
  beginner:     { pill: 'bg-green-100 text-green-700 border border-green-200' },
  intermediate: { pill: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  advanced:     { pill: 'bg-red-100 text-red-700 border border-red-200' },
  expert:       { pill: 'bg-purple-100 text-purple-700 border border-purple-200' },
}

function Section({ icon: Icon, title, color = '#2EC4B6', children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        <span className="text-[10px] font-black tracking-widest uppercase text-[#9A9A9A]">{title}</span>
      </div>
      {children}
    </div>
  )
}

export function ChallengeBrief() {
  const challenge = useStore((s) => s.currentChallenge)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [revealedHints, setRevealedHints] = useState(0)

  if (!challenge) return null

  const isBrokenLab = challenge.type === 'broken_lab'
  const hasArxiv    = !!challenge.arxiv_id
  const diffStyle   = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.beginner
  const available   = challenge.available_categories || PIPELINE_ORDER
  const hints       = challenge.hints || []
  const brief       = challenge.brief || null

  function revealNext() {
    setRevealedHints((n) => Math.min(n + 1, hints.length))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E3DE]">
        {/* Broken-lab badge */}
        {isBrokenLab && (
          <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 w-fit">
            <Bug className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">Debugging Mode</span>
          </div>
        )}

        {/* Difficulty + tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diffStyle.pill}`}>
            {challenge.difficulty}
          </span>
          {(challenge.tags || []).map((tag) => (
            <span key={tag} className="text-xs text-[#9A9A9A] bg-[#F0EFEB] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-sm font-black text-[#1A1A1A] leading-snug">
          {challenge.title}
        </h2>

        {/* ArXiv paper link */}
        {hasArxiv && (
          <a
            href={`https://arxiv.org/abs/${challenge.arxiv_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2EC4B6] hover:text-[#239E93] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View paper on arXiv
          </a>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-5">

        {/* Background / scenario */}
        {brief ? (
          <>
            {brief.background && (
              <Section icon={FlaskConical} title="Background">
                {brief.background.split('\n\n').map((para, i) => (
                  <p key={i} className="text-xs text-[#4A4A4A] leading-relaxed mb-2 last:mb-0">{para}</p>
                ))}
              </Section>
            )}

            {brief.scenario && (
              <Section icon={FlaskConical} title="Scenario" color="#FFB941">
                {brief.scenario.split('\n\n').map((para, i) => (
                  <p key={i} className="text-xs text-[#4A4A4A] leading-relaxed mb-2 last:mb-0">{para}</p>
                ))}
              </Section>
            )}

            {brief.task && (
              <Section icon={Target} title="Your Task" color="#FFB941">
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{brief.task}</p>
              </Section>
            )}

            {brief.constraints?.length > 0 && (
              <Section icon={BookOpen} title="Constraints" color="#EF4444">
                <ul className="space-y-1.5">
                  {brief.constraints.map((c, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[#4A4A4A]">
                      <span className="text-red-400 font-black flex-shrink-0 mt-px">•</span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {brief.input_format && (
              <Section icon={BookOpen} title="Input Format" color="#6B6B6B">
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{brief.input_format}</p>
              </Section>
            )}

            {brief.expected_output && (
              <Section icon={BookOpen} title="Expected Output" color="#6B6B6B">
                <p className="text-xs text-[#4A4A4A] leading-relaxed">{brief.expected_output}</p>
              </Section>
            )}
          </>
        ) : (
          <>
            <Section icon={FlaskConical} title="Background">
              <p className="text-xs text-[#4A4A4A] leading-relaxed">{challenge.description}</p>
            </Section>
            <Section icon={Target} title="Your Task" color="#FFB941">
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                {isBrokenLab
                  ? 'This pipeline has been pre-filled with methodological errors. Identify and fix them — remove wrong blocks, replace them with correct ones, and rewire as needed.'
                  : 'Use the blocks in the library to assemble a valid research methodology pipeline. Connect them left-to-right in a logical order, then hit Run Experiment to evaluate your design.'}
              </p>
            </Section>
          </>
        )}

        {/* Available categories */}
        <Section icon={BookOpen} title="Available Block Categories">
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_ORDER.filter((c) => available.includes(c)).map((cat) => {
              const colors = CATEGORY_COLORS[cat]
              return (
                <span
                  key={cat}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge} text-white`}
                  title={CATEGORY_LABELS[cat]}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </span>
              )
            })}
          </div>
        </Section>

        {/* Hints — reveal one at a time */}
        {hints.length > 0 && (
          <Section icon={Lightbulb} title="Hints" color="#A78BFA">
            <div className="space-y-2">
              {hints.slice(0, revealedHints).map((hint, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 rounded-lg bg-[#F5F3FF] border border-purple-100 px-3 py-2"
                >
                  <span className="text-xs font-black text-purple-400 flex-shrink-0 mt-px">{i + 1}</span>
                  <p className="text-xs text-[#4A4A4A] leading-relaxed">{hint}</p>
                </div>
              ))}

              {revealedHints < hints.length ? (
                <button
                  onClick={revealNext}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Reveal hint {revealedHints + 1} of {hints.length}
                </button>
              ) : (
                <p className="text-xs text-[#9A9A9A] italic">All hints revealed.</p>
              )}
            </div>
          </Section>
        )}

        {/* Scoring reference */}
        <Section icon={ChevronDown} title="Scoring" color="#6B6B6B">
          <div className="rounded-lg bg-[#F7F7F5] border border-[#E5E3DE] divide-y divide-[#E5E3DE] text-xs">
            {[
              { label: 'Completeness', max: 35, desc: '5 pts per category present' },
              { label: 'Coherence',    max: 35, desc: 'Deductions for bad connections' },
              { label: 'Rigor',        max: 30, desc: 'Bonus for controls, sampling, method quality' },
            ].map(({ label, max, desc }) => (
              <div key={label} className="px-3 py-2 flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-[#1A1A1A]">{label}</span>
                  <span className="text-[#9A9A9A] ml-1">— {desc}</span>
                </div>
                <span className="font-black text-[#2EC4B6] flex-shrink-0">{max} pts</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
