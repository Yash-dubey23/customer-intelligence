import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User as UserIcon, X } from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';
import SearchPalette from '../ui/SearchPalette';
import { ml, events as eventsApi } from '../../api/endpoints';
import type { Event } from '../../api/types';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mlStatus, setMlStatus] = useState<'online' | 'offline'>('offline');
  const [mlModel, setMlModel] = useState<string>('');

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Event[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check ML status — interceptor already unwraps .data
    ml.health()
      .then((res: any) => {
        setMlStatus('online');
        setMlModel(res.model || '');
      })
      .catch(() => setMlStatus('offline'));

    // Load recent events as notifications
    eventsApi.list({ size: 8 })
      .then((res: any) => {
        const items = res.content || res || [];
        setNotifications(items);
        // Show unread count based on events in last 24h
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = items.filter((e: Event) => new Date(e.createdAt).getTime() > oneDayAgo);
        setUnreadCount(recent.length);
      })
      .catch(() => {});

    // Ctrl+K to open search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PREDICTION_COMPLETED': return '✓';
      case 'CUSTOMER_ADDED': return '+';
      case 'MOVED_TO_HIGH_RISK': return '⚠';
      case 'SERVICE_UNAVAILABLE': return '✕';
      case 'RETENTION_ACTION': return '◉';
      default: return '•';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center flex-1 gap-3">
          <button
            type="button"
            className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 -ml-1.5"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center text-[13px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full max-w-sm hover:bg-white hover:border-slate-300 transition-colors focus:outline-none"
          >
            <Search size={14} className="mr-2 text-slate-400" />
            <span>Search customers, predictions…</span>
            <kbd className="hidden sm:inline-flex ml-auto text-[10px] font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* ML Service Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider"
            title={`Prediction Service: ${mlStatus}${mlModel ? ` (${mlModel})` : ''}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${mlStatus === 'online' ? 'bg-emerald-500' : 'bg-red-400'}`} />
            <span className={mlStatus === 'online' ? 'text-emerald-600' : 'text-red-500'}>
              {mlStatus === 'online' ? 'ML Online' : 'ML Offline'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUnreadCount(0); }}
              className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <Bell size={18} />
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        No recent activity
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                          <div className="flex gap-3">
                            <span className="mt-0.5 text-xs">{getEventIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-slate-700 leading-snug">{n.message}</p>
                              <p className="text-[11px] text-slate-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <HeadlessMenu as="div" className="relative">
            <HeadlessMenu.Button className="flex items-center gap-2 max-w-xs text-sm rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs border border-indigo-200">
                {user?.name?.charAt(0).toUpperCase() || <UserIcon size={14} />}
              </div>
              <span className="hidden sm:block text-[13px] font-medium text-slate-700 max-w-[100px] truncate">
                {user?.name || 'Account'}
              </span>
            </HeadlessMenu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <HeadlessMenu.Items className="absolute right-0 z-10 mt-1 w-52 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200 focus:outline-none">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <a href="#" className={`block px-4 py-2 text-sm text-slate-700 ${active ? 'bg-slate-50' : ''}`}>
                      Profile
                    </a>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <a href="#" className={`block px-4 py-2 text-sm text-slate-700 ${active ? 'bg-slate-50' : ''}`}>
                      Account settings
                    </a>
                  )}
                </HeadlessMenu.Item>
                <div className="border-t border-slate-100 mt-1" />
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`block w-full text-left px-4 py-2 text-sm text-slate-700 ${active ? 'bg-slate-50' : ''}`}
                    >
                      Sign out
                    </button>
                  )}
                </HeadlessMenu.Item>
              </HeadlessMenu.Items>
            </Transition>
          </HeadlessMenu>
        </div>
      </header>

      <SearchPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
