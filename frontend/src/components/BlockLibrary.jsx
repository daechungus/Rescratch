import { useRef, useState } from 'react'
import { useStore } from '../store.js'
import {
  PIPELINE_ORDER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PORT_COLORS,
} from '../data/blockDefinitions.js'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

export function BlockLibrary() {
  const blocks = useStore((s) => s.blocks)
  const customBlocks = useStore((s) => s.customBlocks)
  const currentChallenge = useStore((s) => s.currentChallenge)
  const addBlockToCanvas = useStore((s) => s.addBlockToCanvas)
  const addCustomBlock = useStore((s) => s.addCustomBlock)
  const removeCustomBlock = useStore((s) => s.removeCustomBlock)
  const updateCustomBlock = useStore((s) => s.updateCustomBlock)
  const sectionRefs = useRef({})

  const availableCategories = currentChallenge?.available_categories || PIPELINE_ORDER

  // Create-form state
  const [showCreate, setShowCreate] = useState(false)
  const [createCat,  setCreateCat]  = useState(availableCategories[0] || PIPELINE_ORDER[0])
  const [createLabel, setCreateLabel] = useState('')
  const [createDesc,  setCreateDesc]  = useState('')

  // Inline-edit state
  const [editId, setEditId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editDesc,  setEditDesc]  = useState('')

  const blocksByCategory = PIPELINE_ORDER.reduce((acc, cat) => {
    if (availableCategories.includes(cat)) {
      acc[cat] = blocks.filter((b) => b.category === cat)
    }
    return acc
  }, {})

  const visibleCustom = customBlocks.filter((b) => availableCategories.includes(b.category))

  function scrollTo(cat) {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!createLabel.trim()) return
    const block = addCustomBlock({ category: createCat, label: createLabel, description: createDesc })
    addBlockToCanvas(block)
    setCreateLabel(''); setCreateDesc(''); setShowCreate(false)
  }

  function startEdit(block) {
    setEditId(block.id); setEditLabel(block.label); setEditDesc(block.description)
  }

  function handleEdit(e) {
    e.preventDefault()
    if (!editLabel.trim()) return
    updateCustomBlock(editId, { label: editLabel, description: editDesc })
    setEditId(null)
  }

  return (
    <aside className="flex-1 flex flex-col bg-[#F7F7F5] text-[#1A1A1A] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E3DE] flex-shrink-0 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">Block Library</h2>
          <p className="text-xs text-[#9A9A9A] mt-0.5">Click a block to add it to the canvas</p>
        </div>
        <button
          onClick={() => { setShowCreate((v) => !v); setCreateCat(availableCategories[0] || PIPELINE_ORDER[0]) }}
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0
            ${showCreate ? 'bg-[#E5E3DE] text-[#1A1A1A]' : 'bg-[#2EC4B6] text-white hover:bg-[#239E93]'}`}
          title="Create a custom block"
        >
          {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showCreate ? 'Cancel' : 'Custom'}
        </button>
      </div>

      {/* Inline create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="flex-shrink-0 px-3 py-3 border-b border-[#E5E3DE] bg-white flex flex-col gap-2"
        >
          <p className="text-[10px] font-black tracking-widest uppercase text-[#9A9A9A]">New Custom Block</p>

          <select
            value={createCat}
            onChange={(e) => setCreateCat(e.target.value)}
            className="text-xs bg-[#F7F7F5] border border-[#E5E3DE] rounded-lg px-2 py-1.5 text-[#1A1A1A] focus:outline-none focus:border-[#2EC4B6]"
          >
            {PIPELINE_ORDER.filter((c) => availableCategories.includes(c)).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          <input
            required
            value={createLabel}
            onChange={(e) => setCreateLabel(e.target.value)}
            placeholder="Block name (required)"
            className="text-xs bg-[#F7F7F5] border border-[#E5E3DE] rounded-lg px-2 py-1.5 text-[#1A1A1A] placeholder-[#B0AFAB] focus:outline-none focus:border-[#2EC4B6]"
          />

          <textarea
            value={createDesc}
            onChange={(e) => setCreateDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="text-xs bg-[#F7F7F5] border border-[#E5E3DE] rounded-lg px-2 py-1.5 text-[#1A1A1A] placeholder-[#B0AFAB] focus:outline-none focus:border-[#2EC4B6] resize-none"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#2EC4B6] text-white rounded-lg py-1.5 hover:bg-[#239E93] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add to canvas
          </button>
        </form>
      )}

      {/* Category tab pills */}
      <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-[#E5E3DE] flex-shrink-0">
        {visibleCustom.length > 0 && (
          <button
            onClick={() => sectionRefs.current['__custom']?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="text-xs font-bold px-2 py-1 rounded-full transition-opacity hover:opacity-100 opacity-80 bg-[#6B6B6B] text-white"
            title="Custom Blocks"
          >
            ✏
          </button>
        )}
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

        {/* ── Custom blocks section ── */}
        {visibleCustom.length > 0 && (
          <div ref={(el) => (sectionRefs.current['__custom'] = el)}>
            <div className="px-4 py-2 flex items-center gap-2 sticky top-0 bg-[#F7F7F5] border-b border-[#E5E3DE]">
              <span className="w-3 h-3 rounded-full bg-[#6B6B6B] flex-shrink-0" />
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">✏ Custom Blocks</span>
            </div>
            <div className="px-2 py-2 flex flex-col gap-1.5">
              {visibleCustom.map((block) => {
                const colors = CATEGORY_COLORS[block.category]
                if (editId === block.id) {
                  return (
                    <form
                      key={block.id}
                      onSubmit={handleEdit}
                      className="rounded-lg border-2 border-dashed border-[#2EC4B6] bg-white px-3 py-2 flex flex-col gap-1.5"
                    >
                      <p className="text-[10px] text-[#9A9A9A] font-bold uppercase tracking-widest">
                        {CATEGORY_ICONS[block.category]} {CATEGORY_LABELS[block.category]}
                      </p>
                      <input
                        required autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="text-xs bg-[#F7F7F5] border border-[#E5E3DE] rounded px-2 py-1 text-[#1A1A1A] focus:outline-none focus:border-[#2EC4B6]"
                      />
                      <textarea
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="text-xs bg-[#F7F7F5] border border-[#E5E3DE] rounded px-2 py-1 text-[#1A1A1A] focus:outline-none focus:border-[#2EC4B6] resize-none"
                      />
                      <div className="flex gap-1.5">
                        <button type="submit" className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-[#2EC4B6] text-white rounded py-1 hover:bg-[#239E93] transition-colors">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button type="button" onClick={() => setEditId(null)} className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-[#E5E3DE] text-[#6B6B6B] rounded py-1 hover:bg-[#D5D3CE] transition-colors">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </form>
                  )
                }
                return (
                  <div key={block.id} className="group relative">
                    <button
                      onClick={() => addBlockToCanvas(block)}
                      className={`w-full text-left rounded-lg border-2 border-dashed px-3 py-2 transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.badge}`} />
                        <span className={`text-xs font-bold ${colors.text} leading-tight flex-1`}>{block.label}</span>
                        <span className="text-[9px] font-black text-[#9A9A9A] bg-[#E5E3DE] rounded px-1 py-0.5 flex-shrink-0">custom</span>
                      </div>
                      {block.description && (
                        <p className="text-xs text-[#6B6B6B] leading-snug line-clamp-2">{block.description}</p>
                      )}
                      <p className="mt-1 text-xs text-[#9A9A9A] opacity-0 group-hover:opacity-100 transition-opacity">+ Add to canvas</p>
                    </button>
                    {/* Edit / delete controls */}
                    <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(block) }}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-[#E5E3DE] text-[#6B6B6B] hover:text-[#2EC4B6] transition-colors shadow-sm"
                        title="Edit"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCustomBlock(block.id) }}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-[#E5E3DE] text-[#6B6B6B] hover:text-red-500 transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Built-in blocks by category ── */}
        {PIPELINE_ORDER.filter((cat) => availableCategories.includes(cat)).map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          const catBlocks = blocksByCategory[cat] || []

          return (
            <div key={cat} ref={(el) => (sectionRefs.current[cat] = el)}>
              {/* Category header */}
              <div className={`px-4 py-2 flex items-center gap-2 sticky top-0 bg-[#F7F7F5] border-b border-[#E5E3DE]`}>
                <span className={`w-3 h-3 rounded-full ${colors.badge} flex-shrink-0`} />
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
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
      <p className="text-xs text-[#6B6B6B] leading-snug line-clamp-2">{block.description}</p>
      <div className="mt-1 text-xs text-[#9A9A9A] opacity-0 group-hover:opacity-100 transition-opacity">
        + Add to canvas
      </div>
    </button>
  )
}
