import { useStore } from '../store.js'

export function useGameState() {
  return useStore((state) => ({
    canvasBlocks: state.canvasBlocks,
    connections: state.connections,
    connectingFrom: state.connectingFrom,
    liveValidation: state.liveValidation,
    currentChallenge: state.currentChallenge,
    result: state.result,
    gamePhase: state.gamePhase,
    isLoading: state.isLoading,
    showTutorial: state.showTutorial,
    hintIndex: state.hintIndex,
  }))
}
