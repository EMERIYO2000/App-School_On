import { useState } from 'react'

export default function Tabs({ tabs, defaultKey, onChange }) {
  const [active, setActive] = useState(defaultKey || tabs[0]?.key)
  const set = (key) => {
    setActive(key)
    onChange?.(key)
  }
  const activeTab = tabs.find((t) => t.key === active) || tabs[0]
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab.key === tab.key}
            onClick={() => set(tab.key)}
            className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab.key === tab.key
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-ink-3 hover:text-ink hover:border-line'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{activeTab.content}</div>
    </div>
  )
}