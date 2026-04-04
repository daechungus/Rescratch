import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PILLARS, { getSubtopicLabel } from '../data/pillars.js'

const DIFFICULTY_STYLES = {
  beginner:     { bg: 'bg-green-50',      text: 'text-green-600',  label: 'Beginner' },
  intermediate: { bg: 'bg-[#FFF3DC]',     text: 'text-[#FFB941]', label: 'Intermediate' },
  advanced:     { bg: 'bg-orange-50',     text: 'text-orange-600', label: 'Advanced' },
  expert:       { bg: 'bg-purple-50',     text: 'text-purple-700', label: 'Expert' },
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
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white border border-[#E5E3DE] hover:bg-[#F7F7F5] cursor-pointer group transition-all"
      style={{ borderLeft: pillar ? `3px solid ${pillar.color}30` : undefined }}
      onMouseEnter={(e) => {
        if (pillar) e.currentTarget.style.borderLeftColor = pillar.color + '80'
      }}
      onMouseLeave={(e) => {
        if (pillar) e.currentTarget.style.borderLeftColor = pillar.color + '30'
      }}
    >
      {/* Index */}
      <span className="text-[#9A9A9A] font-mono text-sm w-7 flex-shrink-0 text-right">
        {index + 1}
      </span>

      {/* Difficulty / Broken Lab badge */}
      {isBrokenLab ? (
        <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 whitespace-nowrap">
          🔧 Fix
        </span>
      ) : (
        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${diffStyle.bg} ${diffStyle.text}`}>
          {diffStyle.label}
        </span>
      )}

      {/* Title */}
      <span className="flex-1 text-sm font-semibold text-[#1A1A1A] truncate min-w-0 group-hover:text-[#1A1A1A] transition-colors">
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0EFEB] text-[#6B6B6B] whitespace-nowrap max-w-[140px] truncate">
            {subtopicLabel}
          </span>
        )}
      </div>

      {/* Max score */}
      <span className="hidden lg:block font-mono text-xs text-[#9A9A9A] flex-shrink-0 w-12 text-right">
        85 pts
      </span>

      {/* Start / Debug button */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/lab/${challenge.id}`) }}
        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#2EC4B6]/40 text-[#2EC4B6] hover:bg-[#2EC4B6] hover:text-white hover:border-[#2EC4B6] transition-all"
      >
        {isBrokenLab ? 'Debug' : 'Start'}
      </button>
    </motion.div>
  )
}
