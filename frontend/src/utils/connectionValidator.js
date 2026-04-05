import { VALID_CONNECTIONS } from '../data/blockDefinitions.js'

/**
 * Validate whether two canvas block instances can be port-connected.
 * fromBlock / toBlock are canvas block objects (with .category, .instanceId).
 * Returns { valid: bool, reason: string }
 */
export function validatePortConnection(fromBlock, toBlock) {
  if (!fromBlock || !toBlock) return { valid: false, reason: 'Invalid blocks.' }
  if (fromBlock.instanceId === toBlock.instanceId) return { valid: false, reason: 'Cannot connect a block to itself.' }
  const allowed = VALID_CONNECTIONS[fromBlock.category] || []
  if (!allowed.includes(toBlock.category)) {
    return {
      valid: false,
      reason: `${fromBlock.category} → ${toBlock.category} is not a valid connection. Expected: ${allowed.join(' or ') || 'nothing'}.`,
    }
  }
  return { valid: true, reason: '' }
}

// ─── Live pipeline validator ─────────────────────────────────────────────────

const ANALYSIS_DATA_COMPAT = {
  analysis_t_test: ['quantitative'],
  analysis_anova: ['quantitative'],
  analysis_chi_square: ['quantitative'],
  analysis_regression: ['quantitative'],
  analysis_correlation: ['quantitative'],
  analysis_thematic: ['qualitative'],
  analysis_content: ['qualitative', 'mixed'],
}

const METHOD_DATA_COMPAT = {
  method_survey: ['quantitative', 'qualitative', 'mixed'],
  method_experiment_lab: ['quantitative'],
  method_experiment_field: ['quantitative', 'mixed'],
  method_observational: ['qualitative', 'mixed'],
  method_case_study: ['qualitative'],
  method_meta_analysis: ['quantitative', 'mixed'],
}

const METHOD_NEEDS_CONTROL = new Set(['method_experiment_lab', 'method_experiment_field'])

const QUANTITATIVE_DATA = new Set([
  'data_likert', 'data_measurement', 'data_count',
  'data_spectroscopy', 'data_sequencing', 'data_loss_curves',
  'data_confusion_matrix', 'data_latency_metrics', 'data_sensor',
  'data_efficiency_metrics', 'data_numerical_output', 'data_physiological',
])
const QUALITATIVE_DATA = new Set([
  'data_interview', 'data_open_ended', 'data_observation_notes', 'data_theorem_output',
])

function inferDataType(blockDefId) {
  if (QUANTITATIVE_DATA.has(blockDefId)) return 'quantitative'
  if (QUALITATIVE_DATA.has(blockDefId)) return 'qualitative'
  return 'mixed'
}

/**
 * Runs on the serialized pipeline: { CATEGORY: [blockDefId,...] }
 * Returns { errors: [{category, message}], warnings: [{category, message}], isValid }
 * Used to show live badges on canvas blocks before the user submits.
 */
export function validatePipelineClient(pipeline) {
  const errors = []
  const warnings = []

  const H = pipeline.HYPOTHESIS || []
  const V = pipeline.VARIABLE || []
  const M = pipeline.METHOD || []
  const S = pipeline.SAMPLE || []
  const D = pipeline.DATA_COLLECTION || []
  const A = pipeline.ANALYSIS || []
  const C = pipeline.CONCLUSION || []

  if (H.length === 0) errors.push({ category: 'HYPOTHESIS', message: 'No hypothesis placed' })
  if (V.length === 0) errors.push({ category: 'VARIABLE', message: 'No variables placed' })
  if (M.length === 0) errors.push({ category: 'METHOD', message: 'No method placed' })
  if (S.length === 0) errors.push({ category: 'SAMPLE', message: 'No sample placed' })
  if (D.length === 0) errors.push({ category: 'DATA_COLLECTION', message: 'No data collection placed' })
  if (A.length === 0) errors.push({ category: 'ANALYSIS', message: 'No analysis placed' })
  if (C.length === 0) errors.push({ category: 'CONCLUSION', message: 'No conclusion placed' })

  // Skip IV/DV/control/confounding checks if the user has placed any custom variable blocks —
  // custom blocks represent user-defined concepts that may cover these roles.
  const hasCustomVariable = V.some((id) => id.startsWith('custom_'))

  if (!hasCustomVariable) {
    if (!V.includes('independent_variable')) errors.push({ category: 'VARIABLE', message: 'Missing Independent Variable' })
    if (!V.includes('dependent_variable')) errors.push({ category: 'VARIABLE', message: 'Missing Dependent Variable' })

    if (M.length > 0 && METHOD_NEEDS_CONTROL.has(M[0]) && !V.includes('control_variable')) {
      errors.push({ category: 'METHOD', message: 'Experiment requires a Control Variable' })
    }
  }

  if (A.length > 0 && D.length > 0) {
    const dataType = inferDataType(D[0])
    const compat = ANALYSIS_DATA_COMPAT[A[0]]
    if (compat && !compat.includes(dataType)) {
      errors.push({ category: 'ANALYSIS', message: `Incompatible with ${dataType} data` })
      errors.push({ category: 'DATA_COLLECTION', message: `Incompatible with chosen analysis` })
    }
  }

  if (M.length > 0 && D.length > 0) {
    const dataType = inferDataType(D[0])
    const compat = METHOD_DATA_COMPAT[M[0]]
    if (compat && !compat.includes(dataType)) {
      warnings.push({ category: 'DATA_COLLECTION', message: `Usually paired with ${compat.join('/')} data` })
    }
  }

  if (S.includes('sample_small')) warnings.push({ category: 'SAMPLE', message: 'Small sample limits power' })
  if (!hasCustomVariable && !V.includes('confounding_variable')) warnings.push({ category: 'VARIABLE', message: 'Consider adding confounders' })

  return { errors, warnings, isValid: errors.length === 0 }
}
