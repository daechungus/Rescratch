import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/blockDefinitions.js'

export function Block({ block, isDragOverlay = false, onRemove = null }) {
  const colors = CATEGORY_COLORS[block.category] || {}

  if (isDragOverlay) {
    return (
      <div className={`rounded-lg border-2 p-3 shadow-xl cursor-grabbing w-56 ${colors.bg} ${colors.border}`}>
        <BlockContent block={block} colors={colors} />
      </div>
    )
  }

  return (
    <div className={`rounded-lg border-2 p-3 shadow-sm ${colors.bg} ${colors.border} relative group`}>
      <BlockContent block={block} colors={colors} />
      {onRemove && (
        <button
          onClick={() => onRemove(block.id)}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-400 hover:text-white text-gray-500 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove block"
        >
          ×
        </button>
      )}
    </div>
  )
}

function BlockContent({ block, colors }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge} ${colors.badgeText}`}>
          {CATEGORY_LABELS[block.category]?.slice(0, 3).toUpperCase()}
        </span>
        <span className={`text-sm font-semibold ${colors.text}`}>{block.label}</span>
      </div>
      <p className="text-xs text-gray-500 leading-snug">{block.description}</p>
    </>
  )
}

export function DraggableBlock({ block }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { block },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  const colors = CATEGORY_COLORS[block.category] || {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border-2 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${colors.bg} ${colors.border}`}
    >
      <BlockContent block={block} colors={colors} />
    </div>
  )
}
