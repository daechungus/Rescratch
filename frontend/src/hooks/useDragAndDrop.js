import { useState } from 'react'
import { useStore } from '../store.js'

export function useDragAndDrop() {
  const [activeBlock, setActiveBlock] = useState(null)
  const addBlockToZone = useStore((s) => s.addBlockToZone)

  function handleDragStart(event) {
    const { active } = event
    setActiveBlock(active.data.current?.block || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveBlock(null)

    if (!over) return

    const block = active.data.current?.block
    const targetCategory = over.id // drop zone id == category string

    if (!block || !targetCategory) return

    // Only allow drops into the matching category zone
    if (block.category === targetCategory) {
      addBlockToZone(targetCategory, block)
    }
  }

  function handleDragCancel() {
    setActiveBlock(null)
  }

  return { activeBlock, handleDragStart, handleDragEnd, handleDragCancel }
}
