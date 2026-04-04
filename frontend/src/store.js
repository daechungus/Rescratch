import { create } from 'zustand'
import { fetchChallenges, fetchBlocks, evaluatePipeline } from './api.js'
import { serializePipeline } from './utils/pipelineSerializer.js'

const EMPTY_PIPELINE = {
  HYPOTHESIS: [],
  VARIABLE: [],
  METHOD: [],
  SAMPLE: [],
  DATA_COLLECTION: [],
  ANALYSIS: [],
  CONCLUSION: [],
}

// Categories that only allow one block at a time
const SINGLE_BLOCK_CATEGORIES = new Set([
  'HYPOTHESIS',
  'METHOD',
  'DATA_COLLECTION',
  'ANALYSIS',
  'CONCLUSION',
])

export const useStore = create((set, get) => ({
  challenges: [],
  currentChallenge: null,
  blocks: [],
  pipeline: { ...EMPTY_PIPELINE },
  result: null,
  gamePhase: 'selecting', // 'selecting' | 'building' | 'submitted'
  isLoading: false,
  showTutorial: true,
  hintIndex: 0,

  loadChallenges: async () => {
    set({ isLoading: true })
    try {
      const challenges = await fetchChallenges()
      set({ challenges, isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false })
    }
  },

  loadBlocks: async () => {
    try {
      const blocks = await fetchBlocks()
      set({ blocks })
    } catch (err) {
      console.error(err)
    }
  },

  selectChallenge: (challenge) => {
    set({
      currentChallenge: challenge,
      pipeline: { ...EMPTY_PIPELINE, HYPOTHESIS: [], VARIABLE: [], METHOD: [], SAMPLE: [], DATA_COLLECTION: [], ANALYSIS: [], CONCLUSION: [] },
      result: null,
      gamePhase: 'building',
      hintIndex: 0,
    })
  },

  addBlockToZone: (category, block) => {
    set((state) => {
      const current = state.pipeline[category] || []
      let updated
      if (SINGLE_BLOCK_CATEGORIES.has(category)) {
        // Replace — only one block allowed
        updated = [block]
      } else {
        // Allow multiple, but avoid duplicates by id
        if (current.find((b) => b.id === block.id)) return {}
        updated = [...current, block]
      }
      return {
        pipeline: { ...state.pipeline, [category]: updated },
      }
    })
  },

  removeBlockFromZone: (category, blockId) => {
    set((state) => ({
      pipeline: {
        ...state.pipeline,
        [category]: state.pipeline[category].filter((b) => b.id !== blockId),
      },
    }))
  },

  submitPipeline: async () => {
    const { currentChallenge, pipeline } = get()
    if (!currentChallenge) return
    set({ isLoading: true })
    try {
      const serialized = serializePipeline(pipeline)
      const result = await evaluatePipeline(currentChallenge.id, serialized)
      set({ result, gamePhase: 'submitted', isLoading: false })
    } catch (err) {
      console.error(err)
      set({ isLoading: false })
    }
  },

  resetPipeline: () => {
    set({
      pipeline: { ...EMPTY_PIPELINE, HYPOTHESIS: [], VARIABLE: [], METHOD: [], SAMPLE: [], DATA_COLLECTION: [], ANALYSIS: [], CONCLUSION: [] },
      result: null,
      gamePhase: 'building',
      hintIndex: 0,
    })
  },

  backToMenu: () => {
    set({
      currentChallenge: null,
      pipeline: { ...EMPTY_PIPELINE, HYPOTHESIS: [], VARIABLE: [], METHOD: [], SAMPLE: [], DATA_COLLECTION: [], ANALYSIS: [], CONCLUSION: [] },
      result: null,
      gamePhase: 'selecting',
      hintIndex: 0,
    })
  },

  dismissTutorial: () => set({ showTutorial: false }),

  advanceHint: () => set((state) => ({ hintIndex: state.hintIndex + 1 })),
}))
