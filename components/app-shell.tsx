import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { PantryStatus } from "@/components/pantry-status";
import type { PantryContext } from "@/lib/pantry/context";

const navItems = [
  { href: "/", label: "Receive", icon: "receive" },
  { href: "/inventory", label: "Inventory", icon: "inventory" },
  { href: "/expiring", label: "Expiring", icon: "expiring" },
  { href: "/review", label: "Review", icon: "review" },
  { href: "/marketplace", label: "Marketplace", icon: "marketplace" },
  { href: "/exports", label: "Exports", icon: "exports" },
  { href: "/audit", label: "Audit", icon: "audit" },
] as const;

export function AppShell({
  children,
  pantryContext,
}: {
  children: React.ReactNode;
  pantryContext: PantryContext;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-base font-semibold">
            GoodCo
          </Link>
          <nav aria-label="Primary" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              );
            })}
          </nav>
          <PantryStatus context={pantryContext} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">{children}</main>
    </div>
  );
}
