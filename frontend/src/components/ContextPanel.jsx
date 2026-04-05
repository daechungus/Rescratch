import { useState } from 'react'
import { useStore } from '../store.js'
import { PIPELINE_ORDER, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '../data/blockDefinitions.js'
import {
  Bug, Target, BookOpen, Lightbulb, ChevronDown, ChevronRight,
  ExternalLink, FlaskConical, AlertTriangle, Key,
} from 'lucide-react'

const DIFFICULTY_STYLES = {
  beginner:     'bg-green-100 text-green-700 border border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  advanced:     'bg-red-100 text-red-700 border border-red-200',
  expert:       'bg-purple-100 text-purple-700 border border-purple-200',
}

function SectionHeading({ icon: Icon, label, color = '#2EC4B6' }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span className="text-[10px] font-black tracking-widest uppercase text-[#9A9A9A]">{label}</span>
    </div>
  )
}

function Collapsible({ heading, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full text-left mb-1"
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        <span className="text-[10px] font-black tracking-widest uppercase text-[#9A9A9A] flex-1">{heading}</span>
        {open
          ? <ChevronDown className="w-3 h-3 text-[#9A9A9A]" />
          : <ChevronRight className="w-3 h-3 text-[#9A9A9A]" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}

function Prose({ text }) {
  if (!text) return null
  return text.split('\n\n').map((para, i) => (
    <p key={i} className="text-xs text-[#4A4A4A] leading-relaxed mb-2 last:mb-0">{para}</p>
  ))
}

export function ContextPanel() {
  const challenge = useStore((s) => s.currentChallenge)
  const [revealedHints, setRevealedHints] = useState(0)

  if (!challenge) return null

  const isBrokenLab = challenge.type === 'broken_lab'
  const hasArxiv    = !!challenge.arxiv_id
  const diffStyle   = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.beginner
  const available   = challenge.available_categories || PIPELINE_ORDER
  const hints       = challenge.hints || []

  // Prefer enriched `background` object; fall back to `brief` fields
  const bg        = challenge.background   // enriched: {objective, context, task, constraints, key_terms}
  const brief     = challenge.brief        // existing: {background, scenario, task, constraints, ...}

  const objective   = bg?.objective   || brief?.background || challenge.description
  const context     = bg?.context     || brief?.scenario   || null
  const task        = bg?.task        || brief?.task       || null
  const constraints = bg?.constraints || brief?.constraints || []
  const keyTerms    = bg?.key_terms   || []

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E3DE]">
        {/* Debug badge */}
        {isBrokenLab && (
          <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 w-fit">
            <Bug className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-bold text-red-700">Debugging Mode — find &amp; fix the errors</span>
          </div>
        )}

        {/* Difficulty + tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diffStyle}`}>
            {challenge.difficulty}
          </span>
          {(challenge.tags || []).map((tag) => (
            <span key={tag} className="text-xs text-[#9A9A9A] bg-[#F0EFEB] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-sm font-black text-[#1A1A1A] leading-snug">{challenge.title}</h2>

        {/* ArXiv link */}
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

      {/* ── Body ── */}
      <div className="px-4 py-4 space-y-5">

        {/* Objective */}
        <div>
          <SectionHeading icon={FlaskConical} label="Objective" />
          <Prose text={objective} />
        </div>

        {/* Context (only if present) */}
        {context && (
          <div>
            <SectionHeading icon={BookOpen} label="Background" color="#6B6B6B" />
            <Prose text={context} />
          </div>
        )}

        {/* Key Terms (collapsible) */}
        {keyTerms.length > 0 && (
          <Collapsible icon={Key} heading="Key Terms" color="#A78BFA">
            <div className="space-y-1.5">
              {keyTerms.map((kt, i) => (
                <div key={i} className="rounded-lg bg-[#F5F3FF] border border-purple-100 px-3 py-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">{kt.term}</span>
                  <span className="text-xs text-[#6B6B6B] ml-1.5">— {kt.definition}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Task */}
        {task && (
          <div>
            <SectionHeading icon={Target} label="Your Task" color="#FFB941" />
            <div className="border-l-2 border-[#FFB941] pl-3">
              <p className="text-xs text-[#4A4A4A] leading-relaxed">{task}</p>
            </div>
          </div>
        )}

        {/* Default task text if nothing else */}
        {!task && (
          <div>
            <SectionHeading icon={Target} label="Your Task" color="#FFB941" />
            <div className="border-l-2 border-[#FFB941] pl-3">
              <p className="text-xs text-[#4A4A4A] leading-relaxed">
                {isBrokenLab
                  ? 'This pipeline has been pre-filled with methodological errors. Identify and fix them — remove wrong blocks, replace them with correct ones, and rewire as needed.'
                  : 'Use the blocks in the library to assemble a valid research methodology pipeline. Connect them left-to-right in a logical order, then hit Run Experiment to evaluate your design.'}
              </p>
            </div>
          </div>
        )}

        {/* Constraints */}
        {constraints.length > 0 && (
          <div>
            <SectionHeading icon={AlertTriangle} label="Constraints" color="#EF4444" />
            <ul className="space-y-1.5">
              {constraints.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#4A4A4A]">
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Available block categories */}
        <div>
          <SectionHeading icon={BookOpen} label="Available Block Categories" />
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
        </div>

        {/* Hints — reveal one at a time */}
        {hints.length > 0 && (
          <div>
            <SectionHeading icon={Lightbulb} label="Hints" color="#A78BFA" />
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
                  onClick={() => setRevealedHints((n) => Math.min(n + 1, hints.length))}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Reveal hint {revealedHints + 1} of {hints.length}
                </button>
              ) : (
                <p className="text-xs text-[#9A9A9A] italic">All hints revealed.</p>
              )}
            </div>
          </div>
        )}

        {/* Scoring reference */}
        <div>
          <SectionHeading icon={ChevronDown} label="Scoring" color="#6B6B6B" />
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
        </div>
      </div>
    </div>
  )
}
