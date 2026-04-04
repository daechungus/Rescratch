import { ResearchQuestion } from './ResearchQuestion.jsx'
import { BlockLibrary } from './BlockLibrary.jsx'
import { FreeCanvas } from './FreeCanvas.jsx'
import { ScorePanel } from './ScorePanel.jsx'
import { Toolbar } from './Toolbar.jsx'
import { Tutorial } from './Tutorial.jsx'
import { useGameState } from '../hooks/useGameState.js'

export function Layout() {
  const { gamePhase } = useGameState()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ResearchQuestion />

      <div className="flex flex-1 overflow-hidden">
        <BlockLibrary />
        <FreeCanvas />
        {gamePhase === 'submitted' && <ScorePanel />}
      </div>

      <Toolbar />
      <Tutorial />
    </div>
  )
}
