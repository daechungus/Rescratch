import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PILLARS, { getSubtopicLabel } from '../data/pillars.js'

const DIFFICULTY_STYLES = {
  beginner:     { bg: 'bg-green-900/50',  text: 'text-green-400',  label: 'Beginner' },
  intermediate: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', label: 'Intermediate' },
  advanced:     { bg: 'bg-orange-900/50', text: 'text-orange-400', label: 'Advanced' },
  expert:       { bg: 'bg-red-900/50',    text: 'text-red-400',    label: 'Expert' },
}

export function ChallengeRow({ challenge, index }) {
  const navigate = useNavigate()
  const isBrokenLab = challenge.type === 'broken_lab'

  const pillar = challenge.pillar ? PILLARS.find((p) => p.id === challenge.pillar) : null
  const subtopicLabel = challenge.subtopic ? getSubtopicLabel(challenge.subtopic) : null
  const diffStyle = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.beginner

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.6) }}
      onClick={() => navigate(`/lab/${challenge.id}`)}
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-white/5 hover:bg-gray-800/70 cursor-pointer group transition-all"
      style={{ borderLeft: pillar ? `3px solid ${pillar.color}30` : undefined }}
      onMouseEnter={(e) => {
        if (pillar) e.currentTarget.style.borderLeftColor = pillar.color + '80'
      }}
      onMouseLeave={(e) => {
        if (pillar) e.currentTarget.style.borderLeftColor = pillar.color + '30'
      }}
    >
      {/* Index */}
      <span className="text-gray-600 font-mono text-sm w-7 flex-shrink-0 text-right">
        {index + 1}
      </span>

      {/* Difficulty / Broken Lab badge */}
      {isBrokenLab ? (
        <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 whitespace-nowrap">
          🔧 Fix
        </span>
      ) : (
        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${diffStyle.bg} ${diffStyle.text}`}>
          {diffStyle.label}
        </span>
      )}

      {/* Title */}
      <span className="flex-1 text-sm font-semibold text-gray-200 truncate min-w-0 group-hover:text-white transition-colors">
        {challenge.title}
      </span>

      {/* Pillar + Subtopic tags */}
      <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
        {pillar && (
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: pillar.color + '20', color: pillar.color }}
          >
            {pillar.emoji} {pillar.title}
          </span>
        )}
        {subtopicLabel && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400 whitespace-nowrap max-w-[140px] truncate">
            {subtopicLabel}
          </span>
        )}
      </div>

      {/* Max score */}
      <span className="hidden lg:block font-mono text-xs text-gray-600 flex-shrink-0 w-12 text-right">
        85 pts
      </span>

      {/* Start / Debug button */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/lab/${challenge.id}`) }}
        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
      >
        {isBrokenLab ? 'Debug' : 'Start'}
      </button>
    </motion.div>
  )
}
