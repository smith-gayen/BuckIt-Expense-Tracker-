import { useState, useCallback } from 'react'

export function useCollapsible(initial = false) {
  const [collapsed, setCollapsed] = useState<boolean>(initial)
  const onDoubleClick = useCallback(() => setCollapsed((c) => !c), [])
  const toggle = useCallback(() => setCollapsed((c) => !c), [])
  return { collapsed, onDoubleClick, toggle }
}
