import { AppShell } from "@/components/app-shell";
import { MarketplaceNav } from "@/components/marketplace-nav";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <MarketplaceNav />
      {children}
    </AppShell>
  );
}
