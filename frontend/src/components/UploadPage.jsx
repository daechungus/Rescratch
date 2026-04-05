import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Hash, Loader2, AlertCircle, FlaskConical } from 'lucide-react'
import { generateLab } from '../api.js'
import { useStore } from '../store.js'
import { PaperBackground } from './PaperBackground.jsx'

const TABS = [
  { id: 'arxiv', label: 'arXiv ID', icon: Hash },
  { id: 'text',  label: 'Paste Text', icon: FileText },
  { id: 'pdf',   label: 'Upload PDF', icon: Upload },
]

export function UploadPage() {
  const navigate = useNavigate()
  const setGeneratedChallenge = useStore((s) => s.setGeneratedChallenge)
  const selectChallenge = useStore((s) => s.selectChallenge)

  const [activeTab, setActiveTab] = useState('arxiv')
  const [arxivId, setArxivId] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleGenerate() {
    setError(null)
    let payload = {}
    if (activeTab === 'arxiv') {
      if (!arxivId.trim()) { setError('Please enter an arXiv ID or URL.'); return }
      // Accept full URLs like https://arxiv.org/abs/1703.04247 or https://arxiv.org/pdf/1703.04247
      const rawId = arxivId.trim().replace(/.*arxiv\.org\/(?:abs|pdf)\//, '').replace(/\.pdf$/, '').trim()
      payload = { arxivId: rawId }
    } else if (activeTab === 'text') {
      if (!pastedText.trim()) { setError('Please paste some text.'); return }
      payload = { text: pastedText.trim() }
    } else {
      if (!pdfFile) { setError('Please select a PDF file.'); return }
      payload = { file: pdfFile }
    }

    setLoading(true)
    try {
      const challenge = await generateLab(payload)
      setGeneratedChallenge(challenge)
      selectChallenge(challenge)
      navigate('/lab/custom')
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError(null)
    } else {
      setError('Only PDF files are supported.')
    }
  }

  return (
    <div className="relative min-h-screen pt-36 pb-16 overflow-hidden" style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <PaperBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Generate your own lab</h1>
          <p className="text-[#6B6B6B] text-base">
            Can't find your paper? Upload a paper you're reading and get a ReScratch lab in seconds.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E3DE] shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[#E5E3DE]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setError(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-[#2EC4B6] border-b-2 border-[#2EC4B6] bg-[#2EC4B6]/5'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F7F7F5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">

            {activeTab === 'arxiv' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#1A1A1A]">arXiv ID or URL</label>
                <input
                  type="text"
                  value={arxivId}
                  onChange={(e) => setArxivId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. 1703.04247 or https://arxiv.org/abs/1703.04247"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E3DE] text-[#1A1A1A] placeholder-[#9A9A9A] text-sm focus:outline-none focus:border-[#2EC4B6] transition-colors bg-[#F7F7F5]"
                />
                <p className="text-xs text-[#9A9A9A]">
                  Paste the full arXiv URL or just the ID — both work.
                </p>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#1A1A1A]">Abstract or paper text</label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the abstract or a section of the paper here..."
                  rows={7}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E5E3DE] text-[#1A1A1A] placeholder-[#9A9A9A] text-sm focus:outline-none focus:border-[#2EC4B6] transition-colors bg-[#F7F7F5] resize-none"
                />
                <p className="text-xs text-[#9A9A9A]">The abstract alone is usually enough.</p>
              </div>
            )}

            {activeTab === 'pdf' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#1A1A1A]">PDF file</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#2EC4B6] bg-[#2EC4B6]/5'
                      : pdfFile
                      ? 'border-[#2EC4B6] bg-[#2EC4B6]/5'
                      : 'border-[#E5E3DE] bg-[#F7F7F5] hover:border-[#2EC4B6] hover:bg-[#2EC4B6]/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0]
                      if (f) { setPdfFile(f); setError(null) }
                    }}
                  />
                  {pdfFile ? (
                    <>
                      <FileText className="w-8 h-8 text-[#2EC4B6]" />
                      <span className="text-sm text-[#1A1A1A] font-medium">{pdfFile.name}</span>
                      <span className="text-xs text-[#9A9A9A]">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#9A9A9A]" />
                      <span className="text-sm text-[#6B6B6B]">Drag & drop a PDF, or click to browse</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#9A9A9A]">First 20 pages are read. Smaller files are faster.</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2EC4B6] text-white font-semibold text-sm hover:bg-[#239E93] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating your lab…
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  Generate Lab
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#9A9A9A] mt-6">
          Powered by Gemini 2.0 Flash · Requires{' '}
          <code className="bg-[#EFEFEC] px-1 rounded">GEMINI_API_KEY</code> on the server
        </p>
      </div>
    </div>
  )
}

