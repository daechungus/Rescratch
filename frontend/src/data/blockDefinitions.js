export const CATEGORY_COLORS = {
  HYPOTHESIS: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    badge: 'bg-blue-500',
    badgeText: 'text-white',
    highlight: 'bg-blue-100 border-blue-500',
    zone: 'bg-blue-50 border-blue-300',
  },
  VARIABLE: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    badge: 'bg-green-500',
    badgeText: 'text-white',
    highlight: 'bg-green-100 border-green-500',
    zone: 'bg-green-50 border-green-300',
  },
  METHOD: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
    badge: 'bg-orange-500',
    badgeText: 'text-white',
    highlight: 'bg-orange-100 border-orange-500',
    zone: 'bg-orange-50 border-orange-300',
  },
  SAMPLE: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-800',
    badge: 'bg-purple-500',
    badgeText: 'text-white',
    highlight: 'bg-purple-100 border-purple-500',
    zone: 'bg-purple-50 border-purple-300',
  },
  DATA_COLLECTION: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    badge: 'bg-yellow-500',
    badgeText: 'text-white',
    highlight: 'bg-yellow-100 border-yellow-500',
    zone: 'bg-yellow-50 border-yellow-300',
  },
  ANALYSIS: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    badge: 'bg-red-500',
    badgeText: 'text-white',
    highlight: 'bg-red-100 border-red-500',
    zone: 'bg-red-50 border-red-300',
  },
  CONCLUSION: {
    bg: 'bg-teal-50',
    border: 'border-teal-400',
    text: 'text-teal-800',
    badge: 'bg-teal-500',
    badgeText: 'text-white',
    highlight: 'bg-teal-100 border-teal-500',
    zone: 'bg-teal-50 border-teal-300',
  },
}

export const CATEGORY_LABELS = {
  HYPOTHESIS: 'Hypothesis',
  VARIABLE: 'Variables',
  METHOD: 'Method',
  SAMPLE: 'Sample',
  DATA_COLLECTION: 'Data Collection',
  ANALYSIS: 'Analysis',
  CONCLUSION: 'Conclusion',
}

export const CATEGORY_DESCRIPTIONS = {
  HYPOTHESIS: 'Your research prediction',
  VARIABLE: 'What you manipulate and measure',
  METHOD: 'How you collect data',
  SAMPLE: 'Who and how many participants',
  DATA_COLLECTION: 'What type of data you gather',
  ANALYSIS: 'How you analyze the data',
  CONCLUSION: 'What your results mean',
}

export const PIPELINE_ORDER = [
  'HYPOTHESIS',
  'VARIABLE',
  'METHOD',
  'SAMPLE',
  'DATA_COLLECTION',
  'ANALYSIS',
  'CONCLUSION',
]

export const CATEGORY_ICONS = {
  HYPOTHESIS: '💡',
  VARIABLE: '🔢',
  METHOD: '🔬',
  SAMPLE: '👥',
  DATA_COLLECTION: '📊',
  ANALYSIS: '📈',
  CONCLUSION: '✅',
}

// Which categories a block's output port can connect TO
export const VALID_CONNECTIONS = {
  HYPOTHESIS:      ['VARIABLE'],
  VARIABLE:        ['METHOD', 'VARIABLE'],
  METHOD:          ['SAMPLE'],
  SAMPLE:          ['DATA_COLLECTION', 'SAMPLE'],
  DATA_COLLECTION: ['ANALYSIS'],
  ANALYSIS:        ['CONCLUSION'],
  CONCLUSION:      [],
}

// Port colors (output port dot color per category)
export const PORT_COLORS = {
  HYPOTHESIS:      'bg-blue-500',
  VARIABLE:        'bg-green-500',
  METHOD:          'bg-orange-500',
  SAMPLE:          'bg-purple-500',
  DATA_COLLECTION: 'bg-yellow-500',
  ANALYSIS:        'bg-red-500',
  CONCLUSION:      'bg-teal-500',
}
