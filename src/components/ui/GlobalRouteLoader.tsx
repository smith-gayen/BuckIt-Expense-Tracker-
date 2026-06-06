'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingOverlay from '@/components/ui/LoadingOverlay'

export default function GlobalRouteLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!pathname) return
    setActive(true)
    const t = setTimeout(() => setActive(false), 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()])

  return <LoadingOverlay show={active} durationMs={700} />
}
