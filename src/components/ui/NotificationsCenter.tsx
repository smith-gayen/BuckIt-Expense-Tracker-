'use client'

import { useMemo } from 'react'
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useData } from '@/contexts/DataContext'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function NotificationsCenter() {
  const { state, actions } = useData()
  const confirm = useConfirm()
  const sorted = useMemo(() => {
    return [...state.notifications].sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [state.notifications])

  return (
    <CollapsibleCard title="Notifications" actions={<span className="text-xs text-neutral-600">{sorted.filter(n => !n.read).length} unread</span>}>
      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-600">No notifications</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => (
            <div key={n.id} className={`flex items-start justify-between p-3 rounded-lg border ${n.read ? 'bg-white border-neutral-200' : 'bg-primary-50 border-primary-100'}`}>
              <div className="pr-3 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                <p className="text-xs text-neutral-600 whitespace-pre-wrap">{n.message}</p>
              </div>
              <div className="flex items-center space-x-1">
                {!n.read && (
                  <button className="p-2 text-neutral-400 hover:text-primary-500" title="Mark as read" onClick={() => actions.markNotificationRead(n.id)}>
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button className="p-2 text-neutral-400 hover:text-error" title="Delete" onClick={async () => { const ok = await confirm({ title: 'Delete notification?', message: 'This action is permanent and cannot be undone.', confirmText: 'Delete', cancelText: 'Cancel', tone: 'danger' }); if (ok) actions.deleteNotification(n.id) }}>
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  )
}


