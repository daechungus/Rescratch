/**
 * Converts the free-canvas canvasBlocks array into the flat category
 * array shape the backend API expects:
 *   { HYPOTHESIS: ["blockDefId",...], VARIABLE: [...], ... }
 *
 * All blocks on the canvas are included regardless of whether they are
 * connected — the backend handles completeness scoring.
 */
export function serializePipeline(canvasBlocks) {
  const result = {
    HYPOTHESIS: [],
    VARIABLE: [],
    METHOD: [],
    SAMPLE: [],
    DATA_COLLECTION: [],
    ANALYSIS: [],
    CONCLUSION: [],
  }

  for (const block of canvasBlocks) {
    const cat = block.category
    if (result[cat] !== undefined && !result[cat].includes(block.blockDefId)) {
      result[cat].push(block.blockDefId)
    }
  }

  return result
}
