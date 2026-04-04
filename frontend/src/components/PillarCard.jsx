import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function PillarCard({ pillar, delay = 0 }) {
  const navigate = useNavigate()

  // Group subtopics by parent
  const groups = pillar.subtopics.reduce((acc, s) => {
    if (!acc[s.parent]) acc[s.parent] = []
    acc[s.parent].push(s)
    return acc
  }, {})
  const groupEntries = Object.entries(groups)

  // First group open by default
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {}
    if (groupEntries.length > 0) init[groupEntries[0][0]] = true
    return init
  })

  function toggleGroup(parent) {
    setOpenGroups((prev) => ({ ...prev, [parent]: !prev[parent] }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-xl bg-gray-800 border border-white/8 p-6 flex flex-col gap-4 cursor-default"
      style={{
        '--pillar-color': pillar.color,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = pillar.color + '80'
        e.currentTarget.style.boxShadow = `0 8px 32px ${pillar.color}20`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{pillar.emoji}</span>
          <div>
            <div className="font-bold text-white text-lg leading-tight">{pillar.title}</div>
            <div className="text-gray-500 text-xs">{pillar.subtitle}</div>
          </div>
        </div>
        <p className="text-gray-500 text-sm italic mt-2">{pillar.focus}</p>
      </div>

      <div className="border-t border-white/5" />

      {/* Subtopic groups */}
      <div className="flex flex-col gap-3 flex-1">
        {groupEntries.map(([parent, subtopics]) => {
          const isOpen = !!openGroups[parent]
          return (
            <div key={parent}>
              <button
                onClick={() => toggleGroup(parent)}
                className="flex items-center justify-between w-full text-left mb-1.5 group"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                  {parent}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {subtopics.map((s, i) => (
                        <motion.button
                          key={s.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => navigate(`/explore?pillar=${pillar.id}&subtopic=${s.id}`)}
                          className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300 hover:text-white transition-all"
                          style={{ '--pc': pillar.color }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = pillar.color + '33'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = ''
                          }}
                          title={s.description}
                        >
                          {s.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <button
        onClick={() => navigate(`/explore?pillar=${pillar.id}`)}
        className="text-sm font-semibold transition-colors mt-auto text-left"
        style={{ color: pillar.color }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        Explore All →
      </button>
    </motion.div>
  )
}
