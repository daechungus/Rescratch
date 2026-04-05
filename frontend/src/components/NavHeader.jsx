import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import { useStore } from '../store.js'
import PILLARS, { getSubtopicLabel, getPillarForSubtopic } from '../data/pillars.js'

export function NavHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const inputRef = useRef(null)

  const isHero = location.pathname === '/'
  const isExplore = location.pathname === '/explore'
  const isLab = location.pathname.startsWith('/lab/')

  // Transparent → opaque scroll effect on hero
  useEffect(() => {
    if (!isHero) return
    function onScroll() { setScrolled(window.scrollY > 100) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHero])

  // Sync search input with URL param when on explore page
  useEffect(() => {
    if (isExplore) {
      const q = new URLSearchParams(location.search).get('search') || ''
      setSearch(q)
    }
  }, [isExplore, location.search])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!search.trim()) return
    if (isExplore) {
      const params = new URLSearchParams(location.search)
      params.set('search', search.trim())
      navigate('/explore?' + params.toString())
    } else {
      navigate('/explore?search=' + encodeURIComponent(search.trim()))
    }
  }

  const bgClass = isHero && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 border-b border-[#E5E3DE]'

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 z-50 backdrop-blur-md transition-all duration-300 ${bgClass}`}
      style={{ flexShrink: 0 }}
    >
      <div className="h-full px-6 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 text-xl font-bold tracking-tight">
          <span className="text-[#9A9A9A]">Re</span>
          <span className="text-[#2EC4B6]">Scratch</span>
        </Link>

        {/* Explore tab */}
        <Link
          to="/explore"
          className={`text-base font-medium transition-colors flex-shrink-0 gap-4 ${
            isExplore
              ? 'text-[#1A1A1A] border-b-2 border-[#2EC4B6] pb-0.5'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          Explore
        </Link>

        {/* Lab breadcrumb */}
        {isLab && <LabBreadcrumb />}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search — hidden on lab */}
        {!isLab && (
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] w-4 h-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                // Live filter while on explore
                if (isExplore) {
                  const params = new URLSearchParams(location.search)
                  if (e.target.value) params.set('search', e.target.value)
                  else params.delete('search')
                  navigate('/explore?' + params.toString(), { replace: true })
                }
              }}
              placeholder="Search challenges..."
              className="w-60 pl-9 pr-4 py-1.5 rounded-full bg-[#F7F7F5] border border-[#E5E3DE] text-sm text-[#1A1A1A] placeholder-[#9A9A9A] focus:outline-none focus:border-[#2EC4B6] transition-colors"
            />
          </form>
        )}

        {/* Profile */}
        <div className="relative flex-shrink-0">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center hover:bg-[#EFEFEC] transition-colors"
          >
            <User className="w-4 h-4 text-[#6B6B6B]" />
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-10 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-[#E5E3DE]">
              Coming soon
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function LabBreadcrumb() {
  const { challengeId } = useParams()
  const challenges = useStore((s) => s.challenges)
  const challenge = challenges.find((c) => c.id === challengeId)

  if (!challenge) return null

  const pillar = challenge.pillar ? PILLARS.find((p) => p.id === challenge.pillar) : null
  const subtopicLabel = challenge.subtopic ? getSubtopicLabel(challenge.subtopic) : null

  return (
    <nav className="flex items-center gap-1 text-xs text-[#9A9A9A] min-w-0 overflow-hidden">
      <span className="text-[#9A9A9A]">/</span>
      {pillar && (
        <>
          <Link
            to={`/explore?pillar=${pillar.id}`}
            className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
          >
            {pillar.emoji} {pillar.title}
          </Link>
          <span className="text-[#9A9A9A]">/</span>
        </>
      )}
      {subtopicLabel && (
        <>
          <Link
            to={`/explore?pillar=${challenge.pillar}&subtopic=${challenge.subtopic}`}
            className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
          >
            {subtopicLabel}
          </Link>
          <span className="text-[#9A9A9A]">/</span>
        </>
      )}
      <span className="text-[#6B6B6B] truncate max-w-[200px]">{challenge.title}</span>
    </nav>
  )
}
