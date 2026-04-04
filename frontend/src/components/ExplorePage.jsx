import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { useStore } from '../store.js'
import PILLARS, { getSubtopicLabel } from '../data/pillars.js'
import { FilterSidebar } from './FilterSidebar.jsx'
import { ChallengeRow } from './ChallengeRow.jsx'

const DIFF_ORDER = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 }
const PAGE_SIZE = 25

export function ExplorePage() {
  const challenges = useStore((s) => s.challenges)
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('easy')

  const filters = {
    pillar: searchParams.get('pillar') || '',
    subtopic: searchParams.get('subtopic') || '',
    difficulty: searchParams.get('difficulty') || '',
    search: searchParams.get('search') || '',
  }

  function onFilterChange(patch) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => {
        if (v) next.set(k, v)
        else next.delete(k)
      })
      return next
    }, { replace: true })
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = [...challenges]
    if (filters.pillar) list = list.filter((c) => c.pillar === filters.pillar)
    if (filters.subtopic) list = list.filter((c) => c.subtopic === filters.subtopic)
    if (filters.difficulty) list = list.filter((c) => c.difficulty === filters.difficulty)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      )
    }
    // Sort
    if (sort === 'easy') list.sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 99) - (DIFF_ORDER[b.difficulty] ?? 99))
    else if (sort === 'hard') list.sort((a, b) => (DIFF_ORDER[b.difficulty] ?? 99) - (DIFF_ORDER[a.difficulty] ?? 99))
    // 'newest' keeps insertion order (already newest-first from arxiv fetch)
    return list
  }, [challenges, filters.pillar, filters.subtopic, filters.difficulty, filters.search, sort])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  // Build page header
  const activePillar = filters.pillar ? PILLARS.find((p) => p.id === filters.pillar) : null
  const activeSubtopicLabel = filters.subtopic ? getSubtopicLabel(filters.subtopic) : null

  return (
    <div className="min-h-screen bg-gray-950 pt-14">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <FilterSidebar filters={filters} onFilterChange={onFilterChange} />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="mb-6">
            {activePillar ? (
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{activePillar.emoji}</span>
                  <span>{activePillar.title}</span>
                  {activeSubtopicLabel && (
                    <span className="text-gray-500 font-normal">
                      / {activeSubtopicLabel}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{activePillar.focus}</p>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-white">All Challenges</h1>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Showing {filtered.length} challenge{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Sort */}
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="text-sm bg-gray-800 border border-white/10 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="easy">Difficulty (Easy First)</option>
              <option value="hard">Difficulty (Hard First)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Challenge list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <SearchX className="w-12 h-12 text-gray-700" />
              <p className="text-gray-500">No challenges found matching your filters.</p>
              <button
                onClick={() => onFilterChange({ pillar: '', subtopic: '', difficulty: '', search: '' })}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filters.pillar}-${filters.subtopic}-${filters.difficulty}-${filters.search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-2"
                >
                  {visible.map((challenge, i) => (
                    <ChallengeRow key={challenge.id} challenge={challenge} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm"
                  >
                    Load More ({filtered.length - visible.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
