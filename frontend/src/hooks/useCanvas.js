import { useRef, useCallback } from 'react'
import { useStore } from '../store.js'
import { validatePortConnection } from '../utils/connectionValidator.js'

/**
 * Provides all canvas interaction logic as callbacks.
 * Components import this hook to avoid duplicating store access.
 */
export function useCanvas() {
  const moveBlock = useStore((s) => s.moveBlock)
  const removeBlockFromCanvas = useStore((s) => s.removeBlockFromCanvas)
  const startConnection = useStore((s) => s.startConnection)
  const finishConnection = useStore((s) => s.finishConnection)
  const cancelConnection = useStore((s) => s.cancelConnection)
  const removeConnection = useStore((s) => s.removeConnection)
  const connectingFrom = useStore((s) => s.connectingFrom)
  const canvasBlocks = useStore((s) => s.canvasBlocks)

  // Pointer-based drag for moving blocks on the canvas
  const dragState = useRef(null)

  const onBlockPointerDown = useCallback(
    (e, instanceId) => {
      // Only left mouse button; don't interfere with port clicks
      if (e.button !== 0) return
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragState.current = { instanceId, startX: e.clientX, startY: e.clientY, moved: false }
    },
    []
  )

  const onBlockPointerMove = useCallback(
    (e) => {
      if (!dragState.current) return
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        dragState.current.moved = true
        moveBlock(dragState.current.instanceId, dx, dy)
        dragState.current.startX = e.clientX
        dragState.current.startY = e.clientY
      }
    },
    [moveBlock]
  )

  const onBlockPointerUp = useCallback(() => {
    dragState.current = null
  }, [])

  // Port interaction
  const onOutputPortClick = useCallback(
    (e, instanceId) => {
      e.stopPropagation()
      if (connectingFrom === instanceId) {
        cancelConnection()
      } else {
        startConnection(instanceId)
      }
    },
    [connectingFrom, startConnection, cancelConnection]
  )

  const onInputPortClick = useCallback(
    (e, toInstanceId) => {
      e.stopPropagation()
      if (!connectingFrom) return

      const fromBlock = canvasBlocks.find((b) => b.instanceId === connectingFrom)
      const toBlock = canvasBlocks.find((b) => b.instanceId === toInstanceId)
      const { valid } = validatePortConnection(fromBlock, toBlock)
      finishConnection(toInstanceId, valid)
    },
    [connectingFrom, canvasBlocks, finishConnection]
  )

  const onCanvasClick = useCallback(
    (e) => {
      if (connectingFrom) cancelConnection()
    },
    [connectingFrom, cancelConnection]
  )

  return {
    onBlockPointerDown,
    onBlockPointerMove,
    onBlockPointerUp,
    onOutputPortClick,
    onInputPortClick,
    onCanvasClick,
    removeBlockFromCanvas,
    removeConnection,
    connectingFrom,
  }
}
