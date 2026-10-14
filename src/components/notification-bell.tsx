"use client";

import { Bell, Check } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  detail: string;
};

export function NotificationBell({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const unread = notifications.length > 0 && !read;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-slate-900 hover:bg-slate-100"
      >
        <Bell className="size-5" />
        {unread ? <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">
            <p className="font-bold text-slate-950">Notifications</p>
            <button type="button" onClick={() => setRead(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
              <Check className="size-3.5" /> Mark read
            </button>
          </div>
          {notifications.length ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div key={notification.id} className="px-2 py-3">
                  <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{notification.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-2 py-6 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
