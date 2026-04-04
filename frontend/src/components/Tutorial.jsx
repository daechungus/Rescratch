import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store.js'
import { useGameState } from '../hooks/useGameState.js'

const STEPS = [
  {
    icon: '🧩',
    title: 'Pick your blocks',
    body: 'Browse the Block Palette on the left. Each category has different block types — hypothesis, variables, methods, and more.',
  },
  {
    icon: '🎯',
    title: 'Drop into the pipeline',
    body: 'Drag a block and drop it into the matching numbered zone on the canvas. Build your methodology step by step.',
  },
  {
    icon: '📊',
    title: 'Submit and get scored',
    body: 'Hit "Submit Methodology" to run the rule engine. You\'ll get a score, detailed feedback, and learn why certain combinations don\'t work.',
  },
]

export function Tutorial() {
  const { showTutorial } = useGameState()
  const dismissTutorial = useStore((s) => s.dismissTutorial)

  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={dismissTutorial}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome to ReScratch 🔬</h2>
            <p className="text-gray-500 text-sm mb-6">Build research methodologies like a scientist. Here's how:</p>

            <div className="flex flex-col gap-5 mb-8">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{step.title}</div>
                    <div className="text-gray-500 text-sm mt-0.5">{step.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={dismissTutorial}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
            >
              Let's Go! →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
