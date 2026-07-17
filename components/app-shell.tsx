import Link from "next/link";
import {
  Archive,
  ClipboardCheck,
  LayoutDashboard,
  PackagePlus,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Receive", icon: PackagePlus },
  { href: "/inventory", label: "Inventory", icon: Archive },
  { href: "/expiring", label: "Expiring", icon: ClipboardCheck },
  { href: "/review", label: "Review", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-base font-semibold">
            GoodCo
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-10 items-center gap-2 rounded-panel px-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={2} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">{children}</main>
    </div>
  );
}
