import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import PILLARS from '../data/pillars.js'
import { PillarCard } from './PillarCard.jsx'

export function HeroPage() {
  const pillarsRef = useRef(null)
  const navigate = useNavigate()

  function scrollToPillars() {
    pillarsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-gray-950 text-white">
      {/* ── Hero Section ──────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1e1b4b 0%, #030712 70%)',
        }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Logo treatment */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="text-6xl md:text-7xl font-black leading-none tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-gray-300">Re</span>
              <span className="relative inline-block">
                <span className="text-gray-500">search</span>
                {/* Animated strikethrough */}
                <motion.span
                  className="absolute left-0 top-1/2 h-[3px] bg-gray-400 rounded"
                  style={{ width: '100%', originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.35, ease: 'easeInOut' }}
                />
              </span>
            </motion.div>
            <motion.div
              className="text-6xl md:text-7xl font-black leading-none tracking-tight text-indigo-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              scratch.
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            Learn research methodology by doing.
          </motion.p>

          {/* CTA */}
          <motion.button
            onClick={scrollToPillars}
            className="mt-2 px-8 py-3 rounded-full bg-indigo-500 text-white font-bold text-base hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-900/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Exploring
          </motion.button>
        </div>

        {/* Scroll chevron */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── Pillars Section ───────────────────────────── */}
      <section ref={pillarsRef} className="py-24 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">Choose Your Field</h2>
            <p className="text-gray-500 text-lg">Pick a discipline. Master its methodology.</p>
          </div>

          {/* Grid: 3-col desktop, 2-col tablet, 1-col mobile. 2nd row centered. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.id}
                className={
                  // On lg screens, center the last 2 cards (row 2) by offsetting
                  i === 3 ? 'lg:col-start-1 lg:col-span-1 lg:ml-[calc(50%+0.625rem)]' :
                  i === 4 ? 'lg:col-start-2 lg:col-span-1' :
                  ''
                }
              >
                <PillarCard pillar={pillar} delay={i * 0.1} />
              </div>
            ))}
          </div>

          {/* Browse all */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/explore')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors"
            >
              Or browse all 110 challenges →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
