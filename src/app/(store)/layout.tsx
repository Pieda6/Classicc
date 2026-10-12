import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MobileTabBar } from "@/components/store/mobile-tab-bar";
import { CartDrawer } from "@/components/store/cart-drawer";
import { getCurrentUser } from "@/lib/auth";
import { getFreeDeliveryThreshold } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, freeThreshold] = await Promise.all([getCurrentUser(), getFreeDeliveryThreshold()]);
  return (
    <>
      <AnnouncementBar freeThreshold={freeThreshold} />
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main>{children}</main>
      <Footer />
      <MobileTabBar />
      <CartDrawer freeThreshold={freeThreshold} />
    </>
  );
}
