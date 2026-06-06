'use client'

import { PropsWithChildren, useMemo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useCollapsible } from '@/hooks/useCollapsible'

interface CollapsibleCardProps {
  title?: string
  actions?: React.ReactNode
  initiallyCollapsed?: boolean
  className?: string
}

export default function CollapsibleCard({
  title,
  actions,
  initiallyCollapsed = false,
  className = '',
  children,
}: PropsWithChildren<CollapsibleCardProps>) {
  const { collapsed, onDoubleClick, toggle } = useCollapsible(initiallyCollapsed)
  const label = useMemo(() => (collapsed ? 'Expand' : 'Collapse'), [collapsed])

  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 select-none" onDoubleClick={onDoubleClick}>
          <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
            {title}
            <button
              type="button"
              onClick={toggle}
              className="p-1 text-neutral-500 hover:text-neutral-700"
              title={label}
              aria-label={label}
            >
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
            </button>
          </h3>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
      {!collapsed && (
        <div>
          {children}
        </div>
      )}
    </div>
  )
}
