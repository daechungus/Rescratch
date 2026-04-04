import { useState } from 'react'
import { useStore } from '../store.js'
import { DraggableBlock } from './Block.jsx'
import {
  PIPELINE_ORDER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from '../data/blockDefinitions.js'

export function BlockPalette() {
  const blocks = useStore((s) => s.blocks)
  const currentChallenge = useStore((s) => s.currentChallenge)
  const [collapsed, setCollapsed] = useState({})

  const availableCategories = currentChallenge?.available_categories || PIPELINE_ORDER

  const blocksByCategory = PIPELINE_ORDER.reduce((acc, cat) => {
    if (availableCategories.includes(cat)) {
      acc[cat] = blocks.filter((b) => b.category === cat)
    }
    return acc
  }, {})

  const toggleCategory = (cat) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))

  return (
    <aside className="w-64 min-w-[16rem] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Block Palette</h2>
        <p className="text-xs text-gray-400 mt-0.5">Drag blocks to the pipeline →</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {PIPELINE_ORDER.filter((cat) => availableCategories.includes(cat)).map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          const isCollapsed = collapsed[cat]
          const catBlocks = blocksByCategory[cat] || []

          return (
            <div key={cat} className="border-b border-gray-100">
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-xs text-gray-400">({catBlocks.length})</span>
                </div>
                <span className="text-gray-400 text-xs">{isCollapsed ? '▶' : '▼'}</span>
              </button>

              {!isCollapsed && (
                <div className="px-3 pb-3 flex flex-col gap-2">
                  {catBlocks.map((block) => (
                    <DraggableBlock key={block.id} block={block} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
