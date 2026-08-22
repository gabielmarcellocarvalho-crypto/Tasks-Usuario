"use client";

import { useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { relativeTimeFromNow } from "@/lib/format";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/components/shell/notifications-actions";

type NotificationDTO = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsMenu({ notifications }: { notifications: NotificationDTO[] }) {
  const [, startTransition] = useTransition();
  const unread = notifications.filter((n) => !n.read);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-4.5" />
        {unread.length > 0 ? (
          <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unread.length > 0 ? (
            <button
              className="text-xs font-normal text-muted-foreground hover:text-foreground"
              onClick={() => startTransition(() => markAllNotificationsRead())}
            >
              marcar todas como lidas
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nenhuma notificação.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 whitespace-normal py-2"
                onClick={() => {
                  if (!n.read) startTransition(() => markNotificationRead(n.id));
                }}
              >
                <div className="flex w-full items-center gap-1.5">
                  {!n.read ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                  <span className={n.read ? "text-muted-foreground" : "font-medium"}>
                    {n.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {relativeTimeFromNow(n.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
