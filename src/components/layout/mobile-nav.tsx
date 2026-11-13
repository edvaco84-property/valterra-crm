import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { navItems } from "@/components/layout/nav-items";
import { getUnreadWebsiteInquiryCount } from "@/lib/inquiries/queries";

export async function MobileNav() {
  const user = await getSessionUser();

  if (!user) return null;

  const unreadInboxCount = await getUnreadWebsiteInquiryCount(user);
  const visibleNav = navItems
    .map((item) => (item.href === "/inquiries" ? { ...item, badgeCount: unreadInboxCount } : item))
    .filter((item) => !item.roles || hasPermission(user.role, item.roles));

  return <MobileMenu items={visibleNav} />;
}
