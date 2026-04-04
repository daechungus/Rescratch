/**
 * Client-side pipeline validation — mirrors backend compatibility rules.
 * Used for instant feedback before API submission.
 */

const ANALYSIS_DATA_COMPATIBILITY = {
  analysis_t_test: ['quantitative'],
  analysis_anova: ['quantitative'],
  analysis_chi_square: ['quantitative'],
  analysis_regression: ['quantitative'],
  analysis_correlation: ['quantitative'],
  analysis_thematic: ['qualitative'],
  analysis_content: ['qualitative', 'mixed'],
}

const METHOD_DATA_COMPATIBILITY = {
  method_survey: ['quantitative', 'qualitative', 'mixed'],
  method_experiment_lab: ['quantitative'],
  method_experiment_field: ['quantitative', 'mixed'],
  method_observational: ['qualitative', 'mixed'],
  method_case_study: ['qualitative'],
  method_meta_analysis: ['quantitative', 'mixed'],
}

const METHOD_REQUIRES_CONTROL = new Set(['method_experiment_lab', 'method_experiment_field'])

export function validatePipelineClient(pipeline) {
  const errors = []
  const warnings = []

  const hypothesisBlocks = pipeline.HYPOTHESIS || []
  const variableBlocks = pipeline.VARIABLE || []
  const methodBlocks = pipeline.METHOD || []
  const sampleBlocks = pipeline.SAMPLE || []
  const dataBlocks = pipeline.DATA_COLLECTION || []
  const analysisBlocks = pipeline.ANALYSIS || []
  const conclusionBlocks = pipeline.CONCLUSION || []

  // Completeness checks
  if (hypothesisBlocks.length === 0) errors.push({ category: 'HYPOTHESIS', message: 'Missing hypothesis block' })
  if (variableBlocks.length === 0) errors.push({ category: 'VARIABLE', message: 'Missing variable blocks' })
  if (methodBlocks.length === 0) errors.push({ category: 'METHOD', message: 'Missing method block' })
  if (sampleBlocks.length === 0) errors.push({ category: 'SAMPLE', message: 'Missing sample blocks' })
  if (dataBlocks.length === 0) errors.push({ category: 'DATA_COLLECTION', message: 'Missing data collection block' })
  if (analysisBlocks.length === 0) errors.push({ category: 'ANALYSIS', message: 'Missing analysis block' })
  if (conclusionBlocks.length === 0) errors.push({ category: 'CONCLUSION', message: 'Missing conclusion block' })

  // Variable checks
  const hasIV = variableBlocks.some((b) => b.id === 'independent_variable')
  const hasDV = variableBlocks.some((b) => b.id === 'dependent_variable')
  const hasControl = variableBlocks.some((b) => b.id === 'control_variable')
  if (!hasIV) errors.push({ category: 'VARIABLE', message: 'Missing Independent Variable' })
  if (!hasDV) errors.push({ category: 'VARIABLE', message: 'Missing Dependent Variable' })

  // Method requires control
  if (methodBlocks.length > 0) {
    const method = methodBlocks[0]
    if (METHOD_REQUIRES_CONTROL.has(method.id) && !hasControl) {
      errors.push({ category: 'METHOD', message: `${method.label} requires a Control Variable` })
    }
  }

  // Analysis / data compatibility
  if (analysisBlocks.length > 0 && dataBlocks.length > 0) {
    const analysis = analysisBlocks[0]
    const data = dataBlocks[0]
    const dataType = data.data_type
    const compatibleTypes = ANALYSIS_DATA_COMPATIBILITY[analysis.id]
    if (compatibleTypes && dataType && !compatibleTypes.includes(dataType)) {
      errors.push({
        category: 'ANALYSIS',
        message: `${analysis.label} requires ${compatibleTypes.join(' or ')} data, but you selected ${dataType} collection`,
      })
    }
  }

  // Method / data compatibility
  if (methodBlocks.length > 0 && dataBlocks.length > 0) {
    const method = methodBlocks[0]
    const data = dataBlocks[0]
    const dataType = data.data_type
    const compatibleTypes = METHOD_DATA_COMPATIBILITY[method.id]
    if (compatibleTypes && dataType && !compatibleTypes.includes(dataType)) {
      warnings.push({
        category: 'DATA_COLLECTION',
        message: `${method.label} usually uses ${compatibleTypes.join(' or ')} data`,
      })
    }
  }

  // Warnings
  const hasSampleSize = sampleBlocks.some((b) => ['sample_small', 'sample_medium', 'sample_large'].includes(b.id))
  const sampleSize = sampleBlocks.find((b) => b.size)
  if (sampleSize?.size === 'small') {
    warnings.push({ category: 'SAMPLE', message: 'Small sample limits statistical power' })
  }

  const samplingMethod = sampleBlocks.find((b) => b.sampling_type)
  if (samplingMethod && ['convenience', 'snowball'].includes(samplingMethod.sampling_type)) {
    warnings.push({ category: 'SAMPLE', message: 'Convenience/snowball sampling introduces selection bias' })
  }

  const hasConfounding = variableBlocks.some((b) => b.id === 'confounding_variable')
  if (!hasConfounding) {
    warnings.push({ category: 'VARIABLE', message: 'Consider identifying confounding variables' })
  }

  return { errors, warnings, isValid: errors.length === 0 }
}
