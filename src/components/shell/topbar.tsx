import { db } from "@/lib/db";
import { MobileNav } from "@/components/shell/mobile-nav";
import { HermesStatusPill } from "@/components/shell/hermes-status-pill";
import { TopbarTitle } from "@/components/shell/topbar-title";
import { GlobalSearch } from "@/components/shell/global-search";
import { QuickCreate } from "@/components/shell/quick-create";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { ProfileMenu } from "@/components/shell/profile-menu";

export async function Topbar() {
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 md:px-4">
      <MobileNav footer={<HermesStatusPill />} />
      <TopbarTitle />

      <div className="ml-2 flex flex-1 justify-center md:ml-6 md:justify-start">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1.5">
        <QuickCreate />
        <NotificationsMenu
          notifications={notifications.map((n) => ({
            ...n,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
        <ProfileMenu />
      </div>
    </header>
  );
}
