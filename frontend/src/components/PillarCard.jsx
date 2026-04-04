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
      className="rounded-xl bg-white border border-[#E5E3DE] p-6 flex flex-col gap-4 cursor-default w-full h-auto md:h-[350px] md:w-[370px]"
      style={{
        '--pillar-color': pillar.color,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = pillar.color + '80'
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.08)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E3DE'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{pillar.emoji}</span>
          <div>
            <div className="font-bold text-[#1A1A1A] text-lg leading-tight">{pillar.title}</div>
            <div className="text-[#6B6B6B] text-xs">{pillar.subtitle}</div>
          </div>
        </div>
        <p className="text-[#6B6B6B] text-sm italic mt-2">{pillar.focus}</p>
      </div>

      <div className="border-t border-[#E5E3DE]" />

      {/* Subtopic groups */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {groupEntries.map(([parent, subtopics]) => {
          const isOpen = !!openGroups[parent]
          return (
            <div key={parent}>
              <button
                onClick={() => toggleGroup(parent)}
                className="flex items-center justify-between w-full text-left mb-1.5 group"
              >
                <span className="text-xs font-bold text-[#9A9A9A] uppercase tracking-widest group-hover:text-[#6B6B6B] transition-colors">
                  {parent}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#9A9A9A] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                          className="text-xs px-3 py-1 rounded-full bg-[#F7F7F5] text-[#1A1A1A] transition-all"
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
