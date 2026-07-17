import { AppShell } from "@/components/app-shell";
import { MarketplaceNav } from "@/components/marketplace-nav";
import { requireSignedInPantryContext } from "@/lib/pantry/require-context";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const pantryContext = await requireSignedInPantryContext();
  return (
    <AppShell pantryContext={pantryContext}>
      <MarketplaceNav />
      {children}
    </AppShell>
  );
}
