/**
 * Converts the pipeline store shape (category -> block objects)
 * into the API shape (category -> block id strings).
 */
export function serializePipeline(pipeline) {
  return Object.fromEntries(
    Object.entries(pipeline).map(([category, blocks]) => [
      category,
      blocks.map((b) => b.id),
    ])
  )
}
