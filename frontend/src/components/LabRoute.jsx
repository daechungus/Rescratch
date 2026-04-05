import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store.js'
import { Layout } from './Layout.jsx'

export function LabRoute() {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const challenges = useStore((s) => s.challenges)
  const blocks = useStore((s) => s.blocks)
  const isLoading = useStore((s) => s.isLoading)
  const selectChallenge = useStore((s) => s.selectChallenge)
  const currentChallenge = useStore((s) => s.currentChallenge)
  const selectedRef = useRef(null)

  useEffect(() => {
    // Wait for BOTH challenges and block definitions before selecting.
    // Broken-lab pre-fill needs block defs to hydrate canvas blocks correctly.
    if (!challenges.length || !blocks.length) return
    if (selectedRef.current === challengeId) return

    const challenge = challenges.find((c) => c.id === challengeId)
    if (challenge) {
      selectedRef.current = challengeId
      selectChallenge(challenge)
    }
  }, [challenges, blocks, challengeId])

  // Still loading data
  if (isLoading && !challenges.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">
        Loading…
      </div>
    )
  }

  // Data loaded but challenge not found
  if (challenges.length && !challenges.find((c) => c.id === challengeId)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4 text-center">
        <p className="text-gray-400 text-lg">Challenge not found: <code className="text-gray-300">{challengeId}</code></p>
        <button
          onClick={() => navigate('/explore')}
          className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
        >
          Back to Explore
        </button>
      </div>
    )
  }

  // Show spinner while challenge is being set in store
  if (!currentChallenge || currentChallenge.id !== challengeId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">
        Loading…
      </div>
    )
  }

  return <Layout />
}
