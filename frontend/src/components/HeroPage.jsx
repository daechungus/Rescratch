import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import PILLARS from '../data/pillars.js'
import { PillarCard } from './PillarCard.jsx'
import { ParticleHero } from './ParticleHero.jsx'

export function HeroPage() {
  const pillarsRef = useRef(null)
  const navigate = useNavigate()

  function scrollToPillars() {
    pillarsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-white text-[#1A1A1A]">
      {/* ── Hero Section ──────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFF9F0 0%, #FFFFFF 60%)',
        }}
      >
        {/* Particle canvas — behind everything */}
        <ParticleHero />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ zIndex: 1,
            backgroundImage: 'radial-gradient(circle, #E5E3DE 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6" style={{ pointerEvents: 'auto' }}>
          {/* Logo treatment */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="text-7xl md:text-8xl font-black leading-none tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-[#FFB941]"></span>
              <span className="relative inline-block">
                {/* <span className="text-[#FFB941]">Research</span> */}
                {/* Animated strikethrough */}
                <motion.span
                  // className="absolute left-0 bottom-1/3 h-[10px] bg-[#000000] rounded"
                  // style={{ width: '100%', originX: 0 }}
                  // initial={{ scaleX: 0, opacity: 0 }}
                  // animate={{ scaleX: 1, opacity: 0.5 }}
                  // transition={{ delay: 1, duration: 1, ease: 'easeInOut' }}
                />
              </span> 
            </motion.div>
            <motion.div
              className="text-8xl md:text-9xl font-black leading-none tracking-tight text-[#2EC4B6]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 1.2 }}
            >
              {/* Rescratch */}
            </motion.div>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-lg md:text-xl text-[#6B6B6B] max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.6 }}
          >
            Learn research from scratch.
          </motion.p>

          {/* CTA */}
          <motion.button
            onClick={scrollToPillars}
            className="mt-2 px-8 py-3 rounded-full bg-[#2EC4B6] text-white font-bold text-base hover:bg-[#239E93] transition-colors shadow-lg shadow-[0_4px_20px_rgba(255,185,65,0.25)]"
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
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#9A9A9A]"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── Pillars Section ───────────────────────────── */}
      <section ref={pillarsRef} className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-3">Learn how to conduct research from scratch</h2>
            {/* <p className="text-[#6B6B6B] text-lg">Learn how to conduct research from scratch.</p> */}
          </div>

          {/* Grid: 3-col desktop, 2-col tablet, 1-col mobile. 2nd row centered. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.id}
                className={
                  // On lg screens, center the last 2 cards (row 2) by offsetting
                  i === 3 ? 'lg:col-start-1 lg:col-span-1' :
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
              className="text-[#2EC4B6] hover:text-[#239E93] font-semibold text-sm transition-colors"
            >
              Browse challenges →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
