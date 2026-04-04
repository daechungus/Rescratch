import { useGameState } from './hooks/useGameState.js'
import { Layout } from './components/Layout.jsx'
import { LevelSelect } from './components/LevelSelect.jsx'

export default function App() {
  const { gamePhase } = useGameState()

  if (gamePhase === 'selecting') {
    return <LevelSelect />
  }

  return <Layout />
}
