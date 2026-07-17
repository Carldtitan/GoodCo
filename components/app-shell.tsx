import Link from "next/link";
import {
  Archive,
  ClipboardCheck,
  Download,
  GitBranch,
  LayoutDashboard,
  PackagePlus,
  Store,
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { PantryStatus } from "@/components/pantry-status";
import type { PantryContext } from "@/lib/pantry/context";

const navItems = [
  { href: "/", label: "Receive", icon: PackagePlus },
  { href: "/inventory", label: "Inventory", icon: Archive },
  { href: "/expiring", label: "Expiring", icon: ClipboardCheck },
  { href: "/review", label: "Review", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/audit", label: "Audit", icon: GitBranch },
];

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
