import { useStore } from '../store.js'

const DIFFICULTY_STYLES = {
  beginner: 'bg-green-100 text-green-700 border border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  advanced: 'bg-red-100 text-red-700 border border-red-300',
  expert: 'bg-purple-100 text-purple-700 border border-purple-300',
}

export function ResearchQuestion() {
  const currentChallenge = useStore((s) => s.currentChallenge)
  const backToMenu = useStore((s) => s.backToMenu)

  if (!currentChallenge) return null

  const diffStyle = DIFFICULTY_STYLES[currentChallenge.difficulty] || DIFFICULTY_STYLES.beginner

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-start gap-4">
        <button
          onClick={backToMenu}
          className="text-gray-400 hover:text-gray-700 text-sm mt-1 flex-shrink-0 transition-colors"
          title="Back to challenges"
        >
          ← Back
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Level {currentChallenge.level}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diffStyle}`}>
              {currentChallenge.difficulty}
            </span>
            {(currentChallenge.tags || []).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-lg font-bold text-gray-900 leading-snug">
            🔬 {currentChallenge.title}
          </h1>
          {currentChallenge.description && (
            <p className="text-sm text-gray-500 mt-0.5">{currentChallenge.description}</p>
          )}
        </div>
      </div>
    </header>
  )
}
