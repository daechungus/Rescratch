const BASE = '/api'

export async function fetchChallenges() {
  const res = await fetch(`${BASE}/challenges`)
  if (!res.ok) throw new Error('Failed to fetch challenges')
  return res.json()
}

export async function fetchChallenge(id) {
  const res = await fetch(`${BASE}/challenges/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch challenge ${id}`)
  return res.json()
}

export async function fetchBlocks() {
  const res = await fetch(`${BASE}/blocks`)
  if (!res.ok) throw new Error('Failed to fetch blocks')
  return res.json()
}

export async function generateLab({ file, text, arxivId }) {
  const body = new FormData()
  if (file)    body.append('file', file)
  if (text)    body.append('text', text)
  if (arxivId) body.append('arxiv_id', arxivId)
  const res = await fetch(`${BASE}/generate-lab`, { method: 'POST', body })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to generate lab')
  }
  return res.json()
}

export async function evaluatePipeline(challengeId, pipeline) {
  const res = await fetch(`${BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge_id: challengeId, pipeline }),
  })
  if (!res.ok) throw new Error('Failed to evaluate pipeline')
  return res.json()
}
