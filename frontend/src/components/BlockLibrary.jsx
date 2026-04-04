import { useRef } from 'react'
import { useStore } from '../store.js'
import {
  PIPELINE_ORDER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PORT_COLORS,
} from '../data/blockDefinitions.js'

export function BlockLibrary() {
  const blocks = useStore((s) => s.blocks)
  const currentChallenge = useStore((s) => s.currentChallenge)
  const addBlockToCanvas = useStore((s) => s.addBlockToCanvas)
  const sectionRefs = useRef({})

  const availableCategories = currentChallenge?.available_categories || PIPELINE_ORDER

  const blocksByCategory = PIPELINE_ORDER.reduce((acc, cat) => {
    if (availableCategories.includes(cat)) {
      acc[cat] = blocks.filter((b) => b.category === cat)
    }
    return acc
  }, {})

  function scrollTo(cat) {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="w-64 min-w-[16rem] flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <h2 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Block Library</h2>
        <p className="text-xs text-gray-500 mt-0.5">Click a block to add it to the canvas</p>
      </div>

      {/* Category tab pills */}
      <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-gray-700 flex-shrink-0">
        {PIPELINE_ORDER.filter((cat) => availableCategories.includes(cat)).map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => scrollTo(cat)}
              className={`text-xs font-bold px-2 py-1 rounded-full transition-opacity hover:opacity-100 opacity-80 ${colors.badge} text-white`}
              title={CATEGORY_LABELS[cat]}
            >
              {CATEGORY_ICONS[cat]}
            </button>
          )
        })}
      </div>

      {/* Scrollable block list */}
      <div className="flex-1 overflow-y-auto">
        {PIPELINE_ORDER.filter((cat) => availableCategories.includes(cat)).map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          const catBlocks = blocksByCategory[cat] || []

          return (
            <div key={cat} ref={(el) => (sectionRefs.current[cat] = el)}>
              {/* Category header */}
              <div className={`px-4 py-2 flex items-center gap-2 sticky top-0 bg-gray-800 border-b border-gray-700`}>
                <span className={`w-3 h-3 rounded-full ${colors.badge} flex-shrink-0`} />
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </span>
              </div>

              {/* Blocks */}
              <div className="px-2 py-2 flex flex-col gap-1.5">
                {catBlocks.map((block) => (
                  <LibraryBlock key={block.id} block={block} colors={colors} onAdd={addBlockToCanvas} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function LibraryBlock({ block, colors, onAdd }) {
  return (
    <button
      onClick={() => onAdd(block)}
      className={`w-full text-left rounded-lg border px-3 py-2 transition-all
        hover:scale-[1.02] hover:shadow-md active:scale-95
        ${colors.bg} ${colors.border} group`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.badge}`} />
        <span className={`text-xs font-bold ${colors.text} leading-tight`}>{block.label}</span>
      </div>
      <p className="text-xs text-gray-500 leading-snug line-clamp-2">{block.description}</p>
      <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        + Add to canvas
      </div>
    </button>
  )
}
