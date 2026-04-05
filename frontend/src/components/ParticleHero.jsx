import { useRef, useMemo, useEffect, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

class ParticleErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

// ─── Sample letter pixels from an offscreen canvas ────────────────────────────
function sampleLetterPositions(text, targetCount) {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 130px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const { data: pixels } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const positions = []
  const step = 3

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const i = (y * canvas.width + x) * 4
      if (pixels[i] > 128) {
        positions.push(
          ((x / canvas.width) - 0.5) * 66,
          //height of rescratch
          -((y / canvas.height) - 0.5) * 13.2 + 5,
          0
        )
      }
    }
  }

  if (positions.length === 0) {
    for (let i = 0; i < 100; i++)
      positions.push((i % 10) * 4 - 20, Math.floor(i / 10) - 4, 0)
  }

  const ptCount = positions.length / 3
  const result = new Float32Array(targetCount * 3)
  for (let i = 0; i < targetCount; i++) {
    const src = Math.floor(Math.random() * ptCount) * 3
    result[i * 3]     = positions[src]     + (Math.random() - 0.5) * 0.3
    result[i * 3 + 1] = positions[src + 1] + (Math.random() - 0.5) * 0.3
    result[i * 3 + 2] = (Math.random() - 0.5) * 1.5
  }
  return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH WORD DICTIONARY
// ═══════════════════════════════════════════════════════════════════════════════
const RESEARCH_WORDS = [
  // MATHEMATICS
  'Topology','Calculus','Algebra','Geometry','Trigonometry','Logic','Set Theory','Number Theory','Analysis','Combinatorics',
  'Manifolds','Fractals','Isomorphism','Homology','Cryptography','Stochastic','Deterministic','Eigenvalues','Quaternions','Riemann',
  'Tensor','Differential','Integral','Asymptotic','Axiomatic','Lemma','Corollary','Theorem','Conjecture','Heuristic',
  'Bayesian','Gaussian','Distribution','Variance','Covariance','Regression','Correlation','Deviation','Likelihood','Posterior',
  'Prior','Entropy','Markov Chain','Monte Carlo','Permutation','Combination','Null Hypothesis','P-Value','Significance','Optimization',
  'Linear Programming','Game Theory','Nash Equilibrium','Graph Theory','Node','Edge','Vector','Scalar','Matrix','Inverse',
  'Determinant','Fourier','Laplace','Transform','Series','Divergence','Convergence','Infinitesimal','Cardinality','Algorithm',
  'Complexity','Big O','P vs NP','Recursion','Iteration','Boolean','Binary','Hexadecimal','Floating Point','Modular',
  'Prime','Composite','Fibonacci','Golden Ratio','Limit','Continuity','Derivative','Partial','Gradient','Manifold',
  'Stochasticity','Asymptote','Logarithm','Exponential','Polynomial','Quadratic','Linearity','Nonlinear','Orthogonal',
  // TECHNOLOGY & AI
  'Neural Networks','Deep Learning','Machine Learning','Transformers','NLP','Computer Vision','Reinforcement','Supervised','Unsupervised','Generative AI',
  'LLM','Inference','Training','Weights','Biases','Activation','Backpropagation','CNN','RNN','GAN',
  'Cloud Computing','Edge','Serverless','Microservices','API','REST','GraphQL','Docker','Kubernetes','Virtualization',
  'Database','SQL','NoSQL','Scalability','Latency','Bandwidth','Throughput','Backend','Frontend','Fullstack',
  'Data Mining','Analytics','Big Data','Warehouse','Lake','ETL','Pipeline','Stream','Batch','Visualization',
  'Dashboard','Metadata','Integrity','Governance','Encryption','Cybersecurity','Firewall','Malware','Phishing','Blockchain',
  'Deployment','CI/CD','Repository','Version Control','Git','Agile','Scrum','Sprint','Debugging','Compiler',
  'Interpreter','Scripting','Automation','Testing','Unit Test','Integration','Sandbox','Production','UX Design','UI Design',
  'Human-Computer','Accessibility','Responsive','Framework','Library','React','Vue','NodeJS','Python','Rust',
  'Concurrency','Parallelism','Hypervisor','Protocol','Middleware','Firmware','Hardware',
  // ENGINEERING & PHYSICS
  'Dynamics','Statics','Kinematics','Thermodynamics','Fluid','Aerodynamics','Hydrodynamics','Torque','Friction','Velocity',
  'Acceleration','Momentum','Inertia','Stress','Strain','Elasticity','Plasticity','Fatigue','Fracture','Voltage',
  'Current','Resistance','Capacitance','Inductance','Semiconductor','Transistor','Diode','Microchip','Signal Processing','Modulation',
  'Feedback','Control Systems','Robotics','Actuator','Sensor','Telemetry','Radar','Lidar','Beam','Column',
  'Truss','Foundation','Load','Tension','Compression','Shear','Composite','Alloy','Polymer','Nanotechnology',
  'Biomimicry','Sustainability','Thermal','Insulation','Vibration','Acoustics','Optics','Renewable','Solar','Wind',
  'Nuclear','Fusion','Fission','Battery','Storage','Efficiency','Combustion','Propulsion','Aerospace','Satellite',
  'Orbital','Payload','Avionics','Mechatronics','Prototype','Specification','Blueprint','Tolerance','Inspection','Maintenance',
  'Reliability','Standard','ISO','Benchmarking','Reverse Engineering','Assembly','Manufacturing','Precision','Calibration',
  'Centripetal','Centrifugal','Electromagnetism','Quantum','Relativity','Particle','Higgs Boson','Dark Matter','Spacetime',
  // SCIENCE & BIOLOGY
  'Genetics','Genomics','Proteomics','CRISPR','Sequencing','Mutation','Evolution','Ecology','Biodiversity','Microbiome',
  'Cellular','Molecular','Enzyme','Protein','DNA','RNA','Metabolism','Photosynthesis','Respiration','Symbiosis',
  'Clinical Trials','Pharmacology','Vaccine','Immunology','Epidemiology','Pathogen','Virus','Bacteria','Neurology','Oncology',
  'Cardiology','Stem Cells','Tissue Engineering','Bioethics','Diagnostics','Therapy','In Vitro','In Vivo','Placebo','Double-Blind',
  'Atomic','Covalent','Ionic','Catalyst','Reagent','Synthesis','Organic','Inorganic','Spectroscopy','Chromatography',
  'pH Balance','Oxidation','Reduction','Equilibrium','Kinetic','Solution','Solvent','Isotopes','Geology','Climate Change',
  'Carbon Footprint','Atmosphere','Hydrosphere','Lithosphere','Tectonics','Mineralogy','Paleontology','Oceanography','Meteorology','Seismology',
  'Stratigraphy','Glaciology','Erosion','Sediment','Ecosystem','Biome','Greenhouse','Ozone','Sustainability',
  'Neuroplasticity','Synapse','Dopamine','Serotonin','Endocrine','Hormone','Pathology','Physiology','Anatomy','Histology',
  'Radiology','Microscopy','Centrifuge','Titration','Distillation','Sublimation','Catalysis','Electrolysis','Polymerization','Fermentation',
  // PSYCHOLOGY & SOCIAL SCIENCE
  'Perception','Attention','Memory','Learning','Reasoning','Decision Making','Metacognition','Executive Function',
]

// ─── Word texture atlas ───────────────────────────────────────────────────────
// Each word is pre-rendered into a fixed cell of a single canvas texture.
// The fragment shader samples the right cell per particle via aUVOffset.
const ATLAS_CELL_W = 128   // px wide per cell
const ATLAS_CELL_H = 48    // px tall per cell (3:8 aspect — remapped in shader)
const ATLAS_COLS   = 16    // cells per row  →  atlas width = 2048
const ATLAS_W      = ATLAS_COLS * ATLAS_CELL_W

function buildWordAtlas() {
  const rows   = Math.ceil(RESEARCH_WORDS.length / ATLAS_COLS)
  // Round atlas height up to next power-of-2
  const rawH   = rows * ATLAS_CELL_H
  const ATLAS_H = Math.pow(2, Math.ceil(Math.log2(rawH)))

  const canvas = document.createElement('canvas')
  canvas.width  = ATLAS_W
  canvas.height = ATLAS_H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, ATLAS_W, ATLAS_H)
  ctx.fillStyle    = '#000000'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  const uvOffsets = new Float32Array(RESEARCH_WORDS.length * 2)

  RESEARCH_WORDS.forEach((word, i) => {
    const col = i % ATLAS_COLS
    const row = Math.floor(i / ATLAS_COLS)
    const ox  = col * ATLAS_CELL_W
    const oy  = row * ATLAS_CELL_H

    // Auto-reduce font until word fits within cell width
    let fontSize = 14
    ctx.font = `${fontSize}px Arial, sans-serif`
    while (ctx.measureText(word).width > ATLAS_CELL_W - 8 && fontSize > 7) {
      fontSize -= 0.5
      ctx.font = `${fontSize}px Arial, sans-serif`
    }
    ctx.fillText(word, ox + ATLAS_CELL_W / 2, oy + ATLAS_CELL_H / 2)

    uvOffsets[i * 2]     = ox / ATLAS_W
    uvOffsets[i * 2 + 1] = oy / ATLAS_H
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return { texture, uvOffsets }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALAXY FIELD
// 300 word-particles distributed on a 3D sphere.
// Each particle displays a randomly assigned research keyword.
// Expands from a condensed point, rotates slowly around Y.
// ═══════════════════════════════════════════════════════════════════════════════
const galaxyVert = `
  uniform float uTime;
  attribute vec3  aSphereStart;    // random point on a huge sphere, fly-in origin
  attribute float aDelay;          // seconds before this word starts moving
  attribute float aDuration;       // seconds to complete its journey
  attribute float aTwinkleSpeed;
  attribute float aTwinkleOffset;
  attribute vec2  aUVOffset;
  varying float vAlpha;
  varying vec2  vUVOffset;

  float easeInOutCubic(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Slow rotation around Y axis applied to final position only
    float ga = uTime * 0.016;
    float c = cos(ga), s = sin(ga);
    vec3 rp = vec3(
      position.x * c + position.z * s,
      position.y,
      -position.x * s + position.z * c
    );

    // Per-particle flight: each word has its own start time and travel duration
    float localT = clamp((uTime - aDelay) / aDuration, 0.0, 1.0);
    float ease   = easeInOutCubic(localT);
    vec3  pos    = mix(aSphereStart, rp, ease);

    vUVOffset = aUVOffset;
    float r          = length(rp);
    float centerFade = smoothstep(0.0, 18.0, r);
    vAlpha = ease * centerFade * (0.4 + 0.6 * sin(uTime * aTwinkleSpeed + aTwinkleOffset));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mv;
    gl_PointSize = clamp(3000.0 / -mv.z, 18.0, 90.0);
  }
`

const galaxyFrag = `
  uniform sampler2D uAtlas;
  uniform vec2      uCellSize;    // (ATLAS_CELL_W/ATLAS_W, ATLAS_CELL_H/ATLAS_H)
  uniform float     uCellAspect;  // ATLAS_CELL_H / ATLAS_CELL_W
  varying float vAlpha;
  varying vec2  vUVOffset;

  void main() {
    // gl_PointCoord is square (0-1 both axes).
    // Our atlas cell is uCellAspect tall relative to its width (e.g. 48/128 ≈ 0.375).
    // Center the text strip vertically in the square sprite and discard outside it.
    float stripH = uCellAspect;
    float yMin   = 0.5 - stripH * 0.5;
    float yMax   = 0.5 + stripH * 0.5;
    float py = gl_PointCoord.y;
    if (py < yMin || py > yMax) discard;

    // Remap py to [0,1] within the text strip, keeping x unchanged.
    // V is flipped (1 - ...) because Three.js CanvasTexture uploads with flipY=true,
    // inverting the canvas Y axis on the GPU. U is also flipped to correct 180° rotation.
    float yLocal  = (py - yMin) / stripH;
    float atlasU  = vUVOffset.x + gl_PointCoord.x * uCellSize.x;
    float atlasV  = 1.0 - vUVOffset.y - yLocal * uCellSize.y;
    vec2 atlasUV  = vec2(atlasU, atlasV);
    vec4 texel   = texture2D(uAtlas, atlasUV);
    if (texel.a < 0.04) discard;

    // Black text, alpha from glyph mask
    gl_FragColor = vec4(0.0, 0.0, 0.0, texel.a * vAlpha);
  }
`

function GalaxyField({ count = 300 }) {
  const { geo, uni, texture } = useMemo(() => {
    const { texture: atlasTex, uvOffsets } = buildWordAtlas()

    const positions   = new Float32Array(count * 3)
    const sphereStart = new Float32Array(count * 3)
    const delays      = new Float32Array(count)
    const durations   = new Float32Array(count)
    const twinkSpd    = new Float32Array(count)
    const twinkOff    = new Float32Array(count)
    const wordUVs     = new Float32Array(count * 2)

    for (let i = 0; i < count; i++) {
      // Final position: uniform 3D sphere distribution
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = Math.random() < 0.10
        ? Math.pow(Math.random(), 3) * 11
        : 7 + Math.pow(Math.random(), 0.55) * 82

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Start position: random point on a huge sphere far outside the frame
      const st = Math.random() * Math.PI * 2
      const sp = Math.acos(2 * Math.random() - 1)
      const sr = 180 + Math.random() * 80
      sphereStart[i * 3]     = sr * Math.sin(sp) * Math.cos(st)
      sphereStart[i * 3 + 1] = sr * Math.sin(sp) * Math.sin(st)
      sphereStart[i * 3 + 2] = sr * Math.cos(sp)

      // Random arrival: delay 0–4 s, travel duration 1.5–5 s
      delays[i]    = Math.random() * 2.0
      durations[i] = 1.5 + Math.random() * 3.5

      twinkSpd[i] = 0.25 + Math.random() * 1.6
      twinkOff[i] = Math.random() * Math.PI * 2

      const wi = Math.floor(Math.random() * RESEARCH_WORDS.length)
      wordUVs[i * 2]     = uvOffsets[wi * 2]
      wordUVs[i * 2 + 1] = uvOffsets[wi * 2 + 1]
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',       new THREE.BufferAttribute(positions,   3))
    g.setAttribute('aSphereStart',   new THREE.BufferAttribute(sphereStart, 3))
    g.setAttribute('aDelay',         new THREE.BufferAttribute(delays,      1))
    g.setAttribute('aDuration',      new THREE.BufferAttribute(durations,   1))
    g.setAttribute('aTwinkleSpeed',  new THREE.BufferAttribute(twinkSpd,    1))
    g.setAttribute('aTwinkleOffset', new THREE.BufferAttribute(twinkOff,    1))
    g.setAttribute('aUVOffset',      new THREE.BufferAttribute(wordUVs,     2))

    const cellW = ATLAS_CELL_W / ATLAS_W
    const cellH = ATLAS_CELL_H / (Math.pow(2, Math.ceil(Math.log2(
      Math.ceil(RESEARCH_WORDS.length / ATLAS_COLS) * ATLAS_CELL_H
    ))))

    const u = {
      uTime:       { value: 0 },
      uAtlas:      { value: atlasTex },
      uCellSize:   { value: new THREE.Vector2(cellW, cellH) },
      uCellAspect: { value: ATLAS_CELL_H / ATLAS_CELL_W },
    }

    return { geo: g, uni: u, texture: atlasTex }
  }, [count])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => { uni.uTime.value = clock.getElapsedTime() })

  return (
    <points geometry={geo}>
      <shaderMaterial
        uniforms={uni}
        vertexShader={galaxyVert}
        fragmentShader={galaxyFrag}
        blending={THREE.NormalBlending}
        depthWrite={false}
        transparent
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH CLOUD
// Particles start scattered in galaxy-arm positions then gravity-converge
// into the word "Research". After convergence each particle orbits its target
// position with an independent radius and phase, giving a living-cloud feel.
// Left→right gradient: amber ─ white ─ teal (brand palette).
// ═══════════════════════════════════════════════════════════════════════════════
const cloudVert = `
  uniform float uTime;
  uniform float uScatter;

  attribute vec3  aSpherePosition; // starting point on large sphere
  attribute vec3  aBasePosition;
  attribute vec3  aJitterSpeed;
  attribute vec3  aJitterOffset;
  attribute float aOrbitRadius;
  attribute float aOrbitPhase;
  attribute vec3  aColor;
  attribute float aDelay;          // seconds before this particle starts moving
  attribute float aDuration;       // seconds to complete its journey

  varying vec3  vColor;
  varying float vAlpha;

  float easeInOutCubic(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Each particle has its own clock — starts late, arrives fast or slow
    float localT = clamp((uTime - aDelay) / aDuration, 0.0, 1.0);
    float ease   = easeInOutCubic(localT);
    float scEase = easeInOutCubic(clamp(uScatter, 0.0, 1.0));

    // Gentle per-particle jitter once converged
    vec3 jitter = sin(uTime * aJitterSpeed + aJitterOffset) * (ease * 0.14);

    // Gravity orbital drift: each particle orbits its letter target
    float orb = ease * aOrbitRadius;
    vec2 orbit = vec2(
      cos(uTime * 0.38 + aOrbitPhase),
      sin(uTime * 0.38 + aOrbitPhase)
    ) * orb;

    // Collective breathing wave
    float wave = ease * sin(uTime * 0.42 + aBasePosition.x * 0.09) * 0.09;

    vec3 target = aBasePosition + jitter + vec3(orbit, 0.0) + vec3(0.0, wave, 0.0);

    // sphere → target, then scatter back on click
    vec3 pos = mix(aSpherePosition, target, ease);
    pos = mix(pos, aSpherePosition, scEase);

    vColor = aColor;
    vAlpha = ease * (1.0 - scEase * 0.85) * 0.3;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mv;
    //size for "Rescratch"
    gl_PointSize = clamp(400.0 / -mv.z, 5.5, 10.5);
  }
`

const cloudFrag = `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.18, 0.5, d)) * vAlpha;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);    
  }
      // gl_FragColor = vec4(0.0, 0.0, 0.0, a);    gl_FragColor = vec4(vColor, a);


`

function ResearchCloud({ count = 3500 }) {
  const scatterRef    = useRef(0)
  const scatterDir    = useRef(0)
  const reformTimer   = useRef(null)

  const basePositions = useMemo(() => sampleLetterPositions('ReScratch', count), [count])

  const { geo, uni } = useMemo(() => {
    const spherePos   = new Float32Array(count * 3)
    const jSpeed      = new Float32Array(count * 3)
    const jOffset     = new Float32Array(count * 3)
    const orbitRadius = new Float32Array(count)
    const orbitPhase  = new Float32Array(count)
    const colors      = new Float32Array(count * 3)
    const delays      = new Float32Array(count)   // per-particle start delay (seconds)
    const durations   = new Float32Array(count)   // per-particle travel duration (seconds)

    // Brand palette for left→center→right gradient
    // Mid-tone lavender keeps the center visible on a near-white page background
    const AMBER  = [1.00, 0.73, 0.25]
    const MIDDLE = [0.72, 0.48, 0.92]  // soft purple bridge
    const TEAL   = [0.18, 0.77, 0.71]

    for (let i = 0; i < count; i++) {
      // Uniform random point on a large sphere — particles fly in from all directions
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 150 + Math.random() * 60
      spherePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      spherePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      spherePos[i * 3 + 2] = r * Math.cos(phi)

      // Random arrival: delay 0–3 s, travel duration 1–4 s
      delays[i]    = Math.random() * 1.0
      durations[i] = 3.0 + Math.random() * 2.0

      jSpeed[i * 3]     = 0.28 + Math.random() * 0.22
      jSpeed[i * 3 + 1] = 0.28 + Math.random() * 0.22
      jSpeed[i * 3 + 2] = 0.28 + Math.random() * 0.22

      jOffset[i * 3]     = Math.random() * Math.PI * 2
      jOffset[i * 3 + 1] = Math.random() * Math.PI * 2
      jOffset[i * 3 + 2] = Math.random() * Math.PI * 2

      orbitRadius[i] = 0.04 + Math.random() * 0.13
      orbitPhase[i]  = Math.random() * Math.PI * 2

      // Horizontal gradient amber→purple→teal
      const tx = (basePositions[i * 3] + 22) / 44  // 0=left, 1=right
      let cr, cg, cb
      if (tx < 0.5) {
        const lt = tx * 2
        cr = AMBER[0] + (MIDDLE[0] - AMBER[0]) * lt
        cg = AMBER[1] + (MIDDLE[1] - AMBER[1]) * lt
        cb = AMBER[2] + (MIDDLE[2] - AMBER[2]) * lt
      } else {
        const rt = (tx - 0.5) * 2
        cr = MIDDLE[0] + (TEAL[0] - MIDDLE[0]) * rt
        cg = MIDDLE[1] + (TEAL[1] - MIDDLE[1]) * rt
        cb = MIDDLE[2] + (TEAL[2] - MIDDLE[2]) * rt
      }
      // Gaussian brightness boost at text center
      const boost = Math.exp(-((tx - 0.5) ** 2) / 0.05) * 0.18
      colors[i * 3]     = Math.min(1, cr + boost)
      colors[i * 3 + 1] = Math.min(1, cg + boost)
      colors[i * 3 + 2] = Math.min(1, cb + boost)
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',       new THREE.BufferAttribute(basePositions.slice(), 3))
    g.setAttribute('aBasePosition',  new THREE.BufferAttribute(basePositions,         3))
    g.setAttribute('aSpherePosition',new THREE.BufferAttribute(spherePos,             3))
    g.setAttribute('aJitterSpeed',   new THREE.BufferAttribute(jSpeed,                3))
    g.setAttribute('aJitterOffset',  new THREE.BufferAttribute(jOffset,               3))
    g.setAttribute('aOrbitRadius',   new THREE.BufferAttribute(orbitRadius,           1))
    g.setAttribute('aOrbitPhase',    new THREE.BufferAttribute(orbitPhase,            1))
    g.setAttribute('aColor',         new THREE.BufferAttribute(colors,                3))
    g.setAttribute('aDelay',         new THREE.BufferAttribute(delays,                1))
    g.setAttribute('aDuration',      new THREE.BufferAttribute(durations,             1))

    return {
      geo: g,
      uni: {
        uTime:   { value: 0 },
        uScatter:{ value: 0 },
      },
    }
  }, [basePositions, count])

  // Click-to-scatter / reform
  useEffect(() => {
    function onScatter() {
      if (scatterRef.current < 0.05) {
        scatterDir.current = 1
        if (reformTimer.current) clearTimeout(reformTimer.current)
        reformTimer.current = setTimeout(() => {
          scatterDir.current = -1
          reformTimer.current = null
        }, 1100)
      } else if (scatterRef.current > 0.95) {
        if (reformTimer.current) clearTimeout(reformTimer.current)
        reformTimer.current = null
        scatterDir.current = -1
      }
    }
    window.addEventListener('particleHeroClick', onScatter)
    return () => window.removeEventListener('particleHeroClick', onScatter)
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    uni.uTime.value = t

    if (scatterDir.current !== 0) {
      scatterRef.current = Math.min(1, Math.max(0,
        scatterRef.current + scatterDir.current * 0.75 * delta
      ))
      uni.uScatter.value = scatterRef.current
      if (scatterDir.current === -1 && scatterRef.current <= 0) scatterDir.current = 0
    }
  })

  return (
    <points geometry={geo}>
      <shaderMaterial
        uniforms={uni}
        vertexShader={cloudVert}
        fragmentShader={cloudFrag}
        blending={THREE.NormalBlending}
        depthWrite={false}
        transparent
      />
    </points>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function ParticleHero() {
  return (
    <ParticleErrorBoundary>
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Canvas
          camera={{ position: [0, 0, 50], fov: 50 }}
          style={{ background: 'transparent', display: 'block' }}
          gl={{ alpha: true, antialias: false }}
          frameloop="always"
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <GalaxyField  count={5500} />
          <ResearchCloud count={3500} />
        </Canvas>
      </div>
    </ParticleErrorBoundary>
  )
}
