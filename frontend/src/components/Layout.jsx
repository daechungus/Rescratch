import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { ResearchQuestion } from './ResearchQuestion.jsx'
import { BlockPalette } from './BlockPalette.jsx'
import { Canvas } from './Canvas.jsx'
import { ScorePanel } from './ScorePanel.jsx'
import { Toolbar } from './Toolbar.jsx'
import { Tutorial } from './Tutorial.jsx'
import { Block } from './Block.jsx'
import { useDragAndDrop } from '../hooks/useDragAndDrop.js'
import { useGameState } from '../hooks/useGameState.js'

export function Layout() {
  const { activeBlock, handleDragStart, handleDragEnd, handleDragCancel } = useDragAndDrop()
  const { gamePhase } = useGameState()

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <ResearchQuestion />

        <div className="flex flex-1 overflow-hidden">
          <BlockPalette />
          <Canvas activeBlock={activeBlock} />
          {gamePhase === 'submitted' && <ScorePanel />}
        </div>

        <Toolbar />
      </div>

      <DragOverlay>
        {activeBlock ? <Block block={activeBlock} isDragOverlay /> : null}
      </DragOverlay>

      <Tutorial />
    </DndContext>
  )
}
