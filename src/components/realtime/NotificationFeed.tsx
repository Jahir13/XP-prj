import { useStore } from '@nanostores/react';
import { $notificationQueue, clearNotification, clearAllNotifications } from '../../store/notificationQueue';
import { useState } from 'react';

export default function NotificationFeed() {
  const notifications = useStore($notificationQueue);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all cursor-pointer"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
            <span className="text-xs font-semibold text-zinc-300">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/50">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-zinc-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate">{n.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</div>
                    </div>
                    <button
                      onClick={() => clearNotification(n.id)}
                      className="text-zinc-600 hover:text-zinc-400 cursor-pointer text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
