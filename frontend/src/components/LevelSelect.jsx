import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store.js'

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']
const DIFFICULTY_STYLES = {
  beginner: { badge: 'bg-green-100 text-green-700', label: 'Beginner', emoji: '🌱' },
  intermediate: { badge: 'bg-yellow-100 text-yellow-700', label: 'Intermediate', emoji: '⚗️' },
  advanced: { badge: 'bg-red-100 text-red-700', label: 'Advanced', emoji: '🚀' },
  expert: { badge: 'bg-purple-100 text-purple-700', label: 'Expert', emoji: '🏆' },
}

export function LevelSelect() {
  const challenges = useStore((s) => s.challenges)
  const isLoading = useStore((s) => s.isLoading)
  const loadChallenges = useStore((s) => s.loadChallenges)
  const loadBlocks = useStore((s) => s.loadBlocks)
  const selectChallenge = useStore((s) => s.selectChallenge)

  useEffect(() => {
    loadChallenges()
    loadBlocks()
  }, [])

  const grouped = DIFFICULTY_ORDER.reduce((acc, diff) => {
    const group = challenges.filter((c) => c.difficulty === diff)
    if (group.length > 0) acc[diff] = group
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <div className="text-center pt-16 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl mb-4">🔬</div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">ReScratch</h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Scratch for Research — drag and snap blocks to build valid scientific methodologies.
          </p>
        </motion.div>
      </div>

      {/* Challenges */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {isLoading ? (
          <div className="text-center text-gray-400 py-16">Loading challenges…</div>
        ) : (
          DIFFICULTY_ORDER.filter((d) => grouped[d]).map((diff, groupIdx) => {
            const style = DIFFICULTY_STYLES[diff]
            return (
              <motion.div
                key={diff}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
                className="mb-10"
              >
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>{style.emoji}</span> {style.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[diff].map((challenge, idx) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: groupIdx * 0.1 + idx * 0.05 }}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => selectChallenge(challenge)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${style.badge}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {(challenge.tags || []).slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {challenge.description}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-block">
                          Start Challenge →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
