import { create } from 'zustand'
import { fetchChallenges, fetchBlocks, evaluatePipeline } from './api.js'
import { serializePipeline } from './utils/pipelineSerializer.js'
import { validatePipelineClient } from './utils/connectionValidator.js'

let instanceCounter = 0
function makeInstanceId() { return `block_${++instanceCounter}_${Date.now()}` }
function makeConnectionId() { return `conn_${++instanceCounter}_${Date.now()}` }

let spawnOffset = 0
function nextSpawnPos() {
  spawnOffset = (spawnOffset + 1) % 8
  return { x: 200 + spawnOffset * 35, y: 100 + spawnOffset * 45 }
}

export const useStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────────────────────
  challenges: [],
  currentChallenge: null,
  blocks: [],

  // ── Canvas ────────────────────────────────────────────────────────────────
  // canvasBlocks: [{ instanceId, blockDefId, category, label, description, x, y, ...blockDefFields }]
  canvasBlocks: [],
  // connections: [{ id, fromInstanceId, toInstanceId }]
  connections: [],
  connectingFrom: null,   // instanceId of block whose output port was clicked
  rejectTarget: null,     // instanceId to play shake animation on

  // ── Live validation ────────────────────────────────────────────────────────
  liveValidation: { errors: [], warnings: [], isValid: true },

  // ── Results & flow ────────────────────────────────────────────────────────
  result: null,
  gamePhase: 'selecting',  // 'selecting' | 'building' | 'submitted'
  isLoading: false,
  showTutorial: true,
  hintIndex: 0,

  // ── Data loading ──────────────────────────────────────────────────────────
  loadChallenges: async () => {
    set({ isLoading: true })
    try { set({ challenges: await fetchChallenges(), isLoading: false }) }
    catch (err) { console.error(err); set({ isLoading: false }) }
  },

  loadBlocks: async () => {
    try { set({ blocks: await fetchBlocks() }) }
    catch (err) { console.error(err) }
  },

  // ── Game flow ─────────────────────────────────────────────────────────────
  selectChallenge: (challenge) => {
    spawnOffset = 0; instanceCounter = 0
    let canvasBlocks = [], connections = []

    if (challenge.type === 'broken_lab' && challenge.broken_canvas) {
      const defsById = Object.fromEntries(get().blocks.map((b) => [b.id, b]))
      canvasBlocks = (challenge.broken_canvas.blocks || []).map((b) => ({
        instanceId: b.instanceId, blockDefId: b.blockDefId,
        x: b.x, y: b.y, ...(defsById[b.blockDefId] || {}),
      }))
      connections = (challenge.broken_canvas.connections || []).map((c) => ({ ...c }))
    }

    set({
      currentChallenge: challenge, canvasBlocks, connections,
      connectingFrom: null, rejectTarget: null, result: null,
      liveValidation: { errors: [], warnings: [], isValid: true },
      gamePhase: 'building', hintIndex: 0,
    })
  },

  backToMenu: () => {
    spawnOffset = 0
    set({
      currentChallenge: null, canvasBlocks: [], connections: [],
      connectingFrom: null, rejectTarget: null, result: null,
      liveValidation: { errors: [], warnings: [], isValid: true },
      gamePhase: 'selecting', hintIndex: 0,
    })
  },

  resetCanvas: () => {
    spawnOffset = 0
    set({
      canvasBlocks: [], connections: [], connectingFrom: null,
      rejectTarget: null, result: null,
      liveValidation: { errors: [], warnings: [], isValid: true },
      gamePhase: 'building', hintIndex: 0,
    })
  },

  retrySubmit: () => set({ result: null, gamePhase: 'building' }),

  // ── Canvas: blocks ────────────────────────────────────────────────────────
  addBlockToCanvas: (blockDef) => {
    const pos = nextSpawnPos()
    const newBlock = { instanceId: makeInstanceId(), blockDefId: blockDef.id, x: pos.x, y: pos.y, ...blockDef }
    set((state) => {
      const canvasBlocks = [...state.canvasBlocks, newBlock]
      return { canvasBlocks, liveValidation: validatePipelineClient(serializePipeline(canvasBlocks)) }
    })
  },

  moveBlock: (instanceId, dx, dy) => {
    set((state) => ({
      canvasBlocks: state.canvasBlocks.map((b) =>
        b.instanceId === instanceId ? { ...b, x: b.x + dx, y: b.y + dy } : b
      ),
    }))
  },

  updateBlockHeight: (instanceId, height) => {
    const block = get().canvasBlocks.find((b) => b.instanceId === instanceId)
    if (!block || block.height === height) return
    set((state) => ({
      canvasBlocks: state.canvasBlocks.map((b) =>
        b.instanceId === instanceId ? { ...b, height } : b
      ),
    }))
  },

  removeBlockFromCanvas: (instanceId) => {
    set((state) => {
      const canvasBlocks = state.canvasBlocks.filter((b) => b.instanceId !== instanceId)
      const connections = state.connections.filter(
        (c) => c.fromInstanceId !== instanceId && c.toInstanceId !== instanceId
      )
      return { canvasBlocks, connections, connectingFrom: null,
        liveValidation: validatePipelineClient(serializePipeline(canvasBlocks)) }
    })
  },

  // ── Canvas: connections ───────────────────────────────────────────────────
  startConnection: (instanceId) => set({ connectingFrom: instanceId, rejectTarget: null }),

  finishConnection: (toInstanceId, isValid) => {
    const { connectingFrom, connections, canvasBlocks } = get()
    if (!connectingFrom || connectingFrom === toInstanceId) { set({ connectingFrom: null }); return }

    if (!isValid) {
      set({ rejectTarget: toInstanceId, connectingFrom: null })
      setTimeout(() => set({ rejectTarget: null }), 500)
      return
    }

    const duplicate = connections.some(
      (c) => c.fromInstanceId === connectingFrom && c.toInstanceId === toInstanceId
    )
    if (!duplicate) {
      const newConns = [...connections, { id: makeConnectionId(), fromInstanceId: connectingFrom, toInstanceId }]
      set({ connections: newConns, connectingFrom: null,
        liveValidation: validatePipelineClient(serializePipeline(canvasBlocks)) })
    } else {
      set({ connectingFrom: null })
    }
  },

  cancelConnection: () => set({ connectingFrom: null }),

  removeConnection: (connId) =>
    set((state) => ({ connections: state.connections.filter((c) => c.id !== connId) })),

  // ── Submit ────────────────────────────────────────────────────────────────
  submitPipeline: async () => {
    const { currentChallenge, canvasBlocks } = get()
    if (!currentChallenge) return
    set({ isLoading: true })
    try {
      const result = await evaluatePipeline(currentChallenge.id, serializePipeline(canvasBlocks))
      set({ result, gamePhase: 'submitted', isLoading: false })
    } catch (err) { console.error(err); set({ isLoading: false }) }
  },

  // ── UI ────────────────────────────────────────────────────────────────────
  dismissTutorial: () => set({ showTutorial: false }),
  advanceHint: () => set((state) => ({ hintIndex: state.hintIndex + 1 })),
}))
