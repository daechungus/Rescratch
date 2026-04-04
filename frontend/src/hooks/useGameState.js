import { useStore } from '../store.js'

export function useGameState() {
  return useStore((state) => ({
    pipeline: state.pipeline,
    currentChallenge: state.currentChallenge,
    result: state.result,
    gamePhase: state.gamePhase,
    isLoading: state.isLoading,
    showTutorial: state.showTutorial,
    hintIndex: state.hintIndex,
  }))
}
