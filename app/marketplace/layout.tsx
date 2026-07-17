import { AppShell } from "@/components/app-shell";
import { MarketplaceNav } from "@/components/marketplace-nav";
import { getPantryContext } from "@/lib/pantry/context";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const pantryContext = await getPantryContext();
  return (
    <AppShell pantryContext={pantryContext}>
      <MarketplaceNav />
      {children}
    </AppShell>
  );
}
