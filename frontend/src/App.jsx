import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store.js'
import { NavHeader } from './components/NavHeader.jsx'
import { HeroPage } from './components/HeroPage.jsx'
import { ExplorePage } from './components/ExplorePage.jsx'
import { LabRoute } from './components/LabRoute.jsx'
import { UploadPage } from './components/UploadPage.jsx'

function AppInner() {
  const loadChallenges = useStore((s) => s.loadChallenges)
  const loadBlocks = useStore((s) => s.loadBlocks)

  useEffect(() => {
    loadChallenges()
    loadBlocks()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A]">
      <NavHeader />
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/lab/:challengeId" element={<LabRoute />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="*" element={<HeroPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
