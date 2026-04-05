import { useState } from 'react'
import { BookOpen, Layers } from 'lucide-react'
import { ContextPanel } from './ContextPanel.jsx'
import { BlockLibrary } from './BlockLibrary.jsx'

const TABS = [
  { id: 'brief',  label: 'Brief',  Icon: BookOpen },
  { id: 'blocks', label: 'Blocks', Icon: Layers   },
]

export function LeftPanel() {
  const [active, setActive] = useState('brief')

  return (
    <aside className="flex-1 flex flex-col bg-white border-r border-[#E5E3DE] overflow-hidden">
      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-[#E5E3DE]">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors
              ${active === id
                ? 'text-[#2EC4B6] border-b-2 border-[#2EC4B6] bg-white'
                : 'text-[#9A9A9A] hover:text-[#1A1A1A] border-b-2 border-transparent bg-[#F7F7F5]'}
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {active === 'brief'
          ? <ContextPanel />
          : <BlockLibrary />}
      </div>
    </aside>
  )
}
