import PILLARS from '../data/pillars.js'

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All', color: 'bg-gray-700 text-gray-300' },
  { value: 'beginner', label: 'Beginner', color: 'bg-green-900/60 text-green-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-900/60 text-yellow-400' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-900/60 text-orange-400' },
  { value: 'expert', label: 'Expert', color: 'bg-red-900/60 text-red-400' },
]

export function FilterSidebar({ filters, onFilterChange }) {
  const hasAnyFilter = filters.pillar || filters.subtopic || filters.difficulty

  const activePillar = filters.pillar ? PILLARS.find((p) => p.id === filters.pillar) : null

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col gap-6 py-6 pr-4">
      {/* Discipline */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Discipline
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onFilterChange({ pillar: '', subtopic: '' })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left border-l-2 ${
              !filters.pillar
                ? 'bg-gray-800 text-white border-indigo-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-transparent'
            }`}
          >
            All Disciplines
          </button>
          {PILLARS.map((pillar) => {
            const isActive = filters.pillar === pillar.id
            return (
              <button
                key={pillar.id}
                onClick={() =>
                  onFilterChange({ pillar: isActive ? '' : pillar.id, subtopic: '' })
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left border-l-2 ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                style={{ borderLeftColor: isActive ? pillar.color : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderLeftColor = pillar.color + '60' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderLeftColor = 'transparent' }}
              >
                <span>{pillar.emoji}</span>
                <span>{pillar.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Subtopic — only when pillar selected */}
      {activePillar && (
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Topic
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onFilterChange({ subtopic: '' })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                !filters.subtopic ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${!filters.subtopic ? 'bg-indigo-400' : 'bg-gray-700'}`}
              />
              All Topics
            </button>
            {activePillar.subtopics.map((s) => {
              const isActive = filters.subtopic === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onFilterChange({ subtopic: isActive ? '' : s.id })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isActive ? activePillar.color : '#374151' }}
                  />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Difficulty */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Difficulty
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ difficulty: opt.value })}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${opt.color} ${
                filters.difficulty === opt.value
                  ? 'ring-2 ring-white/30 scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status (placeholder) */}
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Status
        </div>
        <div className="flex flex-col gap-1">
          {['All', 'Not Started', 'Completed'].map((s, i) => (
            <button
              key={s}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                i === 0 ? 'text-white' : 'text-gray-600 cursor-not-allowed'
              }`}
              disabled={i > 0}
              title={i > 0 ? 'Coming soon — no persistence yet' : undefined}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${i === 0 ? 'bg-indigo-400' : 'bg-gray-700'}`} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasAnyFilter && (
        <button
          onClick={() => onFilterChange({ pillar: '', subtopic: '', difficulty: '' })}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left underline underline-offset-2"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  )
}
