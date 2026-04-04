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
// GALAXY FIELD
// Five spiral arms, each colored to a different research domain.
// Rotates slowly around the Z axis in the vertex shader.
// ═══════════════════════════════════════════════════════════════════════════════
const galaxyVert = `
  uniform float uTime;
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aTwinkleSpeed;
  attribute float aTwinkleOffset;
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    // Slow galaxy rotation around Z
    float ga = uTime * 0.016;
    float c = cos(ga), s = sin(ga);
    vec3 rp = vec3(
      position.x * c - position.y * s,
      position.x * s + position.y * c,
      position.z
    );

    vColor = aColor;
    vAlpha = 0.45 + 0.55 * sin(uTime * aTwinkleSpeed + aTwinkleOffset);

    vec4 mv = modelViewMatrix * vec4(rp, 1.0);
    gl_Position  = projectionMatrix * mv;
    //size of galaxy
    gl_PointSize = clamp(aSize * 7500.0 / -mv.z, 0.4, 7.0);
  }
`

const galaxyFrag = `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.15, 0.5, d)) * vAlpha * 0.65;
    gl_FragColor = vec4(vColor, a);
  }
`

function GalaxyField({ count = 5500 }) {
  const { geo, uni } = useMemo(() => {
    const positions     = new Float32Array(count * 3)
    const colors        = new Float32Array(count * 3)
    const sizes         = new Float32Array(count)
    const twinkleSpeeds = new Float32Array(count)
    const twinkleOff    = new Float32Array(count)

    // Research-domain arm colors
    const ARM_COLORS = [
      [0.55, 0.30, 1.00],  // violet  – methods / stats
      [0.18, 0.77, 0.71],  // teal    – data science
      [1.00, 0.73, 0.25],  // amber   – humanities
      [0.35, 0.60, 1.00],  // blue    – natural sciences
      [1.00, 0.45, 0.65],  // rose    – medicine / biology
    ]
    const N_ARMS = ARM_COLORS.length

    for (let i = 0; i < count; i++) {
      const isCore = Math.random() < 0.10
      let x, y, z, col

      if (isCore) {
        const r = Math.pow(Math.random(), 3) * 11
        const a = Math.random() * Math.PI * 2
        x = r * Math.cos(a)
        y = r * Math.sin(a) * 0.38
        z = (Math.random() - 0.5) * 7
        const w = 0.82 + Math.random() * 0.18
        col = [w, w * 0.93, w]
      } else {
        const arm  = Math.floor(Math.random() * N_ARMS)
        const r    = 7 + Math.pow(Math.random(), 0.55) * 82
        const base = (arm / N_ARMS) * Math.PI * 2
        const a    = base + r * 0.072 + (Math.random() - 0.5) * 1.1
        x = r * Math.cos(a)
        y = r * Math.sin(a) * 0.36
        z = (Math.random() - 0.5) * 26
        const sc  = (Math.random() - 0.5) * 0.14
        const bc  = ARM_COLORS[arm]
        col = [
          Math.min(1, bc[0] + sc),
          Math.min(1, bc[1] + sc),
          Math.min(1, bc[2] + sc),
        ]
      }

      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      colors[i * 3]        = col[0]
      colors[i * 3 + 1]    = col[1]
      colors[i * 3 + 2]    = col[2]
      sizes[i]             = 0.5 + Math.random() * 3.2
      twinkleSpeeds[i]     = 0.25 + Math.random() * 1.6
      twinkleOff[i]        = Math.random() * Math.PI * 2
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',      new THREE.BufferAttribute(positions,     3))
    g.setAttribute('aColor',        new THREE.BufferAttribute(colors,        3))
    g.setAttribute('aSize',         new THREE.BufferAttribute(sizes,         1))
    g.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1))
    g.setAttribute('aTwinkleOffset',new THREE.BufferAttribute(twinkleOff,    1))

    return { geo: g, uni: { uTime: { value: 0 } } }
  }, [count])

  useFrame(({ clock }) => { uni.uTime.value = clock.getElapsedTime() })

  return (
    <points geometry={geo}>
      <shaderMaterial
        uniforms={uni}
        vertexShader={galaxyVert}
        fragmentShader={galaxyFrag}
        blending={THREE.AdditiveBlending}
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
    vAlpha = ease * (1.0 - scEase * 0.85);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mv;
    //size for "Rescratch"
    gl_PointSize = clamp(400.0 / -mv.z, 1.5, 10.5);
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
    gl_FragColor = vec4(vColor, a);
  }
`

function ResearchCloud({ count = 3500 }) {
  const scatterRef    = useRef(0)
  const scatterDir    = useRef(0)
  const reformTimer   = useRef(null)

  const basePositions = useMemo(() => sampleLetterPositions('Rescratch', count), [count])

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
      delays[i]    = Math.random() * 3.0
      durations[i] = 1.0 + Math.random() * 3.0

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
    g.setAttribute('position',     new THREE.BufferAttribute(basePositions.slice(), 3))
    g.setAttribute('aBasePosition',new THREE.BufferAttribute(basePositions,         3))
    g.setAttribute('aBoxPosition', new THREE.BufferAttribute(boxPos,                3))
    g.setAttribute('aJitterSpeed', new THREE.BufferAttribute(jSpeed,                3))
    g.setAttribute('aJitterOffset',new THREE.BufferAttribute(jOffset,               3))
    g.setAttribute('aOrbitRadius', new THREE.BufferAttribute(orbitRadius,           1))
    g.setAttribute('aOrbitPhase',  new THREE.BufferAttribute(orbitPhase,            1))
    g.setAttribute('aColor',       new THREE.BufferAttribute(colors,                3))

    return {
      geo: g,
      uni: {
        uTime:    { value: 0 },
        uConverge:{ value: 0 },
        uScatter: { value: 0 },
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
    uni.uTime.value     = t
    uni.uConverge.value = Math.min(1, Math.max(0, (t - 0.4) / 3.5))

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
