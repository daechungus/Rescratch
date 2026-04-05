const PILLARS = [
  {
    id: 'science',
    emoji: '🧪',
    title: 'Science',
    subtitle: 'Natural & Life',
    focus: 'Understanding the physical and biological world.',
    color: '#22c55e',
    subtopics: [
      { id: 'biology_molecular', label: 'Molecular & Cellular Biology', description: 'Genetics, Synthetic Biology, CRISPR', parent: 'Biology' },
      { id: 'biology_organismal', label: 'Organismal Biology', description: 'Neuroscience, Ecology, Evolutionary Biology', parent: 'Biology' },
      { id: 'bioinformatics', label: 'Bioinformatics', description: 'Genomics, Computational Proteomics', parent: 'Biology' },
      { id: 'physics_theoretical', label: 'Theoretical Physics', description: 'Quantum Mechanics, General Relativity, String Theory', parent: 'Physics' },
      { id: 'physics_applied', label: 'Applied Physics', description: 'Condensed Matter, Optics, Particle Physics', parent: 'Physics' },
      { id: 'astrophysics', label: 'Astrophysics', description: 'Cosmology, Exoplanet Research', parent: 'Physics' },
      { id: 'chemistry_organic', label: 'Organic & Biochemistry', description: 'Drug Discovery, Metabolic Pathways', parent: 'Chemistry' },
      { id: 'materials_science', label: 'Materials Science', description: 'Nanotechnology, Superconductors, Polymers', parent: 'Chemistry' },
      { id: 'neuroscience', label: 'Neuroscience', description: 'Neural mapping, brain mechanics, and the study of consciousness beyond basic biology', parent: 'Neuroscience' },
      { id: 'environmental_earth', label: 'Environmental & Earth Sciences', description: 'Climate modeling, geophysics, and sustainability with complex global variables', parent: 'Environmental & Earth Sciences' },
    ],
  },
  {
    id: 'technology',
    emoji: '💻',
    title: 'Technology',
    subtitle: 'Computation & Information',
    focus: 'Processing data and building intelligent systems.',
    color: '#3b82f6',
    subtopics: [
      { id: 'machine_learning', label: 'Machine Learning', description: 'Deep Learning, Neural Architectures', parent: 'Artificial Intelligence' },
      { id: 'reinforcement_learning', label: 'Reinforcement Learning', description: 'Robotics Control, Game Theory Agents', parent: 'Artificial Intelligence' },
      { id: 'nlp', label: 'Natural Language Processing', description: 'LLMs, Translation, Sentiment Analysis', parent: 'Artificial Intelligence' },
      { id: 'computer_vision', label: 'Computer Vision', description: 'Image Recognition, Medical Imaging', parent: 'Artificial Intelligence' },
      { id: 'cybersecurity_crypto', label: 'Cryptography', description: 'Zero-Knowledge Proofs, Post-Quantum Crypto', parent: 'Cybersecurity' },
      { id: 'cybersecurity_network', label: 'Network Security', description: 'Malware Analysis, Forensic Discovery', parent: 'Cybersecurity' },
      { id: 'hci', label: 'Human-Computer Interaction', description: 'UX Research, AR/VR Immersive Environments', parent: 'HCI' },
      { id: 'quantum_computing', label: 'Quantum Computing', description: 'Qubits, entanglement, and post-quantum cryptography — expert-level constraints', parent: 'Quantum Computing' },
    ],
  },
  {
    id: 'engineering',
    emoji: '🏗',
    title: 'Engineering',
    subtitle: 'Systems & Application',
    focus: 'Building and optimizing complex structures.',
    color: '#f97316',
    subtopics: [
      { id: 'mechanical_aerospace', label: 'Mechanical & Aerospace', description: 'Robotics, Fluid Dynamics, Propulsion Systems', parent: 'Mechanical & Aerospace' },
      { id: 'electrical_computer', label: 'Electrical & Computer', description: 'Microprocessors, Signal Processing, Embedded Systems', parent: 'Electrical & Computer' },
      { id: 'civil_environmental', label: 'Civil & Environmental', description: 'Structural Integrity, Renewable Energy, Urban Resilience', parent: 'Civil & Environmental' },
      { id: 'materials_nano', label: 'Materials Science & Nanotechnology', description: 'Engineering at the atomic level to create smart materials and high-efficiency semiconductors', parent: 'Materials & Nano' },
      { id: 'robotics_autonomous', label: 'Robotics & Autonomous Systems', description: 'Control loops, sensor fusion, and mechatronics for block-based pipeline design', parent: 'Robotics & Autonomous Systems' },
    ],
  },
  {
    id: 'mathematics',
    emoji: '🔢',
    title: 'Mathematics',
    subtitle: 'Formal Logic & Models',
    focus: 'The language of patterns and proofs.',
    color: '#a855f7',
    subtopics: [
      { id: 'pure_math', label: 'Pure Mathematics', description: 'Topology, Number Theory, Abstract Algebra', parent: 'Pure Mathematics' },
      { id: 'applied_math_finance', label: 'Financial Mathematics', description: 'Stochastic Calculus, Quantitative Risk', parent: 'Applied Mathematics' },
      { id: 'game_theory', label: 'Game Theory', description: 'Mechanism Design, Behavioral Economics', parent: 'Applied Mathematics' },
      { id: 'cryptography_logic', label: 'Cryptography & Logic', description: 'Set Theory, Complexity Theory', parent: 'Applied Mathematics' },
      { id: 'statistics', label: 'Statistics', description: 'Econometrics, Biostatistics, Bayesian Modeling', parent: 'Statistics' },
      { id: 'computational_topology', label: 'Computational Topology', description: 'Patterns in high-dimensional data shapes; a hot topic in modern research', parent: 'Computational Topology' },
    ],
  },
  {
    id: 'human_social',
    emoji: '🧠',
    title: 'Human & Social Sciences',
    subtitle: 'The Behavioral Bridge',
    focus: 'Understanding human behavior.',
    color: '#ef476f',
    subtopics: [
      { id: 'psychology', label: 'Psychology', description: 'Cognitive Science, Behavioral Neuroscience', parent: 'Psychology' },
      { id: 'economics', label: 'Economics', description: 'Macro-modeling, Experimental Economics', parent: 'Economics' },
      { id: 'sociology', label: 'Sociology', description: 'Computational Social Science, Network Analysis', parent: 'Sociology' },
      { id: 'cognitive_science', label: 'Cognitive Science', description: 'Bridge between psychology and AI — how information is processed, perceived, and stored', parent: 'Cognitive Science' },
      { id: 'linguistics', label: 'Linguistics & Communication', description: 'How language structures thought and how systems like LLMs process human syntax', parent: 'Linguistics' },
    ],
  },
]

export default PILLARS

const _flat = PILLARS.flatMap((p) => p.subtopics.map((s) => ({ ...s, pillarId: p.id })))

export function getSubtopicLabel(subtopicId) {
  return _flat.find((s) => s.id === subtopicId)?.label ?? subtopicId
}

export function getPillarForSubtopic(subtopicId) {
  const match = _flat.find((s) => s.id === subtopicId)
  if (!match) return null
  return PILLARS.find((p) => p.id === match.pillarId) ?? null
}
