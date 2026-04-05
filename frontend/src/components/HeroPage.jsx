import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import PILLARS from '../data/pillars.js'
import { PillarCard } from './PillarCard.jsx'
import { ParticleHero } from './ParticleHero.jsx'
import { PaperBackground } from './PaperBackground.jsx'

// Font applied to the features/mission sections.
// Swap the value to 'Ubuntu, sans-serif' or 'Overpass, sans-serif' to change.
const SECTION_FONT = "'Lora', Georgia, serif"
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut', delay },
})

const FEATURES = [
  {
    title: 'Design research by snapping blocks together',
    body: `Drag Hypothesis, Variable, Method, Sample, Data Collection, Analysis, and Conclusion blocks onto a free canvas. Wire them up in order and get direct feedback on what went wrong.`,
  },
  {
    title: 'Debug a flawed study, then fix it',
    body: 'Some challenges drop you inside a pre-built pipeline riddled with logical errors: wrong block order, missing controls, invalid connections. Your job is to find and repair every flaw.',
  },
  {
    title: 'Every challenge starts with a real scenario',
    body: 'Before you build anything you read a concise research brief: the question, the context, the constraints. Each puzzle is grounded in an actual study design problem so the methodology choices feel meaningful.',
  },
]

export function HeroPage() {
  const pillarsRef = useRef(null)
  const navigate = useNavigate()

  function scrollToPillars() {
    pillarsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-white text-[#1A1A1A]" style={{ fontFamily: SECTION_FONT }}>
      {/* ── Hero Section ──────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{
          background: '#f9f7f2',
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
            className="text-2xl md:text-3xl text-[#6B6B6B] max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.6 }}
          >
            Research from Scratch
          </motion.p>

          {/* CTA */}
          <motion.button
            onClick={scrollToPillars}
            className="mt-2 px-8 py-3 bg-[#2EC4B6] rounded-full text-white font-bold text-base hover:bg-[#239E93] transition-colors shadow-lg shadow-[0_4px_20px_rgba(255,185,65,0.25)]"
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

      {/* ── Paper background wraps Mission + Features + Pillars ── */}
      <div className="relative overflow-hidden">
        <PaperBackground />

      {/* ── Mission Section ───────────────────────────── */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto text-center px-10 py-14">
          <motion.p
            className="text-xs font-bold tracking-widest uppercase text-[#2EC4B6] mb-4"
            {...fadeUp(0)}
          >
            Why Rescratch
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-[#1A1A1A] mb-6"
            {...fadeUp(0.08)}
          >
            Research should be available to everyone.
          </motion.h2>
          <motion.p
            className="text-lg text-[#5A5A5A] leading-relaxed max-w-4xl mx-auto mb-10"
            {...fadeUp(0.16)}
          >
            Most students encounter research methodology through textbooks and lectures — passive, disconnected from practice. By the time they face a real study design problem, the concepts feel slippery.
          </motion.p>
          <motion.p
            className="text-lg text-[#5A5A5A] leading-relaxed max-w-4xl mx-auto"
            {...fadeUp(0.22)}
          >
            Rescratch flips that. It's a visual puzzle game where you construct research pipelines, debug broken studies, and receive instant rule-based feedback — building the muscle memory that reading alone never could.
          </motion.p>

          {/* Divider accent */}
          <motion.div
            className="mx-auto mt-12 flex items-center gap-3 justify-center"
            {...fadeUp(0.28)}
          >
            <div className="h-px w-16 bg-[#E5E3DE]" />
            <div className="w-2 h-2 rounded-full bg-[#2EC4B6]" />
            <div className="h-px w-16 bg-[#E5E3DE]" />
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp(0)}>
            <p className="text-xs font-bold tracking-widest uppercase text-[#FFB941] mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
              Three ways to build research intuition
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="border border-[#EBEBEB] flex flex-col"
                  style={{ background: '#F8F8F8', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}
                  {...fadeUp(i * 0.1)}
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.07)' }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="p-7 flex flex-col gap-4 flex-1">
                    <h3 className="text-xl font-black leading-snug tracking-tight text-[#1A1A1A]">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed flex-1">
                      {f.body}
                    </p>
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Score callout strip
          <motion.div
            className="mt-10 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{ background: '#F0FAFA', border: '1px solid #C8EFEC' }}
            {...fadeUp(0.3)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#2EC4B6' }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-[#1A1A1A] mb-1">Instant, rule-based scoring — no AI black box</p>
              <p className="text-sm text-[#5A5A5A] leading-relaxed">
                Every submission is evaluated by a deterministic engine across three dimensions: completeness (are all required stages present?), coherence (do the connections make logical sense?), and rigor (are the right controls and methods in place?). You always know exactly why you lost points.
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/explore')}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: '#2EC4B6' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Try a challenge <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div> */}
        </div>
      </section>

      {/* ── Pillars Section ───────────────────────────── */}
      <section ref={pillarsRef} className="relative z-10 py-24 px-6">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-3">
              Learn how to conduct research from scratch
            </h2>
          </div>

          {/* Grid: 3-col desktop, 2-col tablet, 1-col mobile. 2nd row centered. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.id}
                className={
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

      </div>{/* end paper background wrapper */}
    </div>
  )
}