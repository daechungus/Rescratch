import { useRef, useState, useCallback, useEffect } from 'react'
import { ResearchQuestion } from './ResearchQuestion.jsx'
import { LeftPanel } from './LeftPanel.jsx'
import { FreeCanvas } from './FreeCanvas.jsx'
import { ScorePanel } from './ScorePanel.jsx'
import { Toolbar } from './Toolbar.jsx'
import { Tutorial } from './Tutorial.jsx'
import { useGameState } from '../hooks/useGameState.js'

const MIN_WIDTH = 220
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 288

export function Layout() {
  const { gamePhase } = useGameState()
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startW   = useRef(0)

  const onMouseDown = useCallback((e) => {
    dragging.current = true
    startX.current   = e.clientX
    startW.current   = panelWidth
    document.body.style.cursor    = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }, [panelWidth])

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging.current) return
      const delta = e.clientX - startX.current
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + delta)))
    }
    function onMouseUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden pt-14">
      <ResearchQuestion />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — width controlled by drag */}
        <div style={{ width: panelWidth, minWidth: panelWidth }} className="flex flex-col overflow-hidden">
          <LeftPanel />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="w-1 flex-shrink-0 bg-[#E5E3DE] hover:bg-[#2EC4B6] transition-colors cursor-col-resize group relative"
          title="Drag to resize"
        >
          {/* Grab affordance dots */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>
        </div>

        <FreeCanvas />
        {gamePhase === 'submitted' && <ScorePanel />}
      </div>

      <Toolbar />
      <Tutorial />
    </div>
  )
}
