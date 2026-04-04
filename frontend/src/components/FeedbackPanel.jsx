// Inline feedback badges — rendered inside Canvas zones after submission.
// This is a thin wrapper; the actual inline rendering is done in Canvas.jsx.
// This component is exported for potential standalone use.

import { useGameState } from '../hooks/useGameState.js'

export function FeedbackPanel() {
  const { result } = useGameState()
  if (!result) return null

  return null // Feedback is shown inline in Canvas.jsx zones
}
